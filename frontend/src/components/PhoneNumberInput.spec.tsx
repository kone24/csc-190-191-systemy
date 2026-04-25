import React from 'react';
import { render, screen } from '@testing-library/react';
import { PhoneNumberInput } from './PhoneNumberInput';

// ---------------------------------------------------------------------------
// Mock react-phone-number-input (jsdom can't render it fully)
// ---------------------------------------------------------------------------

jest.mock('react-phone-number-input', () => {
    const MockPhoneInput = (props: any) => (
        <input
            data-testid="phone-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange && props.onChange(e.target.value)}
            style={props.style}
        />
    );
    MockPhoneInput.displayName = 'PhoneInput';
    return MockPhoneInput;
});

jest.mock('react-phone-number-input', () => {
    const React = require('react');
    const MockPhoneInput = (props: any) =>
        React.createElement('input', {
            'data-testid': 'phone-input',
            value: props.value ?? '',
            onChange: (e: any) => props.onChange && props.onChange(e.target.value),
        });
    MockPhoneInput.displayName = 'PhoneInput';
    // Export parsePhoneNumber as a named export
    MockPhoneInput.parsePhoneNumber = jest.fn();
    return { __esModule: true, default: MockPhoneInput, parsePhoneNumber: jest.fn() };
});

describe('PhoneNumberInput', () => {
    const noop = () => {};

    // =========================================================================
    // Renders without crashing
    // =========================================================================

    it('renders without crashing', () => {
        const { container } = render(
            <PhoneNumberInput value="" onChange={noop} />,
        );
        expect(container).toBeTruthy();
    });

    it('renders the phone input element', () => {
        render(<PhoneNumberInput value="+15551234567" onChange={noop} />);
        expect(screen.getByTestId('phone-input')).toBeTruthy();
    });

    // =========================================================================
    // Error message
    // =========================================================================

    it('displays error message when error prop is provided', () => {
        render(<PhoneNumberInput value="" onChange={noop} error="Invalid phone number" />);
        expect(screen.getByText('Invalid phone number')).toBeTruthy();
    });

    it('does not display error paragraph when error prop is not provided', () => {
        render(<PhoneNumberInput value="" onChange={noop} />);
        expect(screen.queryByText(/Invalid/)).toBeNull();
    });

    it('does not display error paragraph when error is empty string', () => {
        render(<PhoneNumberInput value="" onChange={noop} error="" />);
        expect(screen.queryByRole('paragraph')).toBeNull();
    });
});
