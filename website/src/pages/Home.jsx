import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <h1>HEADLESS_NODE</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          [INFO] System initialized. Lenovo IdeaPad operating as a secure NAS and deployment sandbox.
        </p>
      </header>

      <div className="grid-2">
        <Link to="/server" style={{ borderBottom: 'none' }}>
          <div className="server-panel delay-100">
            <h2 style={{ marginBottom: '0.5rem' }}>./server_node</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Tailscale mesh architecture, Samba storage configuration, and background telemetry daemons.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <span className="badge arch">Arch Linux</span>
              <span className="badge tailscale">Tailscale</span>
            </div>
          </div>
        </Link>

        <Link to="/desktop" style={{ borderBottom: 'none' }}>
          <div className="server-panel delay-200">
            <h2 style={{ marginBottom: '0.5rem' }}>./desktop_env</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Dormant Wayland compositor stack, custom scripts, and visual aesthetics (Hyprland).
            </p>
            <div style={{ marginTop: '1rem' }}>
              <span className="badge">Hyprland</span>
              <span className="badge">Wayland</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="server-panel delay-300" style={{ marginTop: '1rem' }}>
        <h2>SECURITY_PROTOCOLS</h2>
        <p>
          [WARN] Absolute zero exposure to public internet. Administrative ingress restricted to WireGuard-backed mesh network (Tailscale). No local port forwarding enabled.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>/hw_specs</h3>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
              <li>- CPU: i3-10110U</li>
              <li>- RAM: 8 GiB DDR4</li>
              <li>- DISK: 233 GiB SSD (ext4)</li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>/net_interfaces</h3>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
              <li>- WLAN: 802.11ac</li>
              <li>- MGR: NetworkManager</li>
              <li>- TUI: wlctl</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
