'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Icon } from '@iconify/react';

const STATUS_BG: Record<string, string> = { ACTIVE: '#D97706', CLOSED: '#059669' };

function StatusBadge({ status }: { status: string }) {
  const label = status === 'ACTIVE' ? 'In Shop' : 'Completed';
  return (
    <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#fff', backgroundColor: STATUS_BG[status] || '#374151' }}>
      {label}
    </span>
  );
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({ vehicle_id: '', service_type: '', cost: '', date: '', description: '' });
  const [formError, setFormError] = useState('');

  const fetchLogs = async () => {
    try { const res = await api.get('/maintenance'); setLogs(res.data.data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadVehicles = async () => { try { const res = await api.get('/vehicles'); setVehicles(res.data.data); } catch (err) { console.error(err); } };

  useEffect(() => { fetchLogs(); loadVehicles(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      await api.post('/maintenance', { vehicle_id: formData.vehicle_id, service_type: formData.service_type, description: formData.description || formData.service_type });
      setFormData({ vehicle_id: '', service_type: '', cost: '', date: '', description: '' });
      fetchLogs();
    } catch (err: unknown) { const a = err as { response?: { data?: { message?: string } } }; setFormError(a.response?.data?.message || 'Failed'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #111827', borderRadius: 6, color: '#111827', fontSize: 14, outline: 'none', marginTop: 4 };
  const selectStyle: React.CSSProperties = { ...inputStyle, padding: '10px 36px 10px 14px' };
  const labelStyle: React.CSSProperties = { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* LEFT — Log Service Record Form */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>LOG SERVICE RECORD</div>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>VEHICLE</label>
            <select value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} required style={selectStyle}>
              <option value="">Select vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>SERVICE TYPE</label>
            <input type="text" value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})} required style={inputStyle} placeholder="Oil Change" />
          </div>
          <div>
            <label style={labelStyle}>COST</label>
            <input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} style={inputStyle} placeholder="2500" />
          </div>
          <div>
            <label style={labelStyle}>DATE</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>STATUS</label>
            <input type="text" value="Active" disabled style={{ ...inputStyle, opacity: 0.6, backgroundColor: '#F3F4F6' }} />
          </div>

          {formError && <div style={{ color: '#DC2626', fontSize: 13, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 6 }}>{formError}</div>}

          <button type="submit" style={{
            width: '100%', padding: '12px', backgroundColor: '#1542C2', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4,
          }}>
            Save
          </button>
        </form>

        {/* Flow Diagram */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Available</span>
            <span style={{ flex: 1, borderBottom: '1px dashed #D1D5DB' }} />
            <span style={{ fontSize: 11, color: '#6B7280' }}>creating service record</span>
            <span style={{ flex: 1, borderBottom: '1px dashed #D1D5DB' }} />
            <span style={{ fontSize: 11, color: '#6B7280' }}>→</span>
            <span style={{ fontSize: 12, color: '#D97706', fontWeight: 600 }}>In Shop</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#D97706', fontWeight: 600 }}>In Shop</span>
            <span style={{ flex: 1, borderBottom: '1px dashed #D1D5DB' }} />
            <span style={{ fontSize: 11, color: '#6B7280' }}>close & cost finalized</span>
            <span style={{ flex: 1, borderBottom: '1px dashed #D1D5DB' }} />
            <span style={{ fontSize: 11, color: '#6B7280' }}>→</span>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Available</span>
          </div>
          <p style={{ fontSize: 11, color: '#1542C2', fontStyle: 'italic', marginTop: 4 }}>
            Note: In Shop vehicles are removed from the dispatch pool.
          </p>
        </div>
      </div>

      {/* RIGHT — Service Log Table */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>SERVICE LOG</div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 4 }} />)}</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center' }}><Icon icon="mdi:wrench" width="28" height="28" style={{ color: '#D1D5DB', marginBottom: 8 }} /><p style={{ color: '#6B7280', fontSize: 13 }}>No service logs</p></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['VEHICLE', 'SERVICE', 'COST', 'STATUS'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 14px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{l.vehicle?.registration_number}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#4B5563' }}>{l.service_type}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#4B5563' }}>{Number(l.total_cost).toLocaleString()}</td>
                    <td style={{ padding: '12px 14px' }}><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
