// Keep sections grouped like the desired UI for client profile views
export type InteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK';

export interface ClientContactDto {
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
  company?: string;
  relationship_owner?: string;
  status?: string;
  contact_medium?: string;
  date_of_contact?: string;
  where_met?: string;
  chat_summary?: string;
  outcome?: string;
  relationship_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
