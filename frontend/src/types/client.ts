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
  tags?: string[];             // Optional
  created_at?: string;         // set by database
  updated_at?: string;         // set by database
}

export type CreateClientRequest = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateClientResponse = { ok: true; client: Client } | { ok: false; message: string };