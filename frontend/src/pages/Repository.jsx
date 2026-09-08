import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { IconRepo } from '../components/Icons';

export default function Repository() {
  const [scans, setScans] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    api.get('/api/scans').then((res) => setScans(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = scans.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (s.manufacturer || '').toLowerCase().includes(q) ||
      (s.mrp || '').toLowerCase().includes(q) ||
      (s.productGuess || '').toLowerCase().includes(q) ||
      s.verdictTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <p className="eyebrow"><span className="dot" /> Product repository</p>
          <h1>Scanned products</h1>
          <p className="sub">Search and review every product scanned and its inspection history.</p>
        </div>
        <Link to="/scan"><button className="primary">+ New scan</button></Link>
      </div>

      <div className="repo-toolbar">
        <input
          className="search-input"
          placeholder="Search by manufacturer, MRP, or verdict…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="placeholder">Loading…</div>
      ) : scans.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <IconRepo width={34} height={34} color="var(--faint)" />
            <p>The repository fills up as products are scanned.</p>
            <Link to="/scan"><button className="primary">Go to scan</button></Link>
          </div>
        </div>
      ) : (
        <div className="panel">
          <table className="repo-table">
            <thead>
              <tr><th></th><th>Product</th><th>Manufacturer</th><th>MRP</th><th>Scanned</th><th>Verdict</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr className="rowhover" key={s._id} onClick={() => navigate(`/reports/${s._id}`)}>
                  <td><img className="thumb" src={`${apiBase}${s.imageUrl}`} alt="" /></td>
                  <td>{s.productGuess || '—'}</td>
                  <td>{s.manufacturer || '—'}</td>
                  <td className="mono">{s.mrp || '—'}</td>
                  <td className="mono">{new Date(s.createdAt).toLocaleString()}</td>
                  <td><span className={`pill ${s.verdict}`}>{s.verdict.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><p>No scans match that search.</p></div>}
        </div>
      )}
    </div>
  );
}
