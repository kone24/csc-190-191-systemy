// Types for the client form and API
import type { StandardizedAddress } from './location';

export interface SocialMediaLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  other?: { [key: string]: string };  // For additional platforms
}

export type Address = StandardizedAddress;

export interface Client {
  id?: string;                 // UUID
  first_name: string;          // Required
  last_name: string;           // Required
  email: string;               // Required
  phone_number: string;        // Required
  title?: string;              // Optional
  business_name: string;       // Required
  industry?: string;           // Optional
  website?: string;            // Optional
  social_links?: SocialMediaLinks; // Optional, JSONB in database
  address: Address;            // Required, JSONB in database
  additional_info?: string;    // Optional
  relationship_owner?: string; // Optional
  status?: string;             // Optional
  contact_medium?: string;     // Optional
  date_of_contact?: string;    // Optional
  where_met?: string;          // Optional
  chat_summary?: string;       // Optional
  outcome?: string;            // Optional
  relationship_status?: string;// Optional
  notes?: string;              // Optional
  tags?: string[];             // Optional
  created_at?: string;         // set by database
  updated_at?: string;         // set by database
}

export type CreateClientRequest = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

// Frontend form state uses camelCase; transformed to snake_case before API call
export interface ClientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  relationshipOwner: string;
  status: string;
  contactMedium: string;
  dateOfContact: string;
  whereMet: string;
  chatSummary: string;
  outcome: string;
  relationshipStatus: string;
  address: Address;
  socialLinks: SocialMediaLinks;
  notes: string;
}
export type CreateClientResponse = { ok: true; client: Client } | { ok: false; message: string };