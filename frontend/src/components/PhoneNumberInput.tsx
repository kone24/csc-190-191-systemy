import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input';
import type { E164Number } from 'libphonenumber-js';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string;
}

function toE164(raw: string): E164Number | undefined {
  if (!raw) return undefined;
  // Already E.164
  if (/^\+\d+$/.test(raw)) return raw as E164Number;
  // Try to parse as-is (may work if number includes country code without +)
  try {
    const parsed = parsePhoneNumber(raw, 'US');
    if (parsed?.isValid()) return parsed.number as E164Number;
  } catch {
    // fall through
  }
  return undefined;
}

export function PhoneNumberInput({ value, onChange, error }: PhoneNumberInputProps) {
  return (
    <div>
      <PhoneInput
        international
        countrySelectProps={{ unicodeFlags: true }}
        defaultCountry="US"
        value={toE164(value)}
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