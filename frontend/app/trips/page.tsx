'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Route } from 'lucide-react';

const STATUS_BG: Record<string, string> = {
  DRAFT: '#4B5563',
  DISPATCHED: '#3B82F6',
  COMPLETED: '#059669',
  CANCELLED: '#DC2626',
};

const LIFECYCLE_STEPS = ['Draft', 'Dispatched', 'Completed'];

function StatusBadge({ status }: { status: string }) {
  const bg = STATUS_BG[status] || '#374151';
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span style={{
      display: 'inline-block', padding: '4px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600,
      color: '#fff', backgroundColor: bg,
    }}>
      {label}
    </span>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadFormData = async () => {
    try {
      const [vRes, dRes] = await Promise.all([api.get('/vehicles/available'), api.get('/drivers/available')]);
      setVehicles(vRes.data.data);
      setDrivers(dRes.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTrips(); loadFormData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/trips', {
        ...formData,
        cargo_weight: parseFloat(formData.cargo_weight),
        planned_distance: parseFloat(formData.planned_distance),
      });
      setFormData({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
      fetchTrips();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr.response?.data?.message || 'Failed to create trip');
    }
  };

  const handleDispatch = async (tripId: string) => {
    try { await api.post(`/trips/${tripId}/dispatch`); fetchTrips(); } catch (err) { console.error(err); }
  };

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
  const cargoExceeds = selectedVehicle && formData.cargo_weight && parseFloat(formData.cargo_weight) > Number(selectedVehicle.max_load_capacity);
  const exceededBy = cargoExceeds ? parseFloat(formData.cargo_weight) - Number(selectedVehicle.max_load_capacity) : 0;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 6, color: '#111827', fontSize: 14, outline: 'none', marginTop: 4 };
  const labelStyle: React.CSSProperties = { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* LEFT — Trip Lifecycle + Create Form */}
      <div>
        {/* Trip Lifecycle Stepper */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>TRIP LIFECYCLE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {LIFECYCLE_STEPS.map((step, i) => {
              const isActive = i <= 1;
              const color = isActive ? (i === 0 ? '#10B981' : '#3B82F6') : '#E5E7EB';
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: color, border: `2px solid ${color}` }} />
                    <span style={{ fontSize: 11, color: isActive ? '#111827' : '#9CA3AF', fontWeight: isActive ? 600 : 400 }}>{step}</span>
                  </div>
                  {i < LIFECYCLE_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, backgroundColor: i < 1 ? '#3B82F6' : '#E5E7EB', marginBottom: 18 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Trip Form */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>CREATE TRIP</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>SOURCE</label>
              <input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} required style={inputStyle} placeholder="Gandhinagar Depot" />
            </div>
            <div>
              <label style={labelStyle}>DESTINATION</label>
              <input value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} required style={inputStyle} placeholder="Ahmedabad Hub" />
            </div>
            <div>
              <label style={labelStyle}>VEHICLE (AVAILABLE ONLY)</label>
              <select value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} required style={inputStyle}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {Number(v.max_load_capacity).toLocaleString()} kg capacity</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>DRIVER (AVAILABLE ONLY)</label>
              <select value={formData.driver_id} onChange={e => setFormData({...formData, driver_id: e.target.value})} required style={inputStyle}>
                <option value="">Select driver</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>CARGO WEIGHT (KG)</label>
              <input type="number" value={formData.cargo_weight} onChange={e => setFormData({...formData, cargo_weight: e.target.value})} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PLANNED DISTANCE (KM)</label>
              <input type="number" value={formData.planned_distance} onChange={e => setFormData({...formData, planned_distance: e.target.value})} required style={inputStyle} />
            </div>

            {/* Capacity Warning */}
            {cargoExceeds && (
              <div style={{ backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, padding: '10px 14px', marginTop: 4 }}>
                <div style={{ fontSize: 12, color: '#DC2626' }}>Vehicle Capacity: {Number(selectedVehicle.max_load_capacity).toLocaleString()} kg</div>
                <div style={{ fontSize: 12, color: '#DC2626' }}>Cargo Weight: {parseFloat(formData.cargo_weight).toLocaleString()} kg</div>
                <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, marginTop: 4 }}>✕ Capacity exceeded by {exceededBy.toLocaleString()} kg — dispatch blocked</div>
              </div>
            )}

            {formError && <div style={{ color: '#DC2626', fontSize: 13, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 6 }}>{formError}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" disabled={!!cargoExceeds} style={{
                flex: 1, padding: '10px 16px', backgroundColor: cargoExceeds ? '#E5E7EB' : '#E67E00',
                color: cargoExceeds ? '#9CA3AF' : '#fff', border: '1px solid #D1D5DB', borderRadius: 6,
                fontSize: 13, fontWeight: 600, cursor: cargoExceeds ? 'not-allowed' : 'pointer',
              }}>
                {cargoExceeds ? 'Dispatch (disabled)' : 'Create & Dispatch'}
              </button>
              <button type="button" onClick={() => setFormData({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' })} style={{
                padding: '10px 24px', backgroundColor: '#FFFFFF', color: '#E67E00',
                border: '1px solid #E67E00', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT — Live Board */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>LIVE BOARD</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 8 }} />)
          ) : trips.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
              <Route size={28} style={{ color: '#D1D5DB', marginBottom: 8 }} />
              <p>No trips yet</p>
            </div>
          ) : (
            trips.slice(0, 8).map(t => (
              <div key={t.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{t.trip_number}</span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{t.vehicle?.registration_number || '—'} / {t.driver?.name?.split(' ')[0] || '—'}</span>
                </div>
                <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 8 }}>{t.source} → {t.destination}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusBadge status={t.status} />
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    {t.status === 'DISPATCHED' ? '~45 min' :
                     t.status === 'DRAFT' ? 'Awaiting driver' :
                     t.status === 'CANCELLED' ? 'Vehicle went to shop' : '—'}
                  </span>
                </div>
                {t.status === 'DRAFT' && (
                  <button onClick={() => handleDispatch(t.id)} style={{ marginTop: 8, padding: '5px 14px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Dispatch Now</button>
                )}
              </div>
            ))
          )}
        </div>
        <p style={{ marginTop: 16, fontSize: 11, color: '#6B7280', fontStyle: 'italic' }}>
          On complete: odometer → fuel log → expenses → Vehicle & Driver Available
        </p>
      </div>
    </div>
  );
}
