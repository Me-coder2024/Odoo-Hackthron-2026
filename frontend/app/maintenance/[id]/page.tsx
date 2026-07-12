'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Icon } from '@iconify/react';

export default function MaintenanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemData, setItemData] = useState({ description: '', cost: '' });
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLog = async () => { try { const r = await api.get(`/maintenance/${id}`); setLog(r.data.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { fetchLog(); }, [id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try { await api.post(`/maintenance/${id}/items`, { description: itemData.description, cost: parseFloat(itemData.cost) }); setShowAddItem(false); setItemData({ description: '', cost: '' }); fetchLog(); }
    catch (err: unknown) { const a = err as { response?: { data?: { message?: string } } }; setError(a.response?.data?.message || 'Failed'); }
  };

  const handleClose = async () => {
    if (!confirm('Close this maintenance log? Vehicle will be restored to AVAILABLE.')) return;
    setActionLoading(true); setError('');
    try { await api.post(`/maintenance/${id}/close`); fetchLog(); } catch (err: unknown) { const a = err as { response?: { data?: { message?: string } } }; setError(a.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 300, borderRadius: 10 }} /></div>;
  if (!log) return <div style={{ padding: 40, color: 'var(--color-text-muted)' }}>Not found</div>;

  const isActive = log.status === 'ACTIVE';

  return (
    <div>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}><Icon icon="mdi:arrow-left" width="16" height="16" /> Back</button>

      {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div><h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{log.service_type}</h1><p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{log.vehicle?.name} — {log.vehicle?.registration_number}</p></div>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: isActive ? '#10B981' : '#6B7280' }}>{log.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, marginBottom: 4 }}>Started</div><div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{new Date(log.started_at).toLocaleDateString()}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, marginBottom: 4 }}>Closed</div><div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{log.closed_at ? new Date(log.closed_at).toLocaleDateString() : '—'}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, marginBottom: 4 }}>Total Cost</div><div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-accent)' }}>₹{Number(log.total_cost).toLocaleString()}</div></div>
          </div>
          {log.description && <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', padding: '12px 0', borderTop: '1px solid var(--color-border-subtle)' }}>{log.description}</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isActive && (
            <>
              <button onClick={() => setShowAddItem(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}><Icon icon="mdi:plus" width="16" height="16" /> Add Item</button>
              <button onClick={handleClose} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}><Icon icon="mdi:check-circle" width="16" height="16" /> {actionLoading ? 'Closing...' : 'Close & Restore Vehicle'}</button>
            </>
          )}
        </div>
      </div>

      {showAddItem && (
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}><label>Description</label><input type="text" placeholder="Engine Oil Change" style={{ border: '1px solid #111827', width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: 6, color: '#111827', fontSize: 14, outline: 'none', marginTop: 4 }} value={itemData.description} onChange={e => setItemData({...itemData, description: e.target.value})} required /></div>
            <div style={{ flex: 1 }}><label>Cost (₹)</label><input type="number" placeholder="3500" style={{ border: '1px solid #111827', width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: 6, color: '#111827', fontSize: 14, outline: 'none', marginTop: 4 }} value={itemData.cost} onChange={e => setItemData({...itemData, cost: e.target.value})} required /></div>
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 1 }}>Add</button>
          </form>
        </div>
      )}

      {/* Items list */}
      <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16 }}>Service Items</h3>
        {log.items?.length > 0 ? (
          <table>
            <thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Cost</th></tr></thead>
            <tbody>
              {log.items.map((item: any) => (<tr key={item.id}><td>{item.description}</td><td style={{ textAlign: 'right', fontWeight: 500 }}>₹{Number(item.cost).toLocaleString()}</td></tr>))}
              <tr><td style={{ fontWeight: 600 }}>Total</td><td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-accent)' }}>₹{log.items.reduce((s: number, i: any) => s + Number(i.cost), 0).toLocaleString()}</td></tr>
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 24, fontSize: 13 }}>No items added yet</p>}
      </div>
    </div>
  );
}
