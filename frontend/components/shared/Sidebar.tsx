'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { Icon } from '@iconify/react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Icon icon="mdi:view-dashboard" width="18" height="18" />,
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  },
  {
    label: 'Fleet',
    href: '/vehicles',
    icon: <Icon icon="mdi:truck" width="18" height="18" />,
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  },
  {
    label: 'Drivers',
    href: '/drivers',
    icon: <Icon icon="mdi:account-group" width="18" height="18" />,
    roles: ['FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'],
  },
  {
    label: 'Trips',
    href: '/trips',
    icon: <Icon icon="mdi:map-marker-distance" width="18" height="18" />,
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  },
  {
    label: 'Maintenance',
    href: '/maintenance',
    icon: <Icon icon="mdi:wrench" width="18" height="18" />,
    roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'],
  },
  {
    label: 'Fuel & Expenses',
    href: '/fuel-expenses',
    icon: <Icon icon="mdi:gas-station" width="18" height="18" />,
    roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER'],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <Icon icon="mdi:chart-bar" width="18" height="18" />,
    roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER', 'SAFETY_OFFICER'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Icon icon="mdi:cog" width="18" height="18" />,
    roles: ['FLEET_MANAGER'],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const userRole = user?.role || '';
  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={`sidebar-responsive ${isOpen ? 'open' : ''}`}
      style={{
        width: 200,
        minHeight: '100vh',
        backgroundColor: '#1542C2',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Brand */}
      <div
        style={{
          height: 60,
          padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon="mdi:truck" width="16" height="16" color="#1542C2" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            TransitOps
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hamburger-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: 4,
            }}
          >
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid #FFFFFF' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            width: '100%',
            borderRadius: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.75)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
          }}
        >
          <Icon icon="mdi:logout" width="18" height="18" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
