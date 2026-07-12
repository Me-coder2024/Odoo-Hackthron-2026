'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/hooks/useAuth';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const canManageStatus = user?.role === 'FLEET_MANAGER';

  useEffect(() => {
    api.get(`/vehicles/${id}`).then(res => setVehicle(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 300, borderRadius: 10 }} /></div>;
  if (!vehicle) return <div style={{ padding: 40, color: 'var(--color-text-muted)' }}>Vehicle not found</div>;

  const STATUS_COLORS: Record<string, string> = { AVAILABLE: '#10B981', ON_TRIP: '#3B82F6', IN_SHOP: '#F59E0B', RETIRED: '#6B7280' };
  const color = STATUS_COLORS[vehicle.status] || '#6B7280';

  return (
    <div>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}>
        <Icon icon="mdi:arrow-left" width="16" height="16" /> Back to Vehicles
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Vehicle Info */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{vehicle.name}</h1>
              <p style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{vehicle.registration_number}</p>
            </div>
            {canManageStatus ? (
              <select
                value={vehicle.status}
                onChange={async (e) => {
                  try {
                    const nextStatus = e.target.value;
                    await api.patch(`/vehicles/${id}`, { status: nextStatus });
                    setVehicle({ ...vehicle, status: nextStatus });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                style={{
                  padding: '7px 36px 7px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: `${STATUS_COLORS[vehicle.status] || '#6B7280'}18`,
                  color: STATUS_COLORS[vehicle.status] || '#6B7280',
                  border: `1px solid ${STATUS_COLORS[vehicle.status] || '#6B7280'}30`,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ON_TRIP">ON TRIP</option>
                <option value="IN_SHOP">IN SHOP</option>
                <option value="RETIRED">RETIRED</option>
              </select>
            ) : (
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}>
                {vehicle.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Type', value: vehicle.type },
              { label: 'Region', value: vehicle.region || '—' },
              { label: 'Max Load', value: `${Number(vehicle.max_load_capacity).toLocaleString()} kg` },
              { label: 'Odometer', value: `${Number(vehicle.odometer).toLocaleString()} km` },
              { label: 'Acquisition Cost', value: `₹${Number(vehicle.acquisition_cost).toLocaleString()}` },
              { label: 'Total Trips', value: vehicle._count?.trips || 0 },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: <Icon icon="mdi:map-marker-distance" width="18" height="18" />, label: 'Total Trips', value: vehicle._count?.trips || 0, color: '#3B82F6' },
            { icon: <Icon icon="mdi:wrench" width="18" height="18" />, label: 'Maintenance Records', value: vehicle._count?.maintenance_logs || 0, color: '#F59E0B' },
            { icon: <Icon icon="mdi:gas-station" width="18" height="18" />, label: 'Fuel Logs', value: vehicle._count?.fuel_logs || 0, color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
              <div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.label}</div><div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.value}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips */}
      <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16 }}>Recent Trips</h3>
        {vehicle.trips?.length > 0 ? (
          <table>
            <thead><tr><th>Trip #</th><th>Route</th><th>Driver</th><th>Status</th><th>Revenue</th></tr></thead>
            <tbody>
              {vehicle.trips.map((t: any) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{t.trip_number}</td>
                  <td>{t.source} → {t.destination}</td>
                  <td>{t.driver?.name || '—'}</td>
                  <td><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}>{t.status}</span></td>
                  <td>{t.revenue ? `₹${Number(t.revenue).toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>No trips recorded</p>
        )}
      </div>
    </div>
  );
}
