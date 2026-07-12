'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Fuel, DollarSign, Download, Percent } from 'lucide-react';

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [fleetUtil, setFleetUtil] = useState<any>(null);
  const [fuelEff, setFuelEff] = useState<any>(null);
  const [opCost, setOpCost] = useState<any>(null);
  const [roi, setRoi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        const [k, u, f, o, r] = await Promise.all([
          api.get('/analytics/kpis'), api.get('/analytics/fleet-utilization'),
          api.get('/analytics/fuel-efficiency'), api.get('/analytics/operational-cost'),
          api.get('/analytics/vehicle-roi'),
        ]);
        setKpis(k.data.data); setFleetUtil(u.data.data); setFuelEff(f.data.data); setOpCost(o.data.data); setRoi(r.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    })();
  }, []);

  const handleExport = async (type: string) => {
    try {
      const res = await api.get(`/analytics/export-csv?type=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${type}-export.csv`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  if (loading) return (<div><div className="skeleton" style={{ height: 28, width: 200, marginBottom: 24 }} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 10 }} />)}</div><div className="skeleton" style={{ height: 400, borderRadius: 10 }} /></div>);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Analytics</h1><p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Live-computed fleet intelligence</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['vehicles', 'trips', 'fuel-logs', 'expenses'].map(type => (
            <button key={type} onClick={() => handleExport(type)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 6, color: 'var(--color-text-secondary)', fontSize: 12, cursor: 'pointer' }}>
              <Download size={12} /> {type.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--color-border-default)' }}>
        {[{ key: 'overview', label: 'Overview' }, { key: 'fuel', label: 'Fuel Efficiency' }, { key: 'cost', label: 'Operational Cost' }, { key: 'roi', label: 'Vehicle ROI' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '10px 24px', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === t.key ? '2px solid var(--color-accent)' : '2px solid transparent', color: activeTab === t.key ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && kpis && fleetUtil && (
        <div>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { icon: <Percent size={20} />, label: 'Fleet Utilization', value: `${fleetUtil.utilization_percent}%`, color: '#E67E00' },
              { icon: <TrendingUp size={20} />, label: 'Revenue', value: fmt(kpis.financial.total_revenue), color: '#10B981' },
              { icon: <DollarSign size={20} />, label: 'Net Profit', value: fmt(kpis.financial.net_profit), color: kpis.financial.net_profit >= 0 ? '#10B981' : '#EF4444' },
              { icon: <Fuel size={20} />, label: 'Avg Fuel Eff.', value: fuelEff ? `${fuelEff.average_efficiency_km_per_liter} km/L` : '—', color: '#3B82F6' },
            ].map(k => (
              <div key={k.label} style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ color: k.color }}>{k.icon}</span><span style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const }}>{k.label}</span></div>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)' }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Fleet breakdown */}
          <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: 'var(--color-text-primary)' }}>Fleet Status Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Available', value: kpis.fleet.available, color: '#10B981' },
                { label: 'On Trip', value: kpis.fleet.on_trip, color: '#3B82F6' },
                { label: 'In Shop', value: kpis.fleet.in_shop, color: '#F59E0B' },
                { label: 'Retired', value: kpis.fleet.retired, color: '#6B7280' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: 20, backgroundColor: 'var(--color-bg-surface)', borderRadius: 8, borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 32, fontWeight: 600, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fuel' && fuelEff && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-accent)' }}>{fuelEff.average_efficiency_km_per_liter}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Avg Efficiency (km/L)</div>
            </div>
            <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)' }}>{fuelEff.total_distance.toLocaleString()}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Distance (km)</div>
            </div>
            <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)' }}>{fuelEff.total_fuel.toLocaleString()}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Fuel (L)</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, overflow: 'hidden' }}>
            <table><thead><tr><th>Trip</th><th>Vehicle</th><th>Type</th><th>Distance</th><th>Fuel</th><th>Efficiency</th></tr></thead>
            <tbody>{fuelEff.trips.map((t: any) => (<tr key={t.trip_number}><td style={{ fontFamily: 'monospace', fontSize: 13 }}>{t.trip_number}</td><td>{t.vehicle} ({t.vehicle_reg})</td><td>{t.vehicle_type}</td><td>{t.actual_distance} km</td><td>{t.fuel_consumed} L</td><td style={{ fontWeight: 500, color: t.efficiency_km_per_liter >= fuelEff.average_efficiency_km_per_liter ? '#10B981' : '#EF4444' }}>{t.efficiency_km_per_liter} km/L</td></tr>))}</tbody></table>
          </div>
        </div>
      )}

      {activeTab === 'cost' && opCost && (
        <div>
          <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, padding: 20, marginBottom: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>TOTAL OPERATIONAL COST</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--color-accent)' }}>{fmt(opCost.total_operational_cost)}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, overflow: 'hidden' }}>
            <table><thead><tr><th>Vehicle</th><th>Type</th><th>Fuel Cost</th><th>Maintenance</th><th>Expenses</th><th>Total</th></tr></thead>
            <tbody>{opCost.vehicles.map((v: any) => (<tr key={v.vehicle_id}><td>{v.vehicle_name} <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>({v.registration_number})</span></td><td>{v.vehicle_type}</td><td>{fmt(v.fuel_cost)}</td><td>{fmt(v.maintenance_cost)}</td><td>{fmt(v.expense_cost)}</td><td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{fmt(v.total_operational_cost)}</td></tr>))}</tbody></table>
          </div>
        </div>
      )}

      {activeTab === 'roi' && roi && (
        <div style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 10, overflow: 'hidden' }}>
          <table><thead><tr><th>Vehicle</th><th>Status</th><th>Acquisition</th><th>Revenue</th><th>Costs</th><th>Net Profit</th><th>ROI %</th></tr></thead>
          <tbody>{roi.vehicles.map((v: any) => (<tr key={v.vehicle_id}>
            <td>{v.vehicle_name} <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>({v.registration_number})</span></td>
            <td>{v.status}</td>
            <td>{fmt(v.acquisition_cost)}</td>
            <td>{fmt(v.total_revenue)}</td>
            <td>{fmt(v.fuel_cost + v.maintenance_cost)}</td>
            <td style={{ fontWeight: 500, color: v.net_profit >= 0 ? '#10B981' : '#EF4444' }}>{fmt(v.net_profit)}</td>
            <td><span style={{ fontSize: 13, fontWeight: 600, color: v.roi_percent >= 0 ? '#10B981' : '#EF4444' }}>{v.roi_percent}%</span></td>
          </tr>))}</tbody></table>
        </div>
      )}
    </div>
  );
}
