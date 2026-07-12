'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Fuel, Receipt } from 'lucide-react';

export default function FuelExpensesPage() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');
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

  const fuelTotal = fuelLogs.reduce((s, f) => s + Number(f.liters) * Number(f.cost_per_liter), 0);
  const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);

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

  const inputStyle = { width: '100%', padding: '10px 14px', backgroundColor: '#1A1D26', border: '1px solid #2A2D38', borderRadius: 6, color: '#E5E7EB', fontSize: 14, outline: 'none', marginTop: 4 };
  const labelStyle = { fontSize: 11, color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 };
  const autoTotal = fuelForm.liters && fuelForm.cost_per_liter ? (parseFloat(fuelForm.liters) * parseFloat(fuelForm.cost_per_liter)).toFixed(2) : '0.00';

  return (
    <div>
      {/* Tab buttons + Add buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setActiveTab('fuel')} style={{ padding: '8px 20px', backgroundColor: activeTab === 'fuel' ? '#E67E00' : '#1A1D26', color: activeTab === 'fuel' ? '#fff' : '#9CA3AF', border: '1px solid #2A2D38', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Fuel Logs</button>
          <button onClick={() => setActiveTab('expenses')} style={{ padding: '8px 20px', backgroundColor: activeTab === 'expenses' ? '#E67E00' : '#1A1D26', color: activeTab === 'expenses' ? '#fff' : '#9CA3AF', border: '1px solid #2A2D38', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Expenses</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setShowFuelForm(!showFuelForm); setShowExpenseForm(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Log Fuel
          </button>
          <button onClick={() => { setShowExpenseForm(!showExpenseForm); setShowFuelForm(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', backgroundColor: '#E67E00', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* Fuel Form */}
      {showFuelForm && (
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: '#E5E7EB' }}>Log Fuel</h3>
          {formError && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{formError}</div>}
          <form onSubmit={handleFuelCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={labelStyle}>Vehicle</label><select value={fuelForm.vehicle_id} onChange={e => setFuelForm({...fuelForm, vehicle_id: e.target.value})} required style={inputStyle}><option value="">Select</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number}</option>)}</select></div>
            <div><label style={labelStyle}>Liters</label><input type="number" step="0.1" value={fuelForm.liters} onChange={e => setFuelForm({...fuelForm, liters: e.target.value})} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Cost Per Liter (₹)</label><input type="number" step="0.01" value={fuelForm.cost_per_liter} onChange={e => setFuelForm({...fuelForm, cost_per_liter: e.target.value})} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Odometer at Fill</label><input type="number" value={fuelForm.odometer_at_fill} onChange={e => setFuelForm({...fuelForm, odometer_at_fill: e.target.value})} required style={inputStyle} /></div>
            <div style={{ gridColumn: 'span 2' }}><p style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>Total: ₹{autoTotal}</p></div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowFuelForm(false)} style={{ padding: '8px 16px', backgroundColor: '#1A1D26', color: '#9CA3AF', border: '1px solid #2A2D38', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Log Fuel</button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Form */}
      {showExpenseForm && (
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: '#E5E7EB' }}>Add Expense</h3>
          {formError && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{formError}</div>}
          <form onSubmit={handleExpenseCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={labelStyle}>Vehicle</label><select value={expenseForm.vehicle_id} onChange={e => setExpenseForm({...expenseForm, vehicle_id: e.target.value})} required style={inputStyle}><option value="">Select</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number}</option>)}</select></div>
            <div><label style={labelStyle}>Category</label><select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={inputStyle}><option value="TOLL">Toll</option><option value="PARKING">Parking</option><option value="REPAIR">Repair</option><option value="OTHER">Other</option></select></div>
            <div><label style={labelStyle}>Amount (₹)</label><input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Description</label><input value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={inputStyle} placeholder="Optional note" /></div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowExpenseForm(false)} style={{ padding: '8px 16px', backgroundColor: '#1A1D26', color: '#9CA3AF', border: '1px solid #2A2D38', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#E67E00', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Add Expense</button>
            </div>
          </form>
        </div>
      )}

      {/* Cost summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: '3px solid #EF4444', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>TOTAL FUEL COST</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#E5E7EB' }}>₹{fuelTotal.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: '3px solid #E67E00', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>TOTAL EXPENSES</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#E5E7EB' }}>₹{expenseTotal.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: '3px solid #8B5CF6', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>OPERATIONAL TOTAL</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#E5E7EB' }}>₹{(fuelTotal + expenseTotal).toLocaleString()}</div>
          <div style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>Fuel + Maintenance = Total</div>
        </div>
      </div>

      {/* Fuel Logs Table */}
      {activeTab === 'fuel' && (
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E2130' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>FUEL LOGS</span>
          </div>
          {loading ? (
            <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 4 }} />)}</div>
          ) : fuelLogs.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center' }}><Fuel size={32} style={{ color: '#374151', marginBottom: 8 }} /><p style={{ color: '#4B5563', fontSize: 13 }}>No fuel logs yet</p></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1E2130' }}>
                {['DATE', 'VEHICLE', 'LITERS', 'COST/L', 'TOTAL', 'ODOMETER'].map(h => (<th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>))}
              </tr></thead>
              <tbody>
                {fuelLogs.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #1A1D26' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{new Date(f.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB' }}>{f.vehicle?.name}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{Number(f.liters).toFixed(1)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>₹{Number(f.cost_per_liter).toFixed(2)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB', fontWeight: 500 }}>₹{(Number(f.liters) * Number(f.cost_per_liter)).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{Number(f.odometer_at_fill).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Expenses Table */}
      {activeTab === 'expenses' && (
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E2130' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EXPENSES</span>
          </div>
          {loading ? (
            <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 4 }} />)}</div>
          ) : expenses.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center' }}><Receipt size={32} style={{ color: '#374151', marginBottom: 8 }} /><p style={{ color: '#4B5563', fontSize: 13 }}>No expenses yet</p></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1E2130' }}>
                {['DATE', 'VEHICLE', 'CATEGORY', 'AMOUNT', 'DESCRIPTION'].map(h => (<th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>))}
              </tr></thead>
              <tbody>
                {expenses.map(ex => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid #1A1D26' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{new Date(ex.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB' }}>{ex.vehicle?.name}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: ex.category === 'TOLL' ? '#3B82F6' : ex.category === 'PARKING' ? '#8B5CF6' : '#E67E00' }}>{ex.category}</span></td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB', fontWeight: 500 }}>₹{Number(ex.amount).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>{ex.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: '#E67E00', fontStyle: 'italic' }}>
        Operational cost = Fuel + Maintenance per vehicle
      </p>
    </div>
  );
}
