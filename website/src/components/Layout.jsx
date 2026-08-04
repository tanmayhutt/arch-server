import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout-container">
      <nav className="navbar animate-fade-in">
        <div className="logo">
          <span className="logo-icon">~/</span>arch-server
        </div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            /home
          </NavLink>
          <NavLink
            to="/server"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            /server_node
          </NavLink>
          <NavLink
            to="/desktop"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            /desktop_env
          </NavLink>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer
        style={{
          marginTop: '5rem',
          padding: '2rem 1rem',
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--border-radius)',
        }}
      >
        <p style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
          LIVE DEMO: SELF-HOSTED INFRASTRUCTURE
        </p>
        <p style={{ marginBottom: '0' }}>
          You are currently viewing a production React website served directly from a repurposed <strong>Lenovo IdeaPad</strong> sitting in a home network.
          <br />
          Powered by Arch Linux, Docker Containers, and Cloudflare Zero Trust Tunnels.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
