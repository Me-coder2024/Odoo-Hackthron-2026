'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Fuel, Receipt } from 'lucide-react';

export default function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicle_id: '', liters: '', cost_per_liter: '', odometer_at_fill: '' });
  const [expenseForm, setExpenseForm] = useState({ vehicle_id: '', category: 'TOLL', amount: '', description: '' });
  const [formError, setFormError] = useState('');

  const fetchAll = async () => {
    try {
      const [fRes, eRes, vRes] = await Promise.all([api.get('/fuel-logs'), api.get('/expenses'), api.get('/vehicles')]);
      setFuelLogs(fRes.data.data);
      setExpenses(eRes.data.data);
      setVehicles(vRes.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const fuelTotal = fuelLogs.reduce((s, f) => s + Number(f.total_cost || 0), 0);
  const maintenanceTotal = 0; // placeholder — would come from analytics
  const operationalTotal = fuelTotal + maintenanceTotal;

  const handleFuelCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      await api.post('/fuel-logs', { ...fuelForm, liters: parseFloat(fuelForm.liters), cost_per_liter: parseFloat(fuelForm.cost_per_liter), odometer_at_fill: parseFloat(fuelForm.odometer_at_fill) });
      setShowFuelForm(false); setFuelForm({ vehicle_id: '', liters: '', cost_per_liter: '', odometer_at_fill: '' }); fetchAll();
    } catch (err: unknown) { const a = err as { response?: { data?: { message?: string } } }; setFormError(a.response?.data?.message || 'Failed'); }
  };

  const handleExpenseCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      await api.post('/expenses', { ...expenseForm, amount: parseFloat(expenseForm.amount) });
      setShowExpenseForm(false); setExpenseForm({ vehicle_id: '', category: 'TOLL', amount: '', description: '' }); fetchAll();
    } catch (err: unknown) { const a = err as { response?: { data?: { message?: string } } }; setFormError(a.response?.data?.message || 'Failed'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 6, color: '#111827', fontSize: 14, outline: 'none', marginTop: 4 };
  const labelStyle: React.CSSProperties = { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 };

  return (
    <div>
      {/* FUEL LOGS Section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>FUEL LOGS</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setShowFuelForm(!showFuelForm); setShowExpenseForm(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={14} /> Log Fuel
            </button>
            <button onClick={() => { setShowExpenseForm(!showExpenseForm); setShowFuelForm(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={14} /> Add Expense
            </button>
          </div>
        </div>

        {/* Fuel Form */}
        {showFuelForm && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20, marginBottom: 14 }}>
            {formError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 6 }}>{formError}</div>}
            <form onSubmit={handleFuelCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Vehicle</label><select value={fuelForm.vehicle_id} onChange={e => setFuelForm({...fuelForm, vehicle_id: e.target.value})} required style={inputStyle}><option value="">Select</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select></div>
              <div><label style={labelStyle}>Liters</label><input type="number" step="0.1" value={fuelForm.liters} onChange={e => setFuelForm({...fuelForm, liters: e.target.value})} required style={inputStyle} /></div>
              <div><label style={labelStyle}>Cost/L (₹)</label><input type="number" step="0.01" value={fuelForm.cost_per_liter} onChange={e => setFuelForm({...fuelForm, cost_per_liter: e.target.value})} required style={inputStyle} /></div>
              <div><label style={labelStyle}>Odometer</label><input type="number" value={fuelForm.odometer_at_fill} onChange={e => setFuelForm({...fuelForm, odometer_at_fill: e.target.value})} required style={inputStyle} /></div>
              <div style={{ gridColumn: 'span 4', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFuelForm(false)} style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Log Fuel</button>
              </div>
            </form>
          </div>
        )}

        {/* Expense Form */}
        {showExpenseForm && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20, marginBottom: 14 }}>
            {formError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 6 }}>{formError}</div>}
            <form onSubmit={handleExpenseCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Vehicle</label><select value={expenseForm.vehicle_id} onChange={e => setExpenseForm({...expenseForm, vehicle_id: e.target.value})} required style={inputStyle}><option value="">Select</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select></div>
              <div><label style={labelStyle}>Category</label><select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={inputStyle}><option value="TOLL">Toll</option><option value="PARKING">Parking</option><option value="REPAIR">Repair</option><option value="OTHER">Other</option></select></div>
              <div><label style={labelStyle}>Amount (₹)</label><input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required style={inputStyle} /></div>
              <div><label style={labelStyle}>Description</label><input value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={inputStyle} placeholder="Optional" /></div>
              <div style={{ gridColumn: 'span 4', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowExpenseForm(false)} style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Add Expense</button>
              </div>
            </form>
          </div>
        )}

        {/* Fuel Logs Table */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 6, borderRadius: 4 }} />)}</div>
          ) : fuelLogs.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Fuel size={28} style={{ color: '#D1D5DB', marginBottom: 8 }} /><p style={{ color: '#6B7280', fontSize: 13 }}>No fuel logs yet</p></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['VEHICLE', 'DATE', 'LITERS', 'FUEL COST'].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {fuelLogs.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 14px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{f.vehicle?.registration_number}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{new Date(f.log_date || f.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{Number(f.liters).toFixed(0)} L</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{Number(f.total_cost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* OTHER EXPENSES Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>OTHER EXPENSES (TOLL / MISC)</div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {expenses.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Receipt size={28} style={{ color: '#D1D5DB', marginBottom: 8 }} /><p style={{ color: '#6B7280', fontSize: 13 }}>No expenses yet</p></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['TRIP', 'VEHICLE', 'TOLL', 'OTHER', 'MAINT. (LINKED)', 'TOTAL'].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {expenses.map(ex => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#111827', fontFamily: 'monospace' }}>{ex.trip?.trip_number || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{ex.vehicle?.registration_number || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{ex.category === 'TOLL' ? Number(ex.amount).toLocaleString() : '0'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>{ex.category !== 'TOLL' ? Number(ex.amount).toLocaleString() : '0'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#4B5563' }}>0</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '3px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: '#10B981' }}>
                        {Number(ex.amount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Total Operational Cost */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <span style={{ fontSize: 13, color: '#E67E00', fontWeight: 600 }}>TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT</span>
        <span style={{ fontSize: 18, color: '#10B981', fontWeight: 700 }}>{fuelTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}
