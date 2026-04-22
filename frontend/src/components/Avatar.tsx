'use client';
import { useState } from 'react';

const PALETTE = [
    '#f97316', '#8979FF', '#00C980', '#537FF1', '#FF928A',
    '#22C55E', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6',
];

function hashColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface AvatarProps {
    name: string;
    avatarUrl?: string | null;
    size: number;
    border?: string;
    style?: React.CSSProperties;
}

export default function Avatar({ name, avatarUrl, size, border, style }: AvatarProps) {
    const [imgError, setImgError] = useState(false);

    const safeName = name || '?';

    const baseStyle: React.CSSProperties = {
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        ...(border ? { border } : {}),
        boxSizing: 'border-box',
        ...style,
    };

    if (avatarUrl && !imgError) {
        return (
            <img
                src={avatarUrl}
                alt={safeName}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={{
                    ...baseStyle,
                    objectFit: 'cover',
                }}
            />
        );
    }

    return (
        <div style={{
            ...baseStyle,
            background: hashColor(safeName),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: Math.round(size * 0.38),
            fontFamily: 'Poppins',
            fontWeight: '600',
        }}>
            {getInitials(safeName)}
        </div>
    );
}
