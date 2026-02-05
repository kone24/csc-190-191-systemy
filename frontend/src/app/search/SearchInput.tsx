"use client";

import { useState, useEffect } from "react";

interface SearchInputProps {
  onResults: (results: any[]) => void;
}

export default function SearchInput({ onResults }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      onResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      fetch(`http://localhost:3001/clients/search?q=${encodeURIComponent(query)}`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => onResults(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300); // debounce 300ms (so user isn't required to press enter while searching. Automatically does this function.)

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div style={{ width: '100%' }}>
      {/* Search Input Field */}
      <div style={{ position: 'relative', width: '100%', height: 60 }}>
        <div style={{
          width: '100%',
          height: 60,
          background: 'rgba(217, 217, 217, 0.15)',
          borderRadius: 20,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)'
        }} />
        <img style={{
          width: 20,
          height: 20,
          left: 14.50,
          top: 20,
          position: 'absolute'
        }} src="/images/icons/isearch.svg" alt="Search" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a name, note, or tag..."
          style={{
            position: 'absolute',
            left: 54.50,
            top: 15,
            width: 'calc(100% - 70px)',
            height: 30,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'rgba(26, 26, 26, 0.80)',
            fontSize: 15,
            fontFamily: 'Inter',
            fontWeight: '600'
          }}
        />
      </div>

      {/* Loading and Error Messages */}
      {loading && (
        <p style={{
          textAlign: 'center',
          color: 'rgba(255, 158, 77, 0.80)',
          fontSize: 14,
          fontFamily: 'Inter',
          marginTop: 10
        }}>
          Searching...
        </p>
      )}
      {error && (
        <p style={{
          textAlign: 'center',
          color: '#ef4444',
          fontSize: 14,
          fontFamily: 'Inter',
          marginTop: 10,
          padding: 10,
          backgroundColor: '#fef2f2',
          borderRadius: 10,
          border: '1px solid #ef4444'
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
