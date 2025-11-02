"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Select from 'react-select';
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
      country: { code: "", name: "", flag: "" },
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
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as CreateClientResponse;

      if (res.ok && data.ok) {
        setMessage("Client created successfully!");
        // Brief delay to show success message
        setTimeout(() => router.push("/dashboard"), 1000);
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
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <main className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add New Client</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter the client's information below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            {/* First Name - Required */}
            <div className="mb-6">
              <label className="block">
                <span className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
                    errors.firstName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="John"
                />
              </label>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name - Required */}
            <div className="mb-6">
              <label className="block">
                <span className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
                    errors.lastName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="Doe"
                />
              </label>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* Email - Required */}
            <div className="mb-6">
              <label className="block">
                <span className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="john@example.com"
                  required
                />
              </label>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone - Optional */}
            <div className="mb-6">
              <label className="block">
                <span className="text-sm font-medium">Phone</span>
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
            <div className="mb-6">
              <label className="block">
                <span className="text-sm font-medium">
                  Company <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={form.company}
                  onChange={handleChange("company")}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
                    errors.company
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="Company Name"
                />
              </label>
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            {/* Address - Required */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Street <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.address.street}
                  onChange={handleAddressChange("street")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.address.city}
                  onChange={handleAddressChange("city")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
                            <div>
                <label className="block text-sm font-medium">Country <span className="text-red-500">*</span></label>
                <Select
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
                  className="mt-1"
                  placeholder="Select a country"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: '#1f2937',
                      borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                      '&:hover': {
                        borderColor: '#3b82f6'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: '#1f2937',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#374151' : '#1f2937',
                      color: '#f9fafb',
                      '&:active': {
                        backgroundColor: '#3b82f6'
                      }
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: '#f9fafb'
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#9ca3af'
                    }),
                    input: (base) => ({
                      ...base,
                      color: '#f9fafb'
                    })
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">State/Province <span className="text-red-500">*</span></label>
                <Select
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
                  className="mt-1"
                  placeholder="Select a state/province"
                  isDisabled={!selectedCountry}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: state.isDisabled ? '#111827' : '#1f2937',
                      borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                      opacity: state.isDisabled ? 0.5 : 1,
                      '&:hover': {
                        borderColor: state.isDisabled ? '#4b5563' : '#3b82f6'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: '#1f2937',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#374151' : '#1f2937',
                      color: '#f9fafb',
                      '&:active': {
                        backgroundColor: '#3b82f6'
                      }
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: '#f9fafb'
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#9ca3af'
                    }),
                    input: (base) => ({
                      ...base,
                      color: '#f9fafb'
                    })
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Postal Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.address.postalCode}
                  onChange={handleAddressChange("postalCode")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Postal Code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Additional Info</label>
                <input
                  type="text"
                  value={form.address.additionalInfo}
                  onChange={handleAddressChange("additionalInfo")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Apt, suite, etc."
                />
              </div>
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}

            {/* Social Media Links - Optional */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">LinkedIn</label>
                <input
                  type="url"
                  value={form.socialLinks?.linkedin || ""}
                  onChange={handleSocialChange("linkedin")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Twitter</label>
                <input
                  type="url"
                  value={form.socialLinks?.twitter || ""}
                  onChange={handleSocialChange("twitter")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Facebook</label>
                <input
                  type="url"
                  value={form.socialLinks?.facebook || ""}
                  onChange={handleSocialChange("facebook")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Instagram</label>
                <input
                  type="url"
                  value={form.socialLinks?.instagram || ""}
                  onChange={handleSocialChange("instagram")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            {/* Notes - Optional */}
            <div>
              <label className="block">
                <span className="text-sm font-medium">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={handleChange("notes")}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Additional notes about the client..."
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Client"}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`mt-4 rounded-md p-4 ${
                message.includes("success")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}