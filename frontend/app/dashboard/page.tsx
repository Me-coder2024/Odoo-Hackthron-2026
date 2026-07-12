'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuth';

interface KPIData {
  fleet: { total: number; available: number; on_trip: number; in_shop: number; retired: number };
  drivers: { total: number };
  trips: { total: number; active: number; completed: number };
  financial: { total_revenue: number; total_fuel_cost: number; total_maintenance_cost: number; total_expenses: number; net_profit: number };
}

interface FleetUtil {
  utilization_percent: number;
  on_trip: number;
  total_active: number;
  breakdown: { status: string; count: number }[];
}

interface RecentTrip {
  id: string;
  trip_number: string;
  source: string;
  destination: string;
  status: string;
  vehicle?: { name: string };
  driver?: { name: string };
  dispatched_at?: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6B7280',
  DISPATCHED: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
  ON_TRIP: '#3B82F6',
  AVAILABLE: '#10B981',
  IN_SHOP: '#F59E0B',
  RETIRED: '#EF4444',
};

const STATUS_BG: Record<string, string> = {
  DRAFT: '#374151',
  DISPATCHED: '#1D4ED8',
  COMPLETED: '#059669',
  CANCELLED: '#DC2626',
  ON_TRIP: '#1D4ED8',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [fleetUtil, setFleetUtil] = useState<FleetUtil | null>(null);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpiRes, utilRes, tripsRes] = await Promise.all([
          api.get('/analytics/kpis'),
          api.get('/analytics/fleet-utilization'),
          api.get('/trips?limit=5'),
        ]);
        setKpis(kpiRes.data.data);
        setFleetUtil(utilRes.data.data);
        setRecentTrips((tripsRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 8 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
          <div className="skeleton" style={{ height: 250, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 250, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'ACTIVE VEHICLES', value: (kpis?.fleet.total || 0) - (kpis?.fleet.retired || 0), border: '#3B82F6' },
    { label: 'AVAILABLE VEHICLES', value: kpis?.fleet.available || 0, border: '#10B981' },
    { label: 'VEHICLES IN MAINTENANCE', value: kpis?.fleet.in_shop || 0, border: '#F59E0B' },
    { label: 'ACTIVE TRIPS', value: kpis?.trips.active || 0, border: '#3B82F6' },
    { label: 'PENDING TRIPS', value: (kpis?.trips.total || 0) - (kpis?.trips.active || 0) - (kpis?.trips.completed || 0), border: '#8B5CF6' },
    { label: 'DRIVERS ON DUTY', value: kpis?.drivers.total || 0, border: '#10B981' },
    { label: 'FLEET UTILIZATION', value: `${fleetUtil?.utilization_percent || 0}%`, border: '#E67E00' },
  ];

  const vehicleStatusItems = fleetUtil?.breakdown || [];
  const totalVehicles = vehicleStatusItems.reduce((s, i) => s + i.count, 0);

  return (
    <div>
      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>FILTERS</span>
        <select style={{ padding: '6px 12px', backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 6, color: '#9CA3AF', fontSize: 13 }}>
          <option>Vehicle Type: All</option>
          <option>Van</option>
          <option>Truck</option>
          <option>Bus</option>
        </select>
        <select style={{ padding: '6px 12px', backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 6, color: '#9CA3AF', fontSize: 13 }}>
          <option>Status: All</option>
          <option>Available</option>
          <option>On Trip</option>
          <option>In Shop</option>
        </select>
        <select style={{ padding: '6px 12px', backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 6, color: '#9CA3AF', fontSize: 13 }}>
          <option>Region: All</option>
        </select>
      </div>

      {/* KPI Cards — 7 across */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 28 }}>
        {kpiCards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: '#111420',
              border: '1px solid #1E2130',
              borderTop: `3px solid ${card.border}`,
              borderRadius: 8,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, lineHeight: 1.4 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#E5E7EB' }}>
              {typeof card.value === 'number' ? String(card.value).padStart(2, '0') : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Recent Trips + Vehicle Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Recent Trips */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>RECENT TRIPS</h3>
          <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E2130' }}>
                  {['TRIP', 'VEHICLE', 'DRIVER', 'STATUS', 'ETA'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrips.length > 0 ? recentTrips.map((trip) => (
                  <tr key={trip.id} style={{ borderBottom: '1px solid #1A1D26' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB', fontFamily: 'monospace' }}>{trip.trip_number}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{trip.vehicle?.name || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{trip.driver?.name || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#fff',
                        backgroundColor: STATUS_BG[trip.status] || '#374151',
                      }}>
                        {trip.status === 'DISPATCHED' ? 'On Trip' : trip.status.charAt(0) + trip.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>
                      {trip.status === 'DISPATCHED' ? '~45 min' : trip.status === 'COMPLETED' ? '—' : 'Awaiting vehicle'}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>No recent trips</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>VEHICLE STATUS</h3>
          <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {vehicleStatusItems.map((item) => {
                const pct = totalVehicles > 0 ? (item.count / totalVehicles) * 100 : 0;
                const color = STATUS_COLORS[item.status] || '#475569';
                return (
                  <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#9CA3AF', width: 70, textAlign: 'right' }}>
                      {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1).toLowerCase()}
                    </span>
                    <div style={{ flex: 1, height: 18, backgroundColor: '#1A1D26', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: color,
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                          minWidth: pct > 0 ? 8 : 0,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
