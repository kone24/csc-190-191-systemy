'use client';

import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { ManagerAndAbove } from '@/components/RoleGuard';
import { useUser } from '@/contexts/UserContext';

type RecommendationPriority = 'high' | 'medium' | 'low';

interface RecommendationCardData {
  id: string;
  clientId?: string;
  projectId?: string;
  type: string;
  score: number;
  summary: string;
  reasons: string[];
  suggestedAction?: string;
  priority: RecommendationPriority;
  rankingPosition: number;
  createdAt: string;
}

export default function RecommendationsPage() {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<RecommendationCardData[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      setErrorMessage(null);

      try {
        /* Supabase authentication when ready
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
          setErrorMessage('You must be logged in to view recommendations.');
          setLoading(false);
          return;
        }
        */
        const endpoint =
          selectedType === 'all'
            ? 'http://localhost:3001/recommendations'
            : `http://localhost:3001/recommendations?type=${encodeURIComponent(selectedType)}`;

        const res = await fetch(endpoint, {
          method: 'GET',
          /*headers: {
            Authorization: `Bearer ${token}`,
          },*/
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          setErrorMessage(
            errorData?.message || 'Failed to load recommendations.'
          );
          setLoading(false);
          return;
        }

        const data = await res.json();
        setRecommendations(data.recommendations ?? []);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setErrorMessage('Could not reach the server.');
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [selectedType]);

  const stats = useMemo(() => {
    const total = recommendations.length;
    const high = recommendations.filter((r) => r.priority === 'high').length;
    const medium = recommendations.filter((r) => r.priority === 'medium').length;
    const avgScore =
      total > 0
        ? Math.round(
          recommendations.reduce((sum, item) => sum + item.score, 0) / total
        )
        : 0;

    return { total, high, medium, avgScore };
  }, [recommendations]);

  const formatTypeLabel = (type: string) => {
    switch (type) {
      case 'high_potential_lead':
        return 'High Potential Lead';
      case 'upsell_opportunity':
        return 'Upsell Opportunity';
      case 'reactivation_candidate':
        return 'Reactivation Candidate';
      default:
        return type.replaceAll('_', ' ');
    }
  };

  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'high':
        return { bg: '#FFE7E7', text: '#CC0000' };
      case 'medium':
        return { bg: '#FFF5E5', text: '#CC7A00' };
      case 'low':
        return { bg: '#E7F7E7', text: '#008A00' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const StatCard = ({
    title,
    value,
    subtitle,
  }: {
    title: string;
    value: string;
    subtitle?: string;
  }) => (
    <div
      style={{
        background: 'white',
        borderRadius: 15,
        padding: '22px',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.6)',
          marginBottom: '8px',
          fontFamily: 'Poppins',
          fontWeight: '600',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '30px',
          fontWeight: '600',
          color: '#FF5900',
          marginBottom: '4px',
          fontFamily: 'Poppins',
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(0, 0, 0, 0.5)',
            fontFamily: 'Poppins',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <ManagerAndAbove>
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
        <Sidebar activePage="recommendations" />

        <div
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: 320,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(217, 217, 217, 0.15)',
            padding: '20px 20px 20px 30px',
            gap: '20px',
            overflowX: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div>
              <div
                style={{
                  color: 'black',
                  fontSize: 32,
                  fontFamily: 'Poppins',
                  fontWeight: '600',
                }}
              >
                Recommendations
              </div>
              <div
                style={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontSize: 14,
                  fontFamily: 'Poppins',
                  marginTop: 4,
                }}
              >
                AI-ranked opportunities from highest to lowest potential
              </div>
            </div>

            <div
              style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.7)',
                fontFamily: 'Poppins',
              }}
            >
              Welcome, {user?.firstName} {user?.lastName}
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
            }}
          >
            <StatCard title="Total Recommendations" value={stats.total.toString()} />
            <StatCard title="High Priority" value={stats.high.toString()} />
            <StatCard title="Medium Priority" value={stats.medium.toString()} />
            <StatCard title="Average Score" value={stats.avgScore.toString()} />
          </div>

          {/* Filters */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.15)',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontFamily: 'Poppins',
                color: 'rgba(0, 0, 0, 0.7)',
                fontWeight: '600',
              }}
            >
              Ranked Recommendations
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.7)',
                }}
              >
                Filter by type:
              </label>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.15)',
                  fontFamily: 'Poppins',
                  background: 'white',
                }}
              >
                <option value="all">All</option>
                <option value="high_potential_lead">High Potential Leads</option>
                <option value="upsell_opportunity">Upsell Opportunities</option>
                <option value="reactivation_candidate">Reactivation Candidates</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.15)',
              padding: '24px',
              flex: 1,
            }}
          >
            {loading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  fontFamily: 'Poppins',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}
              >
                Loading recommendations...
              </div>
            ) : errorMessage ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  fontFamily: 'Poppins',
                  color: '#CC0000',
                }}
              >
                {errorMessage}
              </div>
            ) : recommendations.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  fontFamily: 'Poppins',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}
              >
                No recommendations available.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {recommendations.map((rec) => {
                  const priorityColors = getPriorityColor(rec.priority);

                  return (
                    <div
                      key={rec.id}
                      style={{
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 16,
                        padding: '20px',
                        background: 'rgba(255,255,255,1)',
                        boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '16px',
                          marginBottom: '14px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: 'Poppins',
                              color: '#FF5900',
                              fontWeight: '600',
                              fontSize: '18px',
                              marginBottom: '6px',
                            }}
                          >
                            #{rec.rankingPosition} • {formatTypeLabel(rec.type)}
                          </div>

                          <div
                            style={{
                              fontFamily: 'Poppins',
                              color: 'rgba(0,0,0,0.65)',
                              fontSize: '13px',
                            }}
                          >
                            Generated on {formatDate(rec.createdAt)}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              padding: '6px 12px',
                              borderRadius: 999,
                              background: 'rgba(255, 89, 0, 0.12)',
                              color: '#FF5900',
                              fontWeight: 600,
                              fontFamily: 'Poppins',
                              fontSize: '13px',
                            }}
                          >
                            Score: {rec.score}
                          </span>

                          <span
                            style={{
                              padding: '6px 12px',
                              borderRadius: 999,
                              background: priorityColors.bg,
                              color: priorityColors.text,
                              fontWeight: 600,
                              fontFamily: 'Poppins',
                              fontSize: '13px',
                              textTransform: 'capitalize',
                            }}
                          >
                            {rec.priority} priority
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          fontFamily: 'Poppins',
                          fontSize: '15px',
                          color: '#222',
                          marginBottom: '12px',
                          lineHeight: 1.5,
                        }}
                      >
                        {rec.summary}
                      </div>

                      {rec.reasons.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <div
                            style={{
                              fontFamily: 'Poppins',
                              fontWeight: '600',
                              fontSize: '14px',
                              marginBottom: '8px',
                            }}
                          >
                            Why this is recommended
                          </div>

                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: '20px',
                              color: 'rgba(0,0,0,0.75)',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              lineHeight: 1.6,
                            }}
                          >
                            {rec.reasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rec.suggestedAction && (
                        <div
                          style={{
                            padding: '12px 14px',
                            background: 'rgba(255, 89, 0, 0.06)',
                            borderRadius: 10,
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            color: '#333',
                          }}
                        >
                          <strong>Suggested action:</strong> {rec.suggestedAction}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ManagerAndAbove>
  );
}