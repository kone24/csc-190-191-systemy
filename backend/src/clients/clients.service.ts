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
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  business_name: string;
  address: any;
  title?: string;
  industry?: string;
  website?: string;
  social_links?: any;
  additional_info?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
};

type ClientProfileDto = {
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    business_name: string;
    address: any;
    title?: string;
    industry?: string;
    website?: string;
    social_links?: any;
    additional_info?: string;
    created_at: string;
    updated_at: string;
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
        (b.created_at ?? '').localeCompare(a.created_at ?? ''),
      );
    }

    const q = query.toLowerCase();

    return items.filter((c) => {
      const first = (c.first_name ?? '').toLowerCase();
      const last = (c.last_name ?? '').toLowerCase();
      const email = (c.email ?? '').toLowerCase();
      const phone = (c.phone_number ?? '').toLowerCase();
      const company = (c.business_name ?? '').toLowerCase();
      const website = (c.website ?? '').toLowerCase();
      const notes = (c.additional_info ?? '').toLowerCase();
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
    const first_name = String(body?.first_name ?? '').trim();
    const last_name = String(body?.last_name ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const phone_number = String(body?.phone_number ?? '').trim();
    const business_name = String(body?.business_name ?? '').trim();
    const address = body?.address ?? undefined;
    const title = body?.title ?? undefined;
    const industry = body?.industry ?? undefined;
    const website = body?.website ?? undefined;
    const social_links = body?.social_links ?? undefined;
    const additional_info = body?.additional_info ?? undefined;
    const tags = Array.isArray(body?.tags)
      ? body.tags.map((t: any) => String(t).trim()).filter(Boolean)
      : undefined;

    if (!first_name || !last_name || !email || !phone_number || !business_name) {
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
      first_name,
      last_name,
      email,
      phone_number,
      business_name,
      address,
      title,
      industry,
      website,
      social_links,
      additional_info,
      tags,
      created_at: now,
      updated_at: now,
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
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone_number: client.phone_number,
        business_name: client.business_name,
        address: client.address,
        title: client.title,
        industry: client.industry,
        website: client.website,
        social_links: client.social_links,
        additional_info: client.additional_info,
        created_at: client.created_at,
        updated_at: client.updated_at,
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
