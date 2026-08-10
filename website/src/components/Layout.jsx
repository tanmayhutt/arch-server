import { NavLink, Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout-container">
      <nav className="navbar animate-fade-in">
        <Link to="/" className="logo">
          <span className="logo-icon">~/</span>arch-server
        </Link>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            /home
          </NavLink>
          <NavLink to="/server" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            /server_node
          </NavLink>
          <NavLink to="/desktop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            /desktop_env
          </NavLink>
          <NavLink to="/architecture" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            /architecture
          </NavLink>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
          LIVE · SELF-HOSTED INFRASTRUCTURE
        </p>
        <p style={{ marginBottom: 0, fontSize: '0.8rem' }}>
          You are viewing a production website served from a{' '}
          <strong style={{ color: 'var(--text-primary)' }}>Lenovo IdeaPad</strong> in a home network. <br />
          Arch Linux · Docker · Cloudflare Zero Trust
        </p>
      </footer>
    </div>
  );
};

export default Layout;
