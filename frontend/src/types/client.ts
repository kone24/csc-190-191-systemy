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
  id?: string;           // UUID
  firstName: string;     // Required
  lastName: string;      // Required
  email: string;        // Required
  phone: string;        // Required
  title?: string;       // Optional
  company: string;      // Required
  industry?: string;    // Optional
  website?: string;     // Optional
  socialLinks?: SocialMediaLinks; // Optional, JSONB in database
  address: Address;     // Required, JSONB in database
  notes?: string;       // Optional
  tags?: string[];      // Optional
  createdAt?: string;   // set by database
  updatedAt?: string;   // set by database
}

export type CreateClientRequest = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateClientResponse = { ok: true; client: Client } | { ok: false; message: string };