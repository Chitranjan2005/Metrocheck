import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { IconDashboard } from '../components/Icons';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/scans/stats/summary'), api.get('/api/scans')])
      .then(([s, all]) => {
        setStats(s.data);
        setScans(all.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  if (loading) {
    return (
      <div className="view">
        <ViewHead />
        <div className="placeholder">Loading…</div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="view">
        <ViewHead />
        <div className="panel">
          <div className="empty-state">
            <IconDashboard width={34} height={34} color="var(--faint)" />
            <p>No scans yet this session. Run a scan to populate the dashboard.</p>
            <Link to="/scan"><button className="primary">Go to scan</button></Link>
          </div>
        </div>
      </div>
    );
  }

  const { total, pass, warn, fail } = stats;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const passDeg = pct(pass) * 3.6;
  const warnDeg = pct(warn) * 3.6;

  return (
    <div className="view">
      <ViewHead />

      <div className="kpi-row">
        <div className="kpi"><div className="kpi-label">Total scanned</div><div className="kpi-val">{total}</div></div>
        <div className="kpi"><div className="kpi-label">Compliant</div><div className="kpi-val pass">{pass}</div></div>
        <div className="kpi"><div className="kpi-label">Review required</div><div className="kpi-val warn">{warn}</div></div>
        <div className="kpi"><div className="kpi-label">Non-compliant</div><div className="kpi-val fail">{fail}</div></div>
      </div>

      <div className="dash-grid">
        <div className="panel donut-wrap">
          <p className="panel-label" style={{ alignSelf: 'flex-start' }}>Verdict distribution</p>
          <div
            className="donut"
            style={{ background: `conic-gradient(#0d9488 0deg ${passDeg}deg, #c8860a ${passDeg}deg ${passDeg + warnDeg}deg, #dc4c5e ${passDeg + warnDeg}deg 360deg)` }}
          >
            <div className="donut-hole"><b>{total}</b><span>scans</span></div>
          </div>
          <div className="legend">
            <div className="legend-row"><i className="sw" style={{ background: '#0d9488' }} />Compliant<b>{pass}</b></div>
            <div className="legend-row"><i className="sw" style={{ background: '#c8860a' }} />Review<b>{warn}</b></div>
            <div className="legend-row"><i className="sw" style={{ background: '#dc4c5e' }} />Non-compliant<b>{fail}</b></div>
          </div>
        </div>

        <div className="panel">
          <p className="panel-label">Recent scans</p>
          {scans.slice(0, 6).map((s) => (
            <Link to={`/reports/${s._id}`} className="recent-row" key={s._id}>
              <img className="thumb" src={`${apiBase}${s.imageUrl}`} alt="" />
              <div className="recent-info">
                <div className="recent-name">{s.productGuess || s.manufacturer || 'Unidentified product'}</div>
                <div className="recent-time">{new Date(s.createdAt).toLocaleString()}</div>
              </div>
              <span className={`pill ${s.verdict}`}>{s.verdict.toUpperCase()}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewHead() {
  return (
    <div className="view-head">
      <div>
        <p className="eyebrow"><span className="dot" /> Enforcement view</p>
        <h1>Dashboard</h1>
        <p className="sub">Aggregate compliance status across everything scanned.</p>
      </div>
      <Link to="/scan"><button className="primary">+ New scan</button></Link>
    </div>
  );
}
