'use client';
import Link from 'next/link';

interface SearchBarProps {
    placeholder?: string;
    href?: string;
    onSearch?: (value: string) => void;
    className?: string;
}

export default function SearchBar({
    placeholder = "Search...",
    href,
    onSearch,
    className
}: SearchBarProps) {
    const searchIcon = (
        <div style={{
            width: 20,
            height: 20,
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
        }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );

    const baseStyle = {
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        borderRadius: 25,
        padding: '10px 20px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        minWidth: '300px',
        border: '1px solid #e0e0e0',
        transition: 'all 0.2s ease'
    };

    const hoverStyle = {
        boxShadow: '0px 4px 8px rgba(255, 89, 0, 0.2)',
        borderColor: '#FF5900'
    };

    const inputStyle = {
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 14,
        flex: 1,
        color: '#333',
        fontFamily: 'Poppins',
        fontWeight: '400',
        letterSpacing: 0
    };

    // If href is provided, render as a Link (like dashboard)
    if (href) {
        return (
            <Link href={href} style={{ textDecoration: 'none' }}>
                <div
                    style={{ ...baseStyle, cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                        Object.assign(e.currentTarget.style, hoverStyle);
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = baseStyle.boxShadow;
                        e.currentTarget.style.borderColor = baseStyle.border.split(' ')[2]; // #e0e0e0
                    }}
                >
                    {searchIcon}
                    <div style={{ ...inputStyle, color: '#999' }}>
                        {placeholder}
                    </div>
                </div>
            </Link>
        );
    }

    // Otherwise render as a functional input
    return (
        <div style={baseStyle} className={className}>
            {searchIcon}
            <input
                type="text"
                placeholder={placeholder}
                onChange={(e) => onSearch?.(e.target.value)}
                style={inputStyle}
            />
        </div>
    );
}