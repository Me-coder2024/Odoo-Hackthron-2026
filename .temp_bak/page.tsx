'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Icon } from '@iconify/react';

interface Vehicle {
  id: string;
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: string;
  odometer: string;
  acquisition_cost: string;
  region: string | null;
  status: string;
  _count: { trips: number; maintenance_logs: number };
}

const STATUS_BG: Record<string, string> = {
  AVAILABLE: '#059669',
  ON_TRIP: '#2563EB',
  IN_SHOP: '#D97706',
  RETIRED: '#DC2626',
};

function StatusBadge({ status }: { status: string }) {
  const bg = STATUS_BG[status] || '#374151';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        color: '#fff',
        backgroundColor: bg,
        minWidth: 80,
        textAlign: 'center',
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ registration_number: '', name: '', type: 'TRUCK', max_load_capacity: '', acquisition_cost: '', region: '' });
  const [formError, setFormError] = useState('');

  const fetchVehicles = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/vehicles', { params });
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [search, statusFilter, typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Registration number validation
    const regRegex = /^[A-Za-z]{2}-\d{2}-[A-Za-z]{1,2}-\d{4}$/;
    if (!regRegex.test(formData.registration_number)) {
      setFormError('Registration number is wrong. It must be in standard format (e.g. MH-01-AB-1234).');
      return;
    }

    try {
      await api.post('/vehicles', {
        ...formData,
        max_load_capacity: parseFloat(formData.max_load_capacity),
        acquisition_cost: parseFloat(formData.acquisition_cost),
      });
      setShowForm(false);
      setFormData({ registration_number: '', name: '', type: 'TRUCK', max_load_capacity: '', acquisition_cost: '', region: '' });
      fetchVehicles();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr.response?.data?.message || 'Failed to create vehicle');
    }
  };

  return (
    <div>
      {/* Filters + Add button row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '7px 36px 7px 14px', backgroundColor: '#FFFFFF', border: '1px solid #111827', borderRadius: 6, color: '#4B5563', fontSize: 13 }}
          >
            <option value="">Type: All</option>
            <option value="VAN">Van</option>
            <option value="TRUCK">Truck</option>
            <option value="BUS">Bus</option>
            <option value="OTHER">Mini</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '7px 36px 7px 14px', backgroundColor: '#FFFFFF', border: '1px solid #111827', borderRadius: 6, color: '#4B5563', fontSize: 13 }}
          >
            <option value="">Status: All</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
          <div style={{ position: 'relative' }}>
            <Icon icon="mdi:magnify" width="14" height="14" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              placeholder="Search reg. no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '7px 10px 7px 32px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #111827',
                borderRadius: 6,
                color: '#111827',
                fontSize: 13,
                width: 200,
                outline: 'none',
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            backgroundColor: '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Icon icon="mdi:plus" width="16" height="16" /> Add Vehicle
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: '#111827' }}>New Vehicle</h3>
          {formError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 6 }}>{formError}</div>}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Number</label><input type="text" placeholder="GJ-01-XX-1234" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name/Model</label><input type="text" placeholder="Tata Ultra 1918" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ marginTop: 4 }}><option value="TRUCK">Truck</option><option value="VAN">Van</option><option value="BUS">Bus</option><option value="OTHER">Mini</option></select></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacity (kg)</label><input type="number" placeholder="5000" value={formData.max_load_capacity} onChange={e => setFormData({...formData, max_load_capacity: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acquisition Cost (₹)</label><input type="number" placeholder="1500000" value={formData.acquisition_cost} onChange={e => setFormData({...formData, acquisition_cost: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</label><input type="text" placeholder="West" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} style={{ marginTop: 4 }} /></div>
            <div style={{ gridColumn: 'span 3', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#6B7280', border: '1px solid #111827', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create Vehicle</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 4 }} />)}</div>
        ) : vehicles.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Icon icon="mdi:truck" width="36" height="36" style={{ color: '#D1D5DB', marginBottom: 10 }} />
            <p style={{ color: '#6B7280', fontSize: 13 }}>No vehicles found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['REG. NO. (UNIQUE)', 'NAME/MODEL', 'TYPE', 'CAPACITY', 'ODOMETER', 'ACQ. COST', 'STATUS'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#111827', fontFamily: 'monospace' }}>
                    <Link href={`/vehicles/${v.id}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>{v.registration_number}</Link>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{v.name}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{v.type.charAt(0) + v.type.slice(1).toLowerCase()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{Number(v.max_load_capacity).toLocaleString()} kg</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{Number(v.odometer).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>₹{Number(v.acquisition_cost).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rule note */}
      <p style={{ marginTop: 16, fontSize: 12, color: '#1542C2', fontStyle: 'italic' }}>
        Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </p>
    </div>
  );
}
