import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { CreateClientDto } from './dto/create-client.dto';

type InteractionRecord = {
  id: string;
  clientId: string;
  type: string; // 'CALL' | 'EMAIL' etc.
  title?: string;
  body?: string;
  occurredAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

type TransactionRecord = {
  id: string;
  clientId: string;
  status: string;
  amount: number;
  currency?: string;
  issuedAt?: string;
  dueAt?: string;
  description?: string;
  reference?: string;
};

type ClientRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: any;
  title?: string;
  industry?: string;
  website?: string;
  socialLinks?: any;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

type ClientProfileDto = {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    address: any;
    title?: string;
    industry?: string;
    website?: string;
    socialLinks?: any;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
  timeline: {
    items: InteractionRecord[];
    summary: { total: number; byType: Record<string, number> };
  };
  billing: {
    transactions: TransactionRecord[];
    summary: { totalBilled: number; openBalance: number };
  };
  tags: string[];
};

const DATA_PATH = path.resolve(process.cwd(), 'data', 'clients.json');
const INTERACTIONS_PATH = path.resolve(
  process.cwd(),
  'data',
  'interactions.json',
);
const TRANSACTIONS_PATH = path.resolve(
  process.cwd(),
  'data',
  'transactions.json',
);

// helper to read JSON
async function readAll(): Promise<ClientRecord[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const arr = JSON.parse(raw) as ClientRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch (e: any) {
    if (e?.code === 'ENOENT') return [];
    throw e;
  }
}

// helper to write JSON
async function writeAll(items: ClientRecord[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

// helper to read interactions JSON
async function readInteractions(): Promise<InteractionRecord[]> {
  try {
    const raw = await fs.readFile(INTERACTIONS_PATH, 'utf-8');
    const arr = JSON.parse(raw) as InteractionRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch (e: any) {
    if (e?.code === 'ENOENT') return [];
    throw e;
  }
}

// helper to read transactions JSON
async function readTransactions(): Promise<TransactionRecord[]> {
  try {
    const raw = await fs.readFile(TRANSACTIONS_PATH, 'utf-8');
    const arr = JSON.parse(raw) as TransactionRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch (e: any) {
    if (e?.code === 'ENOENT') return [];
    throw e;
  }
}

@Injectable()
export class ClientsService {
  async searchClients(query: string) {
    const items = await readAll();

    if (!query) {
      return items.sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
      );
    }

    const q = query.toLowerCase();

    return items.filter((c) => {
      const first = (c.firstName ?? '').toLowerCase();
      const last = (c.lastName ?? '').toLowerCase();
      const email = (c.email ?? '').toLowerCase();
      const phone = (c.phone ?? '').toLowerCase();
      const company = (c.company ?? '').toLowerCase();
      const website = (c.website ?? '').toLowerCase();
      const notes = (c.notes ?? '').toLowerCase();
      const tags = Array.isArray(c.tags)
        ? c.tags.map((t) => String(t).toLowerCase())
        : [];

      return (
        first.includes(q) ||
        last.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        company.includes(q) ||
        website.includes(q) ||
        notes.includes(q) ||
        tags.some((t) => t.includes(q))
      );
    });
  }

  async createClient(body: CreateClientDto) {
    const firstName = String(body?.firstName ?? '').trim();
    const lastName = String(body?.lastName ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const phone = String(body?.phone ?? '').trim();
    const company = String(body?.company ?? '').trim();
    const address = body?.address ?? undefined;
    const title = body?.title ?? undefined;
    const industry = body?.industry ?? undefined;
    const website = body?.website ?? undefined;
    const socialLinks = body?.socialLinks ?? undefined;
    const notes = body?.notes ?? undefined;
    const tags = Array.isArray(body?.tags)
      ? body.tags.map((t: any) => String(t).trim()).filter(Boolean)
      : undefined;

    if (!firstName || !lastName || !email || !phone || !company || !address) {
      throw new ConflictException('Missing required fields');
    }

    const all = await readAll();

    // Check duplicate email
    if (all.some((c) => (c.email ?? '').toLowerCase() === email)) {
      throw new ConflictException('A client with this email already exists.');
    }

    const now = new Date().toISOString();
    const saved: ClientRecord = {
      id: randomUUID(),
      firstName,
      lastName,
      email,
      phone,
      company,
      address,
      title,
      industry,
      website,
      socialLinks,
      notes,
      tags,
      createdAt: now,
      updatedAt: now,
    };

    all.push(saved);
    await writeAll(all);
    return saved;
  }

  async getClientById(id: string) {
    const all = await readAll();
    const found = all.find((c) => c.id === id);
    if (!found) throw new NotFoundException('Client not found');
    return found;
  }

  async getClientProfile(id: string): Promise<ClientProfileDto> {
    const client = await this.getClientById(id);

    const allInteractions = await readInteractions();
    const allTransactions = await readTransactions();

    const timelineItems = allInteractions
      .filter((i) => i.clientId === id)
      .sort((a, b) =>
        (b.occurredAt ?? b.createdAt).localeCompare(a.occurredAt ?? a.createdAt),
      );

    const transactions = allTransactions
      .filter((t) => t.clientId === id)
      .sort((a, b) => (b.issuedAt ?? '').localeCompare(a.issuedAt ?? ''));

    // Timeline summary
    const byType: Record<string, number> = {};
    for (const item of timelineItems) {
      const t = String(item?.type ?? 'UNKNOWN');
      byType[t] = (byType[t] ?? 0) + 1;
    }

    // Billing summary
    let totalBilled = 0;
    let openBalance = 0;
    for (const tx of transactions) {
      const amount = Number(tx?.amount ?? 0);
      totalBilled += amount;

      const status = String(tx?.status ?? '').toUpperCase();
      if (status === 'OPEN' || status === 'OVERDUE') openBalance += amount;
    }

    return {
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        title: client.title,
        industry: client.industry,
        website: client.website,
        socialLinks: client.socialLinks,
        notes: client.notes,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
      timeline: {
        items: timelineItems,
        summary: {
          total: timelineItems.length,
          byType,
        },
      },
      billing: {
        transactions,
        summary: {
          totalBilled,
          openBalance,
        },
      },
      tags: Array.isArray(client.tags) ? client.tags : [],
    };
  }
}
