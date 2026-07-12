'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Download, Fuel, TrendingUp, DollarSign, Percent } from 'lucide-react';

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

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 8 }} />)}
      </div>
      <div className="skeleton" style={{ height: 350, borderRadius: 8 }} />
    </div>
  );

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'fuel', label: 'Fuel Efficiency' },
    { key: 'cost', label: 'Operational Cost' },
    { key: 'roi', label: 'Vehicle ROI' },
  ];

  return (
    <div>
      {/* Tabs + Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '8px 18px', backgroundColor: activeTab === t.key ? '#E67E00' : '#1A1D26',
              color: activeTab === t.key ? '#fff' : '#6B7280', border: '1px solid #2A2D38',
              borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => handleExport('all')} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 6,
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* KPI Summary Cards */}
      {kpis && fleetUtil && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: <Percent size={18} />, label: 'FLEET UTILIZATION', value: `${fleetUtil.utilization_percent}%`, border: '#E67E00' },
            { icon: <TrendingUp size={18} />, label: 'TOTAL REVENUE', value: fmt(kpis.financial.total_revenue), border: '#10B981' },
            { icon: <DollarSign size={18} />, label: 'NET PROFIT', value: fmt(kpis.financial.net_profit), border: kpis.financial.net_profit >= 0 ? '#10B981' : '#EF4444' },
            { icon: <Fuel size={18} />, label: 'AVG FUEL EFF.', value: fuelEff ? `${fuelEff.average_efficiency_km_per_liter} km/L` : '—', border: '#3B82F6' },
          ].map(k => (
            <div key={k.label} style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: `3px solid ${k.border}`, borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: k.border }}>{k.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#E5E7EB' }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Overview Tab — Fleet breakdown + bar visualization */}
      {activeTab === 'overview' && kpis && fleetUtil && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Fleet Status breakdown */}
          <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>FLEET STATUS BREAKDOWN</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Available', value: kpis.fleet.available, color: '#10B981' },
                { label: 'On Trip', value: kpis.fleet.on_trip, color: '#3B82F6' },
                { label: 'In Shop', value: kpis.fleet.in_shop, color: '#F59E0B' },
                { label: 'Retired', value: kpis.fleet.retired, color: '#EF4444' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: 16, backgroundColor: '#0B0E14', borderRadius: 6, borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>FINANCIAL SUMMARY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total Revenue', value: fmt(kpis.financial.total_revenue), color: '#10B981' },
                { label: 'Fuel Cost', value: fmt(kpis.financial.total_fuel_cost), color: '#EF4444' },
                { label: 'Maintenance', value: fmt(kpis.financial.total_maintenance_cost), color: '#F59E0B' },
                { label: 'Expenses', value: fmt(kpis.financial.total_expenses), color: '#8B5CF6' },
                { label: 'Net Profit', value: fmt(kpis.financial.net_profit), color: kpis.financial.net_profit >= 0 ? '#10B981' : '#EF4444' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#0B0E14', borderRadius: 6 }}>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>{f.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: f.color }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fuel Efficiency Tab */}
      {activeTab === 'fuel' && fuelEff && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: '3px solid #E67E00', borderRadius: 8, padding: '16px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>AVG EFFICIENCY</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#E67E00' }}>{fuelEff.average_efficiency_km_per_liter} km/L</div>
            </div>
            <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: '3px solid #3B82F6', borderRadius: 8, padding: '16px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>TOTAL DISTANCE</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#E5E7EB' }}>{fuelEff.total_distance.toLocaleString()} km</div>
            </div>
            <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: '3px solid #10B981', borderRadius: 8, padding: '16px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>TOTAL FUEL</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#E5E7EB' }}>{fuelEff.total_fuel.toLocaleString()} L</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1E2130' }}>
                {['TRIP', 'VEHICLE', 'TYPE', 'DISTANCE', 'FUEL', 'EFFICIENCY'].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>{fuelEff.trips.map((t: any) => (
                <tr key={t.trip_number} style={{ borderBottom: '1px solid #1A1D26' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: '#E5E7EB' }}>{t.trip_number}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{t.vehicle} ({t.vehicle_reg})</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>{t.vehicle_type}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{t.actual_distance} km</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{t.fuel_consumed} L</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: t.efficiency_km_per_liter >= fuelEff.average_efficiency_km_per_liter ? '#10B981' : '#EF4444' }}>{t.efficiency_km_per_liter} km/L</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operational Cost Tab */}
      {activeTab === 'cost' && opCost && (
        <div>
          <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderTop: '3px solid #E67E00', borderRadius: 8, padding: '16px 18px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>TOTAL OPERATIONAL COST</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#E67E00' }}>{fmt(opCost.total_operational_cost)}</div>
          </div>
          <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1E2130' }}>
                {['VEHICLE', 'TYPE', 'FUEL COST', 'MAINTENANCE', 'EXPENSES', 'TOTAL'].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>{opCost.vehicles.map((v: any) => (
                <tr key={v.vehicle_id} style={{ borderBottom: '1px solid #1A1D26' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB' }}>{v.vehicle_name} <span style={{ color: '#4B5563' }}>({v.registration_number})</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>{v.vehicle_type}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{fmt(v.fuel_cost)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{fmt(v.maintenance_cost)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{fmt(v.expense_cost)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#E67E00' }}>{fmt(v.total_operational_cost)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROI Tab */}
      {activeTab === 'roi' && roi && (
        <div style={{ backgroundColor: '#111420', border: '1px solid #1E2130', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1E2130' }}>
              {['VEHICLE', 'STATUS', 'ACQUISITION', 'REVENUE', 'COSTS', 'NET PROFIT', 'ROI %'].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>)}
            </tr></thead>
            <tbody>{roi.vehicles.map((v: any) => (
              <tr key={v.vehicle_id} style={{ borderBottom: '1px solid #1A1D26' }}>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#E5E7EB' }}>{v.vehicle_name} <span style={{ color: '#4B5563' }}>({v.registration_number})</span></td>
                <td style={{ padding: '10px 14px' }}><span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: v.status === 'AVAILABLE' ? '#059669' : v.status === 'ON_TRIP' ? '#2563EB' : v.status === 'IN_SHOP' ? '#D97706' : '#DC2626' }}>{v.status.replace('_', ' ')}</span></td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#9CA3AF' }}>{fmt(v.acquisition_cost)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#10B981' }}>{fmt(v.total_revenue)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#EF4444' }}>{fmt(v.fuel_cost + v.maintenance_cost)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: v.net_profit >= 0 ? '#10B981' : '#EF4444' }}>{fmt(v.net_profit)}</td>
                <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: v.roi_percent >= 0 ? '#10B981' : '#EF4444' }}>{v.roi_percent}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
