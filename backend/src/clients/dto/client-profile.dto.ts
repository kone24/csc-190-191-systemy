// Keep sections grouped like the desired UI for client profile views
export type InteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK';

export interface ClientContactDto {
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
}

export interface TimelineItemDto {
  id: string;
  clientId: string;
  type: InteractionType | string;
  title?: string | null;
  body?: string | null;
  occurredAt?: string | null; // ISO
  createdAt?: string | null;  // ISO
  updatedAt?: string | null;  // ISO
  tags?: string[];
}

export interface TimelineDto {
  items: TimelineItemDto[];
  summary: {
    total: number;
    byType: Record<string, number>;
  };
}

export interface TransactionDto {
  id: string;
  clientId: string;
  status: string;
  amount: number;
  currency?: string;
  issuedAt?: string | null;
  dueAt?: string | null;
  description?: string | null;
  reference?: string | null;
}

export interface BillingDto {
  transactions: TransactionDto[];
  summary: {
    totalBilled: number;
    openBalance: number;
  };
}

export interface ClientProfileDto {
  client: ClientContactDto;
  timeline: TimelineDto;
  billing: BillingDto;
  tags: string[];
}
