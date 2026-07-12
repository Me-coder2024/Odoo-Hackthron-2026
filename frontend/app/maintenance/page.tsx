'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Wrench } from 'lucide-react';

const STATUS_BG: Record<string, string> = { ACTIVE: '#D97706', CLOSED: '#059669' };

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#fff', backgroundColor: STATUS_BG[status] || '#374151', minWidth: 70, textAlign: 'center' }}>
      {status}
    </span>
  );
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({ vehicle_id: '', service_type: '', description: '' });
  const [formError, setFormError] = useState('');

  const fetchLogs = async () => {
    try { const params: Record<string, string> = {}; if (statusFilter) params.status = statusFilter; const res = await api.get('/maintenance', { params }); setLogs(res.data.data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [statusFilter]);

  const loadVehicles = async () => { try { const res = await api.get('/vehicles'); setVehicles(res.data.data); } catch (err) { console.error(err); } };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try { await api.post('/maintenance', formData); setShowForm(false); setFormData({ vehicle_id: '', service_type: '', description: '' }); fetchLogs(); }
    catch (err: unknown) { const a = err as { response?: { data?: { message?: string } } }; setFormError(a.response?.data?.message || 'Failed'); }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', backgroundColor: '#1A1D26', border: '1px solid #2A2D38', borderRadius: 6, color: '#E5E7EB', fontSize: 14, outline: 'none', marginTop: 4 };

  return (
    <div>
      {/* Filters + New */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '7px 14px', backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 6, color: '#9CA3AF', fontSize: 13 }}>
            <option value="">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (!showForm) loadVehicles(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', backgroundColor: '#E67E00', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> New Service Log
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: '#E5E7EB' }}>Create Maintenance Log</h3>
          <p style={{ fontSize: 12, color: '#F59E0B', marginBottom: 16 }}>⚠ Creating a log will set the vehicle status to IN_SHOP</p>
          {formError && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{formError}</div>}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Vehicle</label><select value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} required style={inputStyle}><option value="">Select vehicle</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number}</option>)}</select></div>
            <div><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Service Type</label><input value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})} required style={inputStyle} placeholder="e.g., Oil Change, Brake Repair" /></div>
            <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Additional details..." style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', backgroundColor: '#1A1D26', color: '#9CA3AF', border: '1px solid #2A2D38', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#E67E00', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create & Move to IN_SHOP</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 4 }} />)}</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Wrench size={36} style={{ color: '#374151', marginBottom: 10 }} /><p style={{ color: '#4B5563', fontSize: 13 }}>No maintenance logs</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2130' }}>
                {['VEHICLE', 'SERVICE TYPE', 'STATUS', 'STARTED', 'CLOSED', 'COST', 'ITEMS'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1A1D26' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB' }}>{l.vehicle?.name} <span style={{ color: '#4B5563' }}>({l.vehicle?.registration_number})</span></td>
                  <td style={{ padding: '10px 14px' }}><Link href={`/maintenance/${l.id}`} style={{ color: '#E5E7EB', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>{l.service_type}</Link></td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={l.status} /></td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{new Date(l.started_at).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{l.closed_at ? new Date(l.closed_at).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB', fontWeight: 500 }}>₹{Number(l.total_cost).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{l._count?.items || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: '#E67E00', fontStyle: 'italic' }}>
        Vehicle status changes to IN_SHOP on create · Closing restores to AVAILABLE
      </p>
    </div>
  );
}
