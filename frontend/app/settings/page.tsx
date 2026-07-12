'use client';

import { useAuthStore } from '@/hooks/useAuth';
import { Shield, Info, Users } from 'lucide-react';

const MODULES = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];
const ROLES = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
const ROLE_LABELS: Record<string, string> = { FLEET_MANAGER: 'Fleet Manager', DISPATCHER: 'Dispatcher', SAFETY_OFFICER: 'Safety Officer', FINANCIAL_ANALYST: 'Financial Analyst' };

const ACCESS_MATRIX: Record<string, string[]> = {
  FLEET_MANAGER: ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'],
  DISPATCHER: ['Dashboard', 'Fleet', 'Trips', 'Fuel & Expenses', 'Analytics'],
  SAFETY_OFFICER: ['Dashboard', 'Fleet', 'Drivers', 'Maintenance', 'Analytics'],
  FINANCIAL_ANALYST: ['Dashboard', 'Fleet', 'Trips', 'Fuel & Expenses', 'Analytics'],
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const role = user?.role || '';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Profile Card */}
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={14} style={{ color: '#E67E00' }} /> YOUR PROFILE
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>USERNAME</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#E5E7EB' }}>{user?.username}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>ROLE</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#E67E00' }}>{ROLE_LABELS[role] || role}</div>
            </div>
          </div>
        </div>

        {/* Your Permissions */}
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={14} style={{ color: '#E67E00' }} /> YOUR ACCESS
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(ACCESS_MATRIX[role] || []).map(m => (
              <span key={m} style={{ padding: '5px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#fff', backgroundColor: '#059669' }}>{m}</span>
            ))}
            {MODULES.filter(m => !(ACCESS_MATRIX[role] || []).includes(m)).map(m => (
              <span key={m} style={{ padding: '5px 14px', borderRadius: 4, fontSize: 12, fontWeight: 500, color: '#4B5563', backgroundColor: '#1A1D26', border: '1px solid #2A2D38' }}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #1E2130' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RBAC ACCESS MATRIX</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2130' }}>
              <th style={{ padding: '10px 18px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>MODULE</th>
              {ROLES.map(r => (
                <th key={r} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.06em' }}>{ROLE_LABELS[r]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map(mod => (
              <tr key={mod} style={{ borderBottom: '1px solid #1A1D26' }}>
                <td style={{ padding: '10px 18px', fontSize: 13, color: '#E5E7EB', fontWeight: 500 }}>{mod}</td>
                {ROLES.map(r => {
                  const has = ACCESS_MATRIX[r].includes(mod);
                  return (
                    <td key={r} style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', width: 20, height: 20, borderRadius: 4,
                        backgroundColor: has ? '#059669' : '#1A1D26',
                        border: has ? 'none' : '1px solid #2A2D38',
                        lineHeight: '20px', fontSize: 12, color: '#fff', fontWeight: 700,
                      }}>
                        {has ? '✓' : ''}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Info */}
      <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={14} style={{ color: '#E67E00' }} /> SYSTEM INFO
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Backend', value: 'Express + Prisma' },
            { label: 'Frontend', value: 'Next.js 14' },
            { label: 'Database', value: 'PostgreSQL' },
          ].map(i => (
            <div key={i.label}>
              <div style={{ fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{i.label}</div>
              <div style={{ fontSize: 14, color: '#E5E7EB' }}>{i.value}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 16, borderTop: '1px solid #1E2130' }}>
          <div style={{ fontSize: 11, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>TEAM</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { name: 'Me-coder2024', area: 'Backend/DB/APIs', color: '#E67E00' },
              { name: 'aksh-1h', area: 'Auth, Dashboard, Vehicles, Trips', color: '#3B82F6' },
              { name: 'dixit-00', area: 'Drivers, Maintenance, Fuel', color: '#10B981' },
              { name: 'anam190', area: 'Analytics, Reports, Settings', color: '#8B5CF6' },
            ].map(t => (
              <div key={t.name} style={{ padding: 12, backgroundColor: '#0B0E14', borderRadius: 6, borderLeft: `3px solid ${t.color}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{t.area}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
