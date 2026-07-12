'use client';

import { useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';

const ROLES = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
const ROLE_LABELS: Record<string, string> = { FLEET_MANAGER: 'Fleet Manager', DISPATCHER: 'Dispatcher', SAFETY_OFFICER: 'Safety Officer', FINANCIAL_ANALYST: 'Financial Analyst' };

// RBAC matrix matching mockup exactly: Role → Fleet, Drivers, Trips, Fuel/Exp., Analytics
const RBAC_MATRIX: Record<string, Record<string, string>> = {
  FLEET_MANAGER:    { Fleet: '✓', Drivers: '✓', Trips: '—', 'Fuel/Exp.': '—', Analytics: '✓' },
  DISPATCHER:       { Fleet: 'View', Drivers: '—', Trips: '✓', 'Fuel/Exp.': '—', Analytics: '—' },
  SAFETY_OFFICER:   { Fleet: '—', Drivers: '✓', Trips: 'View', 'Fuel/Exp.': '—', Analytics: '—' },
  FINANCIAL_ANALYST:{ Fleet: '✓', Drivers: '—', Trips: '—', 'Fuel/Exp.': '✓', Analytics: '✓' },
};

const COLUMNS = ['Fleet', 'Drivers', 'Trips', 'Fuel/Exp.', 'Analytics'];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [depotName, setDepotName] = useState('Gandhinagar Depot G14');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 6, color: '#111827', fontSize: 14, outline: 'none', marginTop: 4 };
  const labelStyle: React.CSSProperties = { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 32 }}>
      {/* LEFT — General Settings */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>GENERAL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>DEPOT NAME</label>
            <input value={depotName} onChange={e => setDepotName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>CURRENCY</label>
            <input value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>DISTANCE UNIT</label>
            <input value={distanceUnit} onChange={e => setDistanceUnit(e.target.value)} style={inputStyle} />
          </div>
          <button style={{
            marginTop: 8, padding: '12px 28px', backgroundColor: '#3B82F6', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            width: 'fit-content',
          }}>
            Save changes
          </button>
        </div>
      </div>

      {/* RIGHT — RBAC Matrix */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>ROLE-BASED ACCESS (RBAC)</div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>ROLE</th>
                {COLUMNS.map(c => (
                  <th key={c} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.06em' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map(role => (
                <tr key={role} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{ROLE_LABELS[role]}</td>
                  {COLUMNS.map(col => {
                    const val = RBAC_MATRIX[role][col];
                    const color = val === '✓' ? '#111827' : val === 'View' ? '#3B82F6' : '#9CA3AF';
                    return (
                      <td key={col} style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color, fontWeight: val === '✓' ? 600 : 500 }}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
