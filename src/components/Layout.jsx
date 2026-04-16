import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Table } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Add Data', path: '/', icon: <FilePlus size={18} /> },
    { name: 'View Table', path: '/table', icon: <Table size={18} /> },
  ];

  return (
    <div className="app-container">
      <div className="main-content">
        <header className="navbar">
          <div className="flex items-center gap-2">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              M
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Makeover Panel</h2>
          </div>
          <nav className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
