'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Icon } from '@iconify/react';

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [completeData, setCompleteData] = useState({ final_odometer: '', fuel_consumed: '', actual_distance: '', revenue: '' });

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrip(); }, [id]);

  const handleDispatch = async () => {
    setActionLoading('dispatch');
    setError('');
    try {
      await api.post(`/trips/${id}/dispatch`);
      fetchTrip();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Dispatch failed');
    } finally { setActionLoading(''); }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('complete');
    setError('');
    try {
      await api.post(`/trips/${id}/complete`, {
        final_odometer: parseFloat(completeData.final_odometer),
        fuel_consumed: parseFloat(completeData.fuel_consumed),
        actual_distance: parseFloat(completeData.actual_distance),
        revenue: parseFloat(completeData.revenue),
      });
      setShowComplete(false);
      fetchTrip();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Complete failed');
    } finally { setActionLoading(''); }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    setActionLoading('cancel');
    setError('');
    try {
      await api.post(`/trips/${id}/cancel`);
      fetchTrip();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Cancel failed');
    } finally { setActionLoading(''); }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 400, borderRadius: 10 }} /></div>;
  if (!trip) return <div style={{ padding: 40, color: 'var(--color-text-muted)' }}>Trip not found</div>;

  const STATUS_COLORS: Record<string, string> = { DRAFT: '#8B5CF6', DISPATCHED: '#3B82F6', COMPLETED: '#10B981', CANCELLED: '#EF4444' };
  const color = STATUS_COLORS[trip.status] || '#6B7280';

  return (
    <div>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}>
        <Icon icon="mdi:arrow-left" width="16" height="16" /> Back to Trips
      </button>

      {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Trip Info */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{trip.trip_number}</h1>
              <p style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>{trip.source} → {trip.destination}</p>
            </div>
            <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}>{trip.status}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {[
              { label: 'Vehicle', value: `${trip.vehicle?.name} (${trip.vehicle?.registration_number})` },
              { label: 'Driver', value: trip.driver?.name },
              { label: 'Cargo Weight', value: `${Number(trip.cargo_weight).toLocaleString()} kg` },
              { label: 'Planned Distance', value: `${Number(trip.planned_distance).toLocaleString()} km` },
              { label: 'Actual Distance', value: trip.actual_distance ? `${Number(trip.actual_distance).toLocaleString()} km` : '—' },
              { label: 'Fuel Consumed', value: trip.fuel_consumed ? `${Number(trip.fuel_consumed)} L` : '—' },
              { label: 'Revenue', value: trip.revenue ? `₹${Number(trip.revenue).toLocaleString()}` : '—' },
              { label: 'Created By', value: trip.creator?.username },
              { label: 'Dispatched At', value: trip.dispatched_at ? new Date(trip.dispatched_at).toLocaleString() : '—' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {trip.status === 'DRAFT' && (
            <button onClick={handleDispatch} disabled={!!actionLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.6 : 1 }}>
              <Icon icon="mdi:play" width="16" height="16" /> {actionLoading === 'dispatch' ? 'Dispatching...' : 'Dispatch Trip'}
            </button>
          )}
          {trip.status === 'DISPATCHED' && (
            <>
              <button onClick={() => setShowComplete(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                <Icon icon="mdi:check-circle" width="16" height="16" /> Complete Trip
              </button>
              <button onClick={handleCancel} disabled={!!actionLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                <Icon icon="mdi:close-circle" width="16" height="16" /> {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Trip'}
              </button>
            </>
          )}
          {trip.status === 'COMPLETED' && (
            <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <Icon icon="mdi:check-circle" width="24" height="24" style={{ color: '#10B981', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#10B981', fontWeight: 500 }}>Trip Completed</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{trip.completed_at ? new Date(trip.completed_at).toLocaleString() : ''}</p>
            </div>
          )}
        </div>
      </div>

      {/* Complete Modal */}
      {showComplete && (
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: 'var(--color-text-primary)' }}>Complete Trip — Final Metrics</h3>
          <form onSubmit={handleComplete} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label>Final Odometer (km)</label><input type="number" placeholder="15200" value={completeData.final_odometer} onChange={e => setCompleteData({...completeData, final_odometer: e.target.value})} required /></div>
            <div><label>Fuel Consumed (L)</label><input type="number" step="0.1" placeholder="120" value={completeData.fuel_consumed} onChange={e => setCompleteData({...completeData, fuel_consumed: e.target.value})} required /></div>
            <div><label>Actual Distance (km)</label><input type="number" placeholder="350" value={completeData.actual_distance} onChange={e => setCompleteData({...completeData, actual_distance: e.target.value})} required /></div>
            <div><label>Revenue (₹)</label><input type="number" placeholder="25000" value={completeData.revenue} onChange={e => setCompleteData({...completeData, revenue: e.target.value})} required /></div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowComplete(false)} style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" disabled={!!actionLoading} style={{ padding: '8px 16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>{actionLoading === 'complete' ? 'Completing...' : 'Complete Trip'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
