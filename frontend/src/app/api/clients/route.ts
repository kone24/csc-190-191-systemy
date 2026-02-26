import { NextResponse } from "next/server";
import type { CreateClientResponse, Client } from "@/types/client";

interface CreateClientRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  business_name: string;
  address: {
    street: string;
    city: string;
    state: { code: string; name: string };
    postalCode: string;
    country: { code: string; name: string };
    additionalInfo?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    other?: { [key: string]: string };
  };
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateClientRequest;
    const { first_name, last_name, email, phone_number, business_name, address, social_links, additional_info } = body;

    // Server-side validation (will move to backend)

    if (!email?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!first_name?.trim()) {
      return NextResponse.json(
        { ok: false, message: "First name is required" },
        { status: 400 }
      );
    }

    if (!last_name?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Last name is required" },
        { status: 400 }
      );
    }

    if (!phone_number?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!business_name?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Company is required" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate address fields if provided
    if (address?.street && !address.street.trim()) {
      return NextResponse.json(
        { ok: false, message: "Street address is required" },
        { status: 400 }
      );
    }

    if (address?.city && !address.city.trim()) {
      return NextResponse.json(
        { ok: false, message: "City is required" },
        { status: 400 }
      );
    }

    const client: Client = {
      id: crypto.randomUUID(),
      first_name,
      last_name,
      email,
      phone_number: phone_number || '',
      business_name: business_name || '',
      address: address || {
        street: "",
        city: "",
        state: { code: "", name: "" },
        postalCode: "",
        country: { code: "", name: "" },
        additionalInfo: ""
      },
      // Optional fields
      title: undefined,
      industry: undefined,
      website: undefined,
      social_links: social_links,
      additional_info: additional_info || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Simulate network latency for better UX testing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response: CreateClientResponse = { ok: true, client };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create client" },
      { status: 500 }
    );
  }
}