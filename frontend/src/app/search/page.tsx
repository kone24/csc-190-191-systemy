"use client";

import { useState } from "react";
import SearchInput from "./SearchInput";

export default function SearchPage() {
  const [results, setResults] = useState([]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Search Clients</h2>
      <SearchInput onResults={setResults} />

      {results.length > 0 ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Notes</th>
              <th className="border p-2">Tags</th>
            </tr>
          </thead>
          <tbody>
            {results.map((client: any) => (
              <tr key={client.id}>
                <td className="border p-2">{client.firstName} {client.lastName}</td>
                <td className="border p-2">{client.email}</td>
                <td className="border p-2">{client.notes}</td>
                <td className="border p-2">{client.tags.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}
