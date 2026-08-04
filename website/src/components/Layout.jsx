import { NavLink, Outlet } from 'react-router-dom';
import { Server, Monitor, Terminal } from 'lucide-react';

const Layout = () => {
  return (
    <div className="layout-container">
      <nav className="navbar animate-fade-in">
        <div className="logo">
          <Terminal size={24} color="var(--accent-arch)" />
          arch-server
        </div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/server" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Server Node
          </NavLink>
          <NavLink to="/desktop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Desktop Environment
          </NavLink>
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>

      <footer style={{ marginTop: '5rem', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
        <p>Engineered on Repurposed Hardware. Secured via Mesh Networking.</p>
      </footer>
    </div>
  );
};

export default Layout;
