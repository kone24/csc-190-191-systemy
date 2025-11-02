import { NextResponse } from "next/server";
import type { CreateClientResponse, Client } from "@/types/client";

interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateClientRequest;
    const { firstName, lastName, email, phone, company, notes } = body;

    // Server-side validation (will move to backend)

    if (!email?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!firstName?.trim()) {
      return NextResponse.json(
        { ok: false, message: "First name is required" },
        { status: 400 }
      );
    }

    if (!lastName?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Last name is required" },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!company?.trim()) {
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

    const client: Client = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      email,
      phone: phone || '',  // Required field, shouldn't be null
      company: company || '', // Required field, shouldn't be null
      address: {
        street: "",
        city: "",
        state: { code: "", name: "" },
        postalCode: "",
        country: { code: "", name: "", flag: "" },
        additionalInfo: ""
      },
      // Optional fields
      title: undefined,
      industry: undefined,
      website: undefined,
      socialLinks: undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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