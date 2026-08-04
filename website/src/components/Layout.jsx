import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout-container">
      <nav className="navbar animate-fade-in">
        <div className="logo">arch-server_</div>
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
          padding: '2rem 0',
          textAlign: 'center',
          borderTop: '1px dashed var(--border-color)',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
        }}
      >
        <p>EOF. Engineered on Repurposed Hardware. Secured via Mesh Networking.</p>
      </footer>
    </div>
  );
};

export default Layout;
