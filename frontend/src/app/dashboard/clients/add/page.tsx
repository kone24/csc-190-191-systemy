"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Select from 'react-select';
import Sidebar from '@/components/Sidebar';
import type { CreateClientRequest, CreateClientResponse, Address, SocialMediaLinks } from "@/types/client";
import { COUNTRIES, STATES_BY_COUNTRY } from "@/constants/location-data";
import { PhoneNumberInput } from "@/components/PhoneNumberInput";
import type { Country, State } from "@/types/location";

type FormErrors = Partial<Record<keyof CreateClientRequest, string>>;

export default function AddClientPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const availableStates = useMemo(() =>
    selectedCountry ? STATES_BY_COUNTRY[selectedCountry.code] || [] : [],
    [selectedCountry]
  );

  const [form, setForm] = useState<CreateClientRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
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

    // Required fields with length validation
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (form.firstName.length > MAX_LENGTH) {
      newErrors.firstName = `First name must be less than ${MAX_LENGTH} characters`;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (form.lastName.length > MAX_LENGTH) {
      newErrors.lastName = `Last name must be less than ${MAX_LENGTH} characters`;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (form.email.length > MAX_LENGTH) {
      newErrors.email = `Email must be less than ${MAX_LENGTH} characters`;
    }

    if (!form.company.trim()) {
      newErrors.company = "Company is required";
    } else if (form.company.length > MAX_LENGTH) {
      newErrors.company = `Company name must be less than ${MAX_LENGTH} characters`;
    }

    // Address validation
    const address = form.address;
    if (!address.street.trim()) {
      newErrors.address = "Street is required";
    } else if (address.street.length > MAX_LENGTH) {
      newErrors.address = `Street must be less than ${MAX_LENGTH} characters`;
    }

    if (!address.city.trim()) {
      newErrors.address = "City is required";
    } else if (address.city.length > MAX_LENGTH) {
      newErrors.address = `City must be less than ${MAX_LENGTH} characters`;
    }

    if (!address.state.code) {
      newErrors.address = "State is required";
    }

    if (!address.postalCode.trim()) {
      newErrors.address = "Postal code is required";
    } else if (address.postalCode.length > 20) { // Postal codes are typically shorter
      newErrors.address = "Postal code is too long";
    }

    if (!address.country.code) {
      newErrors.address = "Country is required";
    }

    // Optional fields validation
    if (address.additionalInfo && address.additionalInfo.length > MAX_LENGTH) {
      newErrors.address = `Additional address info must be less than ${MAX_LENGTH} characters`;
    }

    // Phone validation handled by PhoneNumberInput component

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
    if (form.notes && form.notes.length > 1000) { // Allow longer notes
      newErrors.notes = "Notes must be less than 1000 characters";
    }

    return newErrors;
  }

  const handleChange = (field: keyof CreateClientRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      const res = await fetch("http://localhost:3001/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as CreateClientResponse;

      if (res.ok && data.ok) {
        setMessage("Client created successfully!");
        // Brief delay to show success message
        setTimeout(() => router.push("/dashboard/clients"), 1000);
      } else {
        setMessage(data.ok === false ? data.message : "Failed to create client");
      }
    } catch (err) {
      console.error("Error creating client:", err);
      setMessage("An error occurred while creating the client");
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
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#000', fontFamily: 'Inter' }}>Add New Client</h1>
            <p style={{ marginTop: '8px', color: '#6b7280', fontFamily: 'Inter' }}>
              Enter the client's information below
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ borderRadius: '8px', background: '#ffffff', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              {/* First Name - Required */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="John"
                  />
                </label>
                {errors.firstName && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Inter' }}>{errors.firstName}</p>
                )}
              </div>

              {/* Last Name - Required */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>
                    Last Name <span style={{ color: '#ef4444' }}>*</span>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="Doe"
                  />
                </label>
                {errors.lastName && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Inter' }}>{errors.lastName}</p>
                )}
              </div>

              {/* Email - Required */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>
                    Email <span style={{ color: '#ef4444' }}>*</span>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="john@example.com"
                    required
                  />
                </label>
                {errors.email && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Inter' }}>{errors.email}</p>
                )}
              </div>

              {/* Phone - Optional */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Phone</span>
                  <PhoneNumberInput
                    value={form.phone}
                    onChange={(value) => {
                      setForm(prev => ({ ...prev, phone: value || "" }));
                      if (errors.phone) {
                        setErrors(prev => ({ ...prev, phone: undefined }));
                      }
                    }}
                    error={errors.phone}
                  />
                </label>
              </div>

              {/* Company - Required */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>
                    Company <span style={{ color: '#ef4444' }}>*</span>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="Company Name"
                  />
                </label>
                {errors.company && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Inter' }}>{errors.company}</p>
                )}
              </div>

              {/* Address - Required */}
              <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Street <span style={{ color: '#ef4444' }}>*</span></label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>City <span style={{ color: '#ef4444' }}>*</span></label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Country <span style={{ color: '#ef4444' }}>*</span></label>
                  <Select
                    options={COUNTRIES}
                    value={selectedCountry}
                    onChange={(selected: Country | null) => {
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
                    getOptionLabel={(option: Country) => option.name}
                    getOptionValue={(option: Country) => option.code}
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>State/Province <span style={{ color: '#ef4444' }}>*</span></label>
                  <Select
                    options={availableStates}
                    value={availableStates.find(s => s.code === form.address.state.code)}
                    onChange={(selected: State | null) => {
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
                    getOptionLabel={(option: State) => option.name}
                    getOptionValue={(option: State) => option.code}
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Postal Code <span style={{ color: '#ef4444' }}>*</span></label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="Postal Code"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Additional Info</label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="Apt, suite, etc."
                  />
                </div>
              </div>
              {errors.address && (
                <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Inter' }}>{errors.address}</p>
              )}

              {/* Social Media Links - Optional */}
              <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>LinkedIn</label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Twitter</label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Facebook</label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="https://facebook.com/username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Instagram</label>
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
                      fontFamily: 'Inter'
                    }}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>

              {/* Notes - Optional */}
              <div>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Notes</span>
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
                      fontFamily: 'Inter',
                      resize: 'vertical'
                    }}
                    placeholder="Additional notes about the client..."
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
                  fontFamily: 'Inter'
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
                  fontFamily: 'Inter'
                }}
              >
                {loading ? "Creating..." : "Create Client"}
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
                  fontFamily: 'Inter'
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