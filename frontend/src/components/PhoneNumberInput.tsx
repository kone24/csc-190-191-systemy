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
        style={{
          marginTop: '4px',
          display: 'block',
          width: '100%',
          borderRadius: '6px',
          border: error ? '1px solid #fca5a5' : '1px solid #d1d5db',
          padding: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          outline: 'none',
          fontFamily: 'Poppins'
        }}
      />
      {error && <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{error}</p>}
    </div>
  );
}