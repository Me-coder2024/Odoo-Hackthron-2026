'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { Truck, AlertCircle } from 'lucide-react';

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
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0B0E14' }}>
      {/* Left panel — branding */}
      <div
        style={{
          width: '40%',
          backgroundColor: '#C8CDD4',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Logo */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              backgroundColor: '#E67E00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Truck size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0B0E14', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
            TransitOps
          </h1>
          <p style={{ fontSize: 14, color: '#4B5563', marginBottom: 60 }}>
            Smart Transport Operations Platform
          </p>

          {/* Roles */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#1F2937', marginBottom: 16 }}>
              One login, four roles:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((role) => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#E67E00', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#1F2937' }}>{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#6B7280' }}>TRANSITOPS © 2026 · RBAC EVAL</p>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 60px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#E5E7EB', marginBottom: 6 }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 32 }}>
            Enter your credentials to continue
          </p>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                color: '#F87171',
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email / Username */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
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
                  padding: '10px 14px',
                  backgroundColor: '#1A1D26',
                  border: '1px solid #2A2D38',
                  borderRadius: 6,
                  color: '#E5E7EB',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
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
                  padding: '10px 14px',
                  backgroundColor: '#1A1D26',
                  border: '1px solid #2A2D38',
                  borderRadius: 6,
                  color: '#E5E7EB',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            {/* Role RBAC Dropdown */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                ROLE RBAC
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#1A1D26',
                  border: '1px solid #2A2D38',
                  borderRadius: 6,
                  color: '#E5E7EB',
                  fontSize: 14,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#9CA3AF' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#10B981', width: 16, height: 16 }} />
                Remember me
              </label>
              <span style={{ fontSize: 13, color: '#E67E00', cursor: 'pointer' }}>Forgot password?</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: isSubmitting ? '#4B5563' : '#E67E00',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
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
          <div style={{ marginTop: 28, fontSize: 12, color: '#6B7280', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 6, fontSize: 12 }}>Access is scoped by role after login:</p>
            <p>• Fleet Manager → Fleet, Maintenance</p>
            <p>• Dispatcher → Dashboard, Trips</p>
            <p>• Safety Officer → Drivers, Compliance</p>
            <p>• Financial Analyst → Fuel & Expenses, Analytics</p>
          </div>

          {/* Demo credential quick-fill */}
          <div
            style={{
              marginTop: 24,
              padding: 14,
              backgroundColor: '#111420',
              border: '1px solid #1E2130',
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            <p style={{ color: '#6B7280', marginBottom: 8, fontWeight: 500 }}>
              Demo Credentials (password: password123)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
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
                    padding: '4px 0',
                    color: '#9CA3AF',
                    fontSize: 12,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#E67E00'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
                >
                  <span style={{ fontFamily: 'monospace' }}>{cred.user}</span>
                  <span style={{ color: '#4B5563', marginLeft: 4 }}>• {cred.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
