'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Search, Route } from 'lucide-react';

const STATUS_BG: Record<string, string> = {
  DRAFT: '#4B5563',
  DISPATCHED: '#D97706',
  COMPLETED: '#059669',
  CANCELLED: '#DC2626',
};

function StatusBadge({ status }: { status: string }) {
  const bg = STATUS_BG[status] || '#374151';
  const label = status === 'DISPATCHED' ? 'Dispatched' : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span style={{
      display: 'inline-block', padding: '4px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600,
      color: '#fff', backgroundColor: bg, minWidth: 80, textAlign: 'center',
    }}>
      {label}
    </span>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
  const [formError, setFormError] = useState('');

  const fetchTrips = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/trips', { params });
      setTrips(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, [search, statusFilter]);

  const loadFormData = async () => {
    try {
      const [vRes, dRes] = await Promise.all([api.get('/vehicles/available'), api.get('/drivers/available')]);
      setVehicles(vRes.data.data);
      setDrivers(dRes.data.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/trips', {
        ...formData,
        cargo_weight: parseFloat(formData.cargo_weight),
        planned_distance: parseFloat(formData.planned_distance),
      });
      setShowForm(false);
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

  const inputStyle = { width: '100%', padding: '10px 14px', backgroundColor: '#1A1D26', border: '1px solid #2A2D38', borderRadius: 6, color: '#E5E7EB', fontSize: 14, outline: 'none', marginTop: 4 };
  const labelStyle = { fontSize: 11, color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 };

  return (
    <div>
      {/* Filters + New Trip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '7px 14px', backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 6, color: '#9CA3AF', fontSize: 13 }}>
            <option value="">Status: All</option>
            <option value="DRAFT">Draft</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4B5563' }} />
            <input placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 200, marginTop: 0 }} />
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (!showForm) loadFormData(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', backgroundColor: '#E67E00', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> New Trip
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: '#E5E7EB' }}>Create Trip</h3>
          {formError && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{formError}</div>}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div><label style={labelStyle}>Source</label><input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} required style={inputStyle} placeholder="City A" /></div>
            <div><label style={labelStyle}>Destination</label><input value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} required style={inputStyle} placeholder="City B" /></div>
            <div>
              <label style={labelStyle}>Vehicle (Available only)</label>
              <select value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} required style={inputStyle}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number} (Max: {Number(v.max_load_capacity).toLocaleString()} kg)</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Driver (Valid License)</label>
              <select value={formData.driver_id} onChange={e => setFormData({...formData, driver_id: e.target.value})} required style={inputStyle}>
                <option value="">Select driver</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} — Score: {d.safety_score}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Cargo Weight (kg)</label>
              <input type="number" value={formData.cargo_weight} onChange={e => setFormData({...formData, cargo_weight: e.target.value})} required style={inputStyle} />
              {selectedVehicle && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Remaining: {(Number(selectedVehicle.max_load_capacity) - (parseFloat(formData.cargo_weight) || 0)).toLocaleString()} kg</div>}
              {cargoExceeds && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>⚠ Exceeds max capacity of {Number(selectedVehicle.max_load_capacity).toLocaleString()} kg</div>}
            </div>
            <div><label style={labelStyle}>Planned Distance (km)</label><input type="number" value={formData.planned_distance} onChange={e => setFormData({...formData, planned_distance: e.target.value})} required style={inputStyle} /></div>
            <div style={{ gridColumn: 'span 3', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', backgroundColor: '#1A1D26', color: '#9CA3AF', border: '1px solid #2A2D38', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" disabled={!!cargoExceeds} style={{ padding: '8px 16px', backgroundColor: cargoExceeds ? '#374151' : '#E67E00', color: '#fff', border: 'none', borderRadius: 6, cursor: cargoExceeds ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>Create Trip</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 4 }} />)}</div>
        ) : trips.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Route size={36} style={{ color: '#374151', marginBottom: 10 }} /><p style={{ color: '#4B5563', fontSize: 13 }}>No trips found</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2130' }}>
                {['TRIP #', 'ROUTE', 'VEHICLE', 'DRIVER', 'CARGO', 'STATUS', 'REVENUE', 'ACTION'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #1A1D26' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontFamily: 'monospace' }}>
                    <Link href={`/trips/${t.id}`} style={{ color: '#E5E7EB', textDecoration: 'none' }}>{t.trip_number}</Link>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{t.source} → {t.destination}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{t.vehicle?.name || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{t.driver?.name || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{Number(t.cargo_weight).toLocaleString()} kg</td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{t.revenue ? `₹${Number(t.revenue).toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {t.status === 'DRAFT' && (
                      <button onClick={() => handleDispatch(t.id)} style={{ padding: '4px 12px', backgroundColor: '#E67E00', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Dispatch</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: '#E67E00', fontStyle: 'italic' }}>
        Only AVAILABLE vehicles & drivers with valid licenses appear in dispatch form
      </p>
    </div>
  );
}
