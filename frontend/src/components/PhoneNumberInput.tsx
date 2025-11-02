import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { E164Number } from 'libphonenumber-js';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string;
}

export function PhoneNumberInput({ value, onChange, error }: PhoneNumberInputProps) {
  return (
    <div>
      <PhoneInput
        international
        countrySelectProps={{ unicodeFlags: true }}
        defaultCountry="US"
        value={value}
        onChange={(value: E164Number | undefined) => onChange(value?.toString())}
        className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}