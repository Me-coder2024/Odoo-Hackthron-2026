'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/hooks/useAuth';

export default function DriverDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const canManageStatus = user?.role === 'FLEET_MANAGER';

  useEffect(() => { api.get(`/drivers/${id}`).then(r => setDriver(r.data.data)).catch(console.error).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 300, borderRadius: 10 }} /></div>;
  if (!driver) return <div style={{ padding: 40, color: 'var(--color-text-muted)' }}>Driver not found</div>;

  const expired = new Date(driver.license_expiry) < new Date();
  const scoreColor = driver.safety_score >= 80 ? '#10B981' : driver.safety_score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}><Icon icon="mdi:arrow-left" width="16" height="16" /> Back to Drivers</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>{driver.name}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'License Number', render: () => driver.license_number },
              { label: 'Category', render: () => driver.license_category },
              { label: 'Contact', render: () => driver.contact_number || '—' },
              {
                label: 'Status',
                render: () => {
                  const STATUS_COLORS: Record<string, string> = { AVAILABLE: '#10B981', ON_TRIP: '#3B82F6', OFF_DUTY: '#6B7280', SUSPENDED: '#EF4444' };
                  if (canManageStatus) {
                    return (
                      <select
                        value={driver.status}
                        onChange={async (e) => {
                          try {
                            const nextStatus = e.target.value;
                            await api.patch(`/drivers/${id}`, { status: nextStatus });
                            setDriver({ ...driver, status: nextStatus });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        style={{
                          padding: '7px 36px 7px 14px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: `${STATUS_COLORS[driver.status] || '#6B7280'}18`,
                          color: STATUS_COLORS[driver.status] || '#6B7280',
                          border: `1px solid ${STATUS_COLORS[driver.status] || '#6B7280'}30`,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="ON_TRIP">ON TRIP</option>
                        <option value="OFF_DUTY">OFF DUTY</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    );
                  }
                  return (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 500,
                      backgroundColor: `${STATUS_COLORS[driver.status] || '#6B7280'}18`,
                      color: STATUS_COLORS[driver.status] || '#6B7280',
                      border: `1px solid ${STATUS_COLORS[driver.status] || '#6B7280'}30`
                    }}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  );
                }
              },
              { label: 'Total Trips', render: () => driver._count?.trips || 0 },
            ].map(i => (
              <div key={i.label}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 4 }}>{i.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{i.render()}</div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 4 }}>License Expiry</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: expired ? '#EF4444' : 'var(--color-text-primary)' }}>
                {expired && <Icon icon="mdi:alert" width="14" height="14" />}
                {new Date(driver.license_expiry).toLocaleDateString()}
                {expired && <span style={{ fontSize: 11 }}>(EXPIRED)</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Score */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon="mdi:shield-check" width="32" height="32" style={{ color: scoreColor, marginBottom: 12 }} />
          <div style={{ fontSize: 48, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{driver.safety_score}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>Safety Score</div>
          <div style={{ width: '80%', height: 8, borderRadius: 4, backgroundColor: 'var(--color-bg-elevated)', marginTop: 16, overflow: 'hidden' }}>
            <div style={{ width: `${driver.safety_score}%`, height: '100%', borderRadius: 4, backgroundColor: scoreColor, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16 }}>Recent Trips</h3>
        {driver.trips?.length > 0 ? (
          <table>
            <thead><tr><th>Trip #</th><th>Route</th><th>Vehicle</th><th>Status</th></tr></thead>
            <tbody>{driver.trips.map((t: any) => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{t.trip_number}</td>
                <td>{t.source} → {t.destination}</td>
                <td>{t.vehicle?.name} ({t.vehicle?.registration_number})</td>
                <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{t.status}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 24, fontSize: 13 }}>No trips recorded</p>}
      </div>
    </div>
  );
}
