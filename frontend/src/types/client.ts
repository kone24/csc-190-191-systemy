// Types for the client form and API
import type { StandardizedAddress } from './location';

export interface SocialMediaLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  other?: { [key: string]: string };  // For additional platforms
}

// Address as stored in the database (flat strings, zip_code key)
export interface ApiAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  additional_info?: string;
}

// Address used by the frontend form (nested objects, postalCode key)
export type Address = StandardizedAddress;

export interface Client {
  id?: string;                 // UUID
  first_name: string;          // Required
  last_name?: string;
  email?: string;
  phone_number?: string;
  title?: string;              // Optional
  business_name?: string;
  company?: string;            // Optional
  industry?: string;           // Optional
  website?: string;            // Optional
  social_links?: SocialMediaLinks; // Optional, JSONB in database
  address?: ApiAddress;        // Optional, JSONB in database
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

export type CreateClientRequest = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

// Frontend form state uses camelCase; transformed to snake_case before API call
export interface ClientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  industry: string;
  website: string;
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