"use client";

import { useState } from "react";
import SearchInput from "./SearchInput";

export default function SearchPage() {
  const [results, setResults] = useState([]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '90%',
        maxWidth: 900,
        minHeight: 600,
        maxHeight: '95vh',
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 30,
        paddingBottom: 30,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.20) 100%), white',
        boxShadow: '0px 4px 4px rgba(26, 26, 26, 0.30)',
        borderRadius: 20,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 25,
        display: 'flex',
        overflow: 'auto'
      }}>
        {/* Logo */}
        <div style={{ width: 100, height: 100, position: 'relative' }}>
          <img style={{
            width: 98.63,
            height: 98.63,
            left: 0,
            top: 1.38,
            position: 'absolute',
            transform: 'rotate(-1deg)',
            transformOrigin: 'top left'
          }} src="/images/logos/headword.png" />
        </div>

        {/* Title */}
        <div style={{
          width: '100%',
          padding: 10,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          display: 'flex'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'black',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: '600',
            wordWrap: 'break-word',
            textShadow: '0px 4px 4px rgba(0, 0, 0, 0.20)'
          }}>
            Search Clients
          </div>
        </div>

        {/* Search Input Container */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 15
        }}> 
          <SearchInput onResults={setResults} />
        </div>

        {/* Results Table */}
        {results.length > 0 ? (
          <div style={{
            width: '100%',
            overflowX: 'auto',
            marginTop: 20
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.10)'
            }}>
              <thead>
                <tr style={{ background: 'rgba(255, 158, 77, 0.20)' }}>
                  <th style={{
                    border: '1px solid rgba(217, 217, 217, 0.30)',
                    padding: 12,
                    textAlign: 'left',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: 15,
                    color: '#FF5900'
                  }}>
                    Name
                  </th>
                  <th style={{
                    border: '1px solid rgba(217, 217, 217, 0.30)',
                    padding: 12,
                    textAlign: 'left',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: 15,
                    color: '#FF5900'
                  }}>
                    Email
                  </th>
                  <th style={{
                    border: '1px solid rgba(217, 217, 217, 0.30)',
                    padding: 12,
                    textAlign: 'left',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: 15,
                    color: '#FF5900'
                  }}>
                    Notes
                  </th>
                  <th style={{
                    border: '1px solid rgba(217, 217, 217, 0.30)',
                    padding: 12,
                    textAlign: 'left',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: 15,
                    color: '#FF5900'
                  }}>
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((client: any, idx: number) => (
                  <tr
                    key={client.id}
                    style={{
                      background: idx % 2 === 0 ? 'white' : 'rgba(255, 245, 230, 0.50)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 158, 77, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : 'rgba(255, 245, 230, 0.50)'}
                  >
                    <td style={{
                      border: '1px solid rgba(217, 217, 217, 0.30)',
                      padding: 12,
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: 'rgba(26, 26, 26, 0.80)'
                    }}>
                      {client.name}
                    </td>
                    <td style={{
                      border: '1px solid rgba(217, 217, 217, 0.30)',
                      padding: 12,
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: 'rgba(26, 26, 26, 0.80)'
                    }}>
                      {client.email}
                    </td>
                    <td style={{
                      border: '1px solid rgba(217, 217, 217, 0.30)',
                      padding: 12,
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: 'rgba(26, 26, 26, 0.80)'
                    }}>
                      {client.notes}
                    </td>
                    <td style={{
                      border: '1px solid rgba(217, 217, 217, 0.30)',
                      padding: 12,
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: 'rgba(26, 26, 26, 0.80)'
                    }}>
                      {client.tags.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{
            textAlign: 'center',
            color: 'rgba(26, 26, 26, 0.50)',
            fontSize: 16,
            fontFamily: 'Inter',
            marginTop: 20
          }}>
            No results found.
          </p>
        )}
      </div>
    </div>
  );
}