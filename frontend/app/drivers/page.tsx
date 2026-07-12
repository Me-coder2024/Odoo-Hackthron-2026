'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Search, Users } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  license_number: string;
  license_expiry: string;
  phone: string;
  status: string;
  safety_score: number;
  total_trips: number;
  total_distance_km: string;
}

const STATUS_BG: Record<string, string> = {
  ACTIVE: '#059669',
  ON_TRIP: '#2563EB',
  SUSPENDED: '#DC2626',
  OFF_DUTY: '#6B7280',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#fff',
      backgroundColor: STATUS_BG[status] || '#374151', minWidth: 80, textAlign: 'center'
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}

function SafetyBar({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', maxWidth: 60 }}>
        <div style={{ width: `${score}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600 }}>{score}</span>
    </div>
  );
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', license_number: '', license_expiry: '', phone: '' });
  const [formError, setFormError] = useState('');

  const fetchDrivers = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/drivers', { params });
      setDrivers(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, [search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/drivers', formData);
      setShowForm(false);
      setFormData({ name: '', license_number: '', license_expiry: '', phone: '' });
      fetchDrivers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr.response?.data?.message || 'Failed');
    }
  };

  const isExpired = (d: string) => new Date(d) < new Date();

  return (
    <div>
      {/* Filters + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '7px 14px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 6, color: '#4B5563', fontSize: 13 }}>
            <option value="">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="OFF_DUTY">Off Duty</option>
          </select>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input placeholder="Search driver..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '7px 10px 7px 32px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 6, color: '#111827', fontSize: 13, width: 200, outline: 'none' }} />
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Add Driver
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: '#111827' }}>New Driver</h3>
          {formError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 6 }}>{formError}</div>}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>Name</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>License Number</label><input value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>License Expiry</label><input type="date" value={formData.license_expiry} onChange={e => setFormData({...formData, license_expiry: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>Phone</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required style={{ marginTop: 4 }} /></div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create Driver</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 4 }} />)}</div>
        ) : drivers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Users size={36} style={{ color: '#D1D5DB', marginBottom: 10 }} /><p style={{ color: '#6B7280', fontSize: 13 }}>No drivers found</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['NAME', 'LICENSE NO.', 'LICENSE EXPIRY', 'PHONE', 'TRIPS', 'KM DRIVEN', 'SAFETY', 'STATUS'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#111827', fontWeight: 500 }}>
                    <Link href={`/drivers/${d.id}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>{d.name}</Link>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563', fontFamily: 'monospace' }}>{d.license_number}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: isExpired(d.license_expiry) ? '#EF4444' : '#4B5563' }}>
                    {new Date(d.license_expiry).toLocaleDateString()}{isExpired(d.license_expiry) && <span style={{ fontSize: 10, marginLeft: 6, color: '#EF4444' }}>EXPIRED</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{d.phone}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{d.total_trips}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{Number(d.total_distance_km).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}><SafetyBar score={d.safety_score} /></td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: '#E67E00', fontStyle: 'italic' }}>
        Only safety officers can update driver profiles & safety scores
      </p>
    </div>
  );
}
