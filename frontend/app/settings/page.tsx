'use client';

import { useAuthStore } from '@/hooks/useAuth';
import { Settings, Shield, Info, ExternalLink } from 'lucide-react';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  FLEET_MANAGER: ['All fleet assets', 'Vehicle lifecycle (create, update, delete, retire)', 'Maintenance management', 'Driver management', 'Trip oversight', 'Analytics access', 'Settings access'],
  DISPATCHER: ['Dashboard access', 'Trip creation & dispatch', 'Trip completion & cancellation', 'Vehicle viewing', 'Fuel log creation', 'Expense creation'],
  SAFETY_OFFICER: ['Driver management', 'Safety score monitoring', 'License compliance', 'Maintenance management', 'Analytics viewing'],
  FINANCIAL_ANALYST: ['Financial analytics', 'Fuel log management', 'Expense management', 'ROI analysis', 'CSV data export'],
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const role = user?.role || '';

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Platform configuration and role permissions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Profile */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} style={{ color: 'var(--color-accent)' }} /> Your Profile
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, marginBottom: 4 }}>Username</div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{user?.username}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, marginBottom: 4 }}>Role</div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-accent)' }}>{role.replace('_', ' ')}</div></div>
          </div>
        </div>

        {/* Permissions */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} style={{ color: 'var(--color-accent)' }} /> Your Permissions
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(ROLE_PERMISSIONS[role] || []).map(p => (
              <li key={p} style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0 }} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* System Info */}
        <div style={{ gridColumn: 'span 2', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={16} style={{ color: 'var(--color-accent)' }} /> System Info
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Backend', value: 'Express + Prisma' },
              { label: 'Frontend', value: 'Next.js 14' },
              { label: 'Database', value: 'PostgreSQL' },
            ].map(i => (<div key={i.label}><div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, marginBottom: 4 }}>{i.label}</div><div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{i.value}</div></div>))}
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 12 }}>Team</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { name: 'Me-coder2024', area: 'Backend/DB/APIs' },
                { name: 'aksh-1h', area: 'Auth, Dashboard, Vehicles, Trips' },
                { name: 'dixit-00', area: 'Drivers, Maintenance, Fuel' },
                { name: 'anam190', area: 'Analytics, Reports, Settings' },
              ].map(t => (
                <div key={t.name} style={{ padding: 12, backgroundColor: 'var(--color-bg-surface)', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{t.area}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
