import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { IconScan, IconDashboard, IconRepo, IconLogo } from './Icons';

export default function Layout() {
  const { user, logout } = useAuth();
  const [scanCount, setScanCount] = useState(null);

  useEffect(() => {
    api
      .get('/api/scans/stats/summary')
      .then((res) => setScanCount(res.data.total))
      .catch(() => {});
  }, []);

  const initials = user?.name ? user.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><IconLogo color="#0d9488" /></div>
          <div>
            <div className="brand-name">MetroCheck</div>
            <div className="brand-tag">SIH 2026</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/scan" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <IconScan /> Scan
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <IconDashboard /> Dashboard
          </NavLink>
          <NavLink to="/repository" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <IconRepo /> Repository
            {scanCount !== null && <span className="nav-count">{scanCount}</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
