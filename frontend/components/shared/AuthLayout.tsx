'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { Sidebar } from '@/components/shared/Sidebar';
import { Search } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  FLEET_MANAGER: 'Fleet Mgr',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Off.',
  FINANCIAL_ANALYST: 'Fin. Analyst',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  FLEET_MANAGER: '#E67E00',
  DISPATCHER: '#3B82F6',
  SAFETY_OFFICER: '#10B981',
  FINANCIAL_ANALYST: '#8B5CF6',
};

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Login page — no sidebar/header
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-page)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid var(--color-border-default)',
              borderTopColor: 'var(--color-accent)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading TransitOps...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const userRole = user?.role || '';
  const badgeColor = ROLE_BADGE_COLORS[userRole] || '#475569';
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const displayName = user?.username ? (user.username.charAt(0).toUpperCase() + user.username.slice(1).replace('_', ' ')) : '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 200, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: 52,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                backgroundColor: '#F3F4F6',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                color: '#111827',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* User info + role badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13, color: '#4B5563' }}>{displayName}</span>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
                backgroundColor: badgeColor,
                border: `1px solid ${badgeColor}`,
                letterSpacing: '0.03em',
              }}
            >
              {roleLabel}
            </span>
          </div>
        </header>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: '24px 28px',
            backgroundColor: 'var(--color-bg-page)',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
