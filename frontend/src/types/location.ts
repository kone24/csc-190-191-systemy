export interface Country {
  code: string;  // ISO 3166-1 alpha-2
  name: string;
  flag: string;
}

export interface State {
  code: string;  // State/Province code
  name: string;
}

// Update the Address interface to use standardized types
export interface StandardizedAddress {
  street: string;
  city: string;
  state: {
    code: string;
    name: string;
  };
  postalCode: string;
  country: {
    code: string;
    name: string;
    flag: string;
  };
  additionalInfo?: string;
}