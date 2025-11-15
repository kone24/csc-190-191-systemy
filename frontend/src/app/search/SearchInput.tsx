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

      fetch(`http://localhost:3000/clients/search?q=${encodeURIComponent(query)}`, {
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
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a name, note, or tag..."
        className="border p-2 w-full mb-4 rounded"
      />
      {loading && <p>Searching...</p>}
      {error && <p className="text-red-600">{error}</p>}
    </>
  );
}
