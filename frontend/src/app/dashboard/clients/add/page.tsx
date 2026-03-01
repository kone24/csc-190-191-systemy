"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Select from 'react-select';
import Sidebar from '@/components/Sidebar';
import type { ClientFormState, Address, SocialMediaLinks } from "@/types/client";
import { COUNTRIES, STATES_BY_COUNTRY } from "@/constants/location-data";
import { PhoneNumberInput } from "@/components/PhoneNumberInput";
import type { Country, State } from "@/types/location";

type FormErrors = Partial<Record<keyof ClientFormState, string>>;

export default function AddClientPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const availableStates = useMemo(() =>
    selectedCountry ? STATES_BY_COUNTRY[selectedCountry.code] || [] : [],
    [selectedCountry]
  );

  const [form, setForm] = useState<ClientFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    relationshipOwner: "",
    status: "",
    contactMedium: "",
    dateOfContact: "",
    whereMet: "",
    chatSummary: "",
    outcome: "",
    relationshipStatus: "",
    address: {
      street: "",
      city: "",
      state: { code: "", name: "" },
      postalCode: "",
      country: { code: "", name: "" },
      additionalInfo: "",
    },
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      other: {},
    },
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  function validateForm(): FormErrors {
    const newErrors: FormErrors = {};
    const MAX_LENGTH = 255;

    // First name is always required
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (form.firstName.length > MAX_LENGTH) {
      newErrors.firstName = `First name must be less than ${MAX_LENGTH} characters`;
    }

    // At least one of email or phone is required
    if (!form.email.trim() && !form.phone.trim()) {
      newErrors.email = "Email or phone number is required";
    }

    // Optional length validations
    if (form.lastName && form.lastName.length > MAX_LENGTH) {
      newErrors.lastName = `Last name must be less than ${MAX_LENGTH} characters`;
    }

    if (form.email && form.email.length > MAX_LENGTH) {
      newErrors.email = `Email must be less than ${MAX_LENGTH} characters`;
    }

    if (form.company && form.company.length > MAX_LENGTH) {
      newErrors.company = `Company name must be less than ${MAX_LENGTH} characters`;
    }

    // Address length validation (all optional)
    const address = form.address;
    if (address.street && address.street.length > MAX_LENGTH) {
      newErrors.address = `Street must be less than ${MAX_LENGTH} characters`;
    }
    if (address.city && address.city.length > MAX_LENGTH) {
      newErrors.address = `City must be less than ${MAX_LENGTH} characters`;
    }
    if (address.postalCode && address.postalCode.length > 20) {
      newErrors.address = "Postal code is too long";
    }
    if (address.additionalInfo && address.additionalInfo.length > MAX_LENGTH) {
      newErrors.address = `Additional address info must be less than ${MAX_LENGTH} characters`;
    }

    // Social media URL validation (optional)
    if (form.socialLinks) {
      const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

      Object.entries(form.socialLinks).forEach(([platform, url]) => {
        if (url && typeof url === 'string') {
          if (!urlRegex.test(url)) {
            newErrors.socialLinks = `Invalid ${platform} URL format`;
          } else if (url.length > MAX_LENGTH) {
            newErrors.socialLinks = `${platform} URL must be less than ${MAX_LENGTH} characters`;
          }
        }
      });
    }

    // Notes length validation (optional)
    if (form.notes && form.notes.length > 1000) {
      newErrors.notes = "Notes must be less than 1000 characters";
    }

    return newErrors;
  }

  const handleChange = (field: keyof ClientFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // For nested address fields
  const handleAddressChange = (field: keyof Address) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: e.target.value },
    }));
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: undefined }));
    }
  };

  // For nested socialLinks fields
  const handleSocialChange = (field: keyof SocialMediaLinks) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: e.target.value },
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    // Validate form
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Transform frontend form data to match backend API format (snake_case for Supabase)
      const clientData = {
        first_name: form.firstName,
        last_name: form.lastName,
        business_name: form.company,
        email: form.email,
        phone_number: form.phone || "",
        address: {
          street: form.address.street,
          city: form.address.city,
          state: form.address.state.name,
          zip_code: form.address.postalCode,
          country: form.address.country.name,
          additional_info: form.address.additionalInfo || ""
        },
        // Default values for required backend fields
        services_needed: ["General Services"],
        project_timeline: "To be determined",
        budget_range: "To be determined",
        preferred_contact_method: "email",
        additional_info: form.notes || "",
        // Optional: Include social media
        social_links: form.socialLinks || {},
        // CRM fields
        title: form.title || undefined,
        relationship_owner: form.relationshipOwner || undefined,
        status: form.status || undefined,
        contact_medium: form.contactMedium || undefined,
        date_of_contact: form.dateOfContact || undefined,
        where_met: form.whereMet || undefined,
        chat_summary: form.chatSummary || undefined,
        outcome: form.outcome || undefined,
        relationship_status: form.relationshipStatus || undefined
      };

      // Call your NestJS backend (correct port: 3001)
      const res = await fetch("http://localhost:3001/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      // Add better error handling for non-JSON responses
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        const errorText = await res.text();
        console.error("Response was not JSON:", errorText);
        console.error("Response status:", res.status);
        setMessage(`❌ Server error: ${res.status} - Invalid response format`);
        return;
      }

      if (res.ok && data.ok) {
        setMessage(`✅ Contact created successfully! ID: ${data.client.id}`);
        // Brief delay to show success message, then redirect
        setTimeout(() => router.push("/dashboard/clients"), 2000);
      } else {
        setMessage(`❌ ${data.message || "Failed to create contact"}`);
      }
    } catch (err) {
      console.error("Error creating client:", err);
      setMessage("❌ Network error: Could not connect to server. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
      {/* Sidebar */}
      <Sidebar activePage="clients" />

      {/* Main Content Area */}
      <div style={{ flex: 1, minHeight: '100vh', background: '#f9fafb', padding: '32px 30px' }}>
        <main style={{ margin: '0 auto', maxWidth: '672px', padding: '0 16px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#000', fontFamily: 'Poppins' }}>Add New Contact</h1>
            <p style={{ marginTop: '8px', color: '#6b7280', fontFamily: 'Poppins' }}>
              Enter the contact's information below
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ borderRadius: '8px', background: '#ffffff', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              {/* First Name - Required */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                    First Name <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: errors.firstName ? '1px solid #fca5a5' : '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="John"
                  />
                </label>
                {errors.firstName && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{errors.firstName}</p>
                )}
              </div>

              {/* Last Name - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                    Last Name
                  </span>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: errors.lastName ? '1px solid #fca5a5' : '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="Doe"
                  />
                </label>
                {errors.lastName && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{errors.lastName}</p>
                )}
              </div>

              {/* Email - Required if no phone */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                    Email <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>(email or phone required)</span>
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: errors.email ? '1px solid #fca5a5' : '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="john@example.com"
                  />
                </label>
                {errors.email && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{errors.email}</p>
                )}
              </div>

              {/* Phone - Required if no email */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Phone</span>
                  <PhoneNumberInput
                    value={form.phone}
                    onChange={(value) => {
                      setForm(prev => ({ ...prev, phone: value || "" }));
                      if (errors.phone) {
                        setErrors(prev => ({ ...prev, phone: undefined }));
                      }
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    error={errors.phone}
                  />
                </label>
              </div>

              {/* Company - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                    Company
                  </span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={handleChange("company")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: errors.company ? '1px solid #fca5a5' : '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="Company Name"
                  />
                </label>
                {errors.company && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{errors.company}</p>
                )}
              </div>

              {/* Title - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={handleChange("title")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="e.g. VP of Engineering"
                  />
                </label>
              </div>

              {/* Relationship Owner - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Relationship Owner</span>
                  <input
                    type="text"
                    value={form.relationshipOwner}
                    onChange={handleChange("relationshipOwner")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="Team member managing this contact"
                  />
                </label>
              </div>

              {/* Status - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Status</span>
                  <input
                    type="text"
                    value={form.status}
                    onChange={handleChange("status")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="e.g. Active, Inactive"
                  />
                </label>
              </div>

              {/* Contact Medium - Optional (Dropdown) */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Contact Medium</span>
                  <select
                    value={form.contactMedium}
                    onChange={handleChange("contactMedium")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Select a contact medium</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="DM">DM</option>
                  </select>
                </label>
              </div>

              {/* Date of Contact - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Date of Contact</span>
                  <input
                    type="date"
                    value={form.dateOfContact}
                    onChange={handleChange("dateOfContact")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                  />
                </label>
              </div>

              {/* Where Met - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Where Met</span>
                  <input
                    type="text"
                    value={form.whereMet}
                    onChange={handleChange("whereMet")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="e.g. Tech Conference 2026"
                  />
                </label>
              </div>

              {/* Chat Summary - Optional (Textarea) */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Chat Summary</span>
                  <textarea
                    value={form.chatSummary}
                    onChange={handleChange("chatSummary")}
                    rows={3}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      resize: 'vertical'
                    }}
                    placeholder="Summary of what was discussed..."
                  />
                </label>
              </div>

              {/* Outcome - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Outcome</span>
                  <input
                    type="text"
                    value={form.outcome}
                    onChange={handleChange("outcome")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="e.g. Follow-up scheduled"
                  />
                </label>
              </div>

              {/* Relationship Status - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Relationship Status</span>
                  <input
                    type="text"
                    value={form.relationshipStatus}
                    onChange={handleChange("relationshipStatus")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="e.g. Warm, Cold, Hot"
                  />
                </label>
              </div>

              {/* Address - Optional */}
              <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Street</label>
                  <input
                    type="text"
                    value={form.address.street}
                    onChange={handleAddressChange("street")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>City</label>
                  <input
                    type="text"
                    value={form.address.city}
                    onChange={handleAddressChange("city")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Country</label>
                  <Select<Country>
                    instanceId="country-select"
                    options={COUNTRIES}
                    value={selectedCountry}
                    onChange={(selected) => {
                      setSelectedCountry(selected);
                      if (selected) {
                        setForm(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            country: selected,
                            // Reset state when country changes
                            state: { code: "", name: "" }
                          }
                        }));
                      }
                    }}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.code}
                    placeholder="Select a country"
                    styles={{
                      control: (base: any, state: any) => ({
                        ...base,
                        marginTop: '4px',
                        backgroundColor: '#ffffff',
                        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                          borderColor: '#3b82f6'
                        }
                      }),
                      menu: (base: any) => ({
                        ...base,
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db'
                      }),
                      option: (base: any, state: any) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : '#ffffff',
                        color: state.isSelected ? '#ffffff' : '#000000',
                        '&:active': {
                          backgroundColor: '#3b82f6'
                        }
                      }),
                      singleValue: (base: any) => ({
                        ...base,
                        color: '#000000'
                      }),
                      placeholder: (base: any) => ({
                        ...base,
                        color: '#6b7280'
                      }),
                      input: (base: any) => ({
                        ...base,
                        color: '#000000'
                      })
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>State/Province</label>
                  <Select<State>
                    instanceId="state-select"
                    options={availableStates}
                    value={availableStates.find(s => s.code === form.address.state.code)}
                    onChange={(selected) => {
                      if (selected) {
                        setForm(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            state: selected
                          }
                        }));
                      }
                    }}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.code}
                    placeholder="Select a state/province"
                    isDisabled={!selectedCountry}
                    styles={{
                      control: (base: any, state: any) => ({
                        ...base,
                        marginTop: '4px',
                        backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
                        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        opacity: state.isDisabled ? 0.5 : 1,
                        '&:hover': {
                          borderColor: state.isDisabled ? '#d1d5db' : '#3b82f6'
                        }
                      }),
                      menu: (base: any) => ({
                        ...base,
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db'
                      }),
                      option: (base: any, state: any) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : '#ffffff',
                        color: state.isSelected ? '#ffffff' : '#000000',
                        '&:active': {
                          backgroundColor: '#3b82f6'
                        }
                      }),
                      singleValue: (base: any) => ({
                        ...base,
                        color: '#000000'
                      }),
                      placeholder: (base: any) => ({
                        ...base,
                        color: '#6b7280'
                      }),
                      input: (base: any) => ({
                        ...base,
                        color: '#000000'
                      })
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Postal Code</label>
                  <input
                    type="text"
                    value={form.address.postalCode}
                    onChange={handleAddressChange("postalCode")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="Postal Code"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Additional Info</label>
                  <input
                    type="text"
                    value={form.address.additionalInfo}
                    onChange={handleAddressChange("additionalInfo")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="Apt, suite, etc."
                  />
                </div>
              </div>
              {errors.address && (
                <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{errors.address}</p>
              )}

              {/* Social Media Links - Optional */}
              <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>LinkedIn</label>
                  <input
                    type="url"
                    value={form.socialLinks?.linkedin || ""}
                    onChange={handleSocialChange("linkedin")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Twitter</label>
                  <input
                    type="url"
                    value={form.socialLinks?.twitter || ""}
                    onChange={handleSocialChange("twitter")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Facebook</label>
                  <input
                    type="url"
                    value={form.socialLinks?.facebook || ""}
                    onChange={handleSocialChange("facebook")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="https://facebook.com/username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Instagram</label>
                  <input
                    type="url"
                    value={form.socialLinks?.instagram || ""}
                    onChange={handleSocialChange("instagram")}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins'
                    }}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>

              {/* Notes - Optional */}
              <div>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>Notes</span>
                  <textarea
                    value={form.notes}
                    onChange={handleChange("notes")}
                    rows={4}
                    style={{
                      marginTop: '4px',
                      display: 'block',
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      resize: 'vertical'
                    }}
                    placeholder="Additional notes about the contact..."
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => router.push("/dashboard/clients")}
                disabled={loading}
                style={{
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  background: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  borderRadius: '6px',
                  background: loading ? '#9ca3af' : '#2563eb',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins'
                }}
              >
                {loading ? "Creating..." : "Create Contact"}
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div
                style={{
                  marginTop: '16px',
                  borderRadius: '6px',
                  padding: '16px',
                  background: message.includes("success") ? '#f0fdf4' : '#fef2f2',
                  color: message.includes("success") ? '#166534' : '#991b1b',
                  fontFamily: 'Poppins'
                }}
              >
                {message}
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}