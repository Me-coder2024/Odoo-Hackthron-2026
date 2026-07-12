'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Icon } from '@iconify/react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('DISPATCHER');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || (err instanceof Error ? err.message : 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (user: string) => {
    setUsername(user);
    setPassword('password123');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
      {/* Left panel — branding (Blue Side) */}
      <div
        style={{
          width: '38%',
          backgroundColor: '#1542C2',
          padding: '48px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Logo */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Icon icon="mdi:truck-delivery" width="24" height="24" color="#1542C2" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
            TransitOps
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.75)', marginBottom: 40 }}>
            Smart Transport Operations Platform
          </p>

          {/* Roles */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>
              One login, four roles:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((role) => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FFFFFF', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#FFFFFF' }}>{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>TRANSITOPS © 2026 · RBAC EVAL</p>
      </div>

      {/* Right panel — form (White Side) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 40px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
            Enter your credentials to continue
          </p>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                backgroundColor: 'rgba(220, 38, 38, 0.06)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                borderRadius: 6,
                marginBottom: 14,
                fontSize: 12,
                color: '#DC2626',
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email / Username */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                EMAIL
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Raven@transitops.."
                required
                autoFocus
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 6,
                  color: '#111827',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 6,
                  color: '#111827',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            {/* Role RBAC Dropdown */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                ROLE RBAC
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 6,
                  color: '#111827',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="FLEET_MANAGER">Fleet Manager</option>
                <option value="DISPATCHER">Dispatcher</option>
                <option value="SAFETY_OFFICER">Safety Officer</option>
                <option value="FINANCIAL_ANALYST">Financial Analyst</option>
              </select>
            </div>

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#4B5563' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#1542C2', width: 14, height: 14 }} />
                Remember me
              </label>
              <span style={{ fontSize: 12, color: '#1542C2', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: isSubmitting ? '#9CA3AF' : '#1542C2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: (!username || !password) ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Role access info */}
          <div style={{ marginTop: 14, fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>
            <p style={{ marginBottom: 4, fontWeight: 600 }}>Access is scoped by role after login:</p>
            <p>• Fleet Manager → Fleet, Maintenance</p>
            <p>• Dispatcher → Dashboard, Trips</p>
            <p>• Safety Officer → Drivers, Compliance</p>
            <p>• Financial Analyst → Fuel & Expenses, Analytics</p>
          </div>

          {/* Demo credential quick-fill */}
          <div
            style={{
              marginTop: 14,
              padding: 10,
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              fontSize: 11,
            }}
          >
            <p style={{ color: '#4B5563', marginBottom: 4, fontWeight: 600 }}>
              Demo Credentials (password: password123)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}>
              {[
                { user: 'fleet_manager', role: 'Fleet Manager' },
                { user: 'dispatcher', role: 'Dispatcher' },
                { user: 'safety_officer', role: 'Safety Officer' },
                { user: 'financial_analyst', role: 'Analyst' },
              ].map((cred) => (
                <button
                  key={cred.user}
                  type="button"
                  onClick={() => fillCredentials(cred.user)}
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 0',
                    color: '#4B5563',
                    fontSize: 11,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#1542C2'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4B5563'; }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{cred.user}</span>
                  <span style={{ color: '#6B7280', marginLeft: 4 }}>• {cred.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
