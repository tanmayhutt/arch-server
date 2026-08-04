import { Link } from 'react-router-dom';
import { Server, Monitor, Shield, HardDrive } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #f0f0f5 0%, #a0a0b0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Headless Infrastructure
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          A repurposed Lenovo IdeaPad functioning as a highly secure, globally accessible NAS node and development sandbox.
        </p>
      </header>

      <div className="grid-2">
        <Link to="/server" style={{ textDecoration: 'none' }}>
          <div className="glass-panel delay-100 animate-fade-in">
            <Server size={32} color="var(--accent-arch)" style={{ marginBottom: '1rem' }} />
            <h3>Server Node (arch-server)</h3>
            <p>Explore the zero-trust Tailscale network architecture, Samba storage configuration, and background daemon automation.</p>
            <div>
              <span className="badge arch">Arch Linux</span>
              <span className="badge tailscale">Tailscale</span>
            </div>
          </div>
        </Link>

        <Link to="/desktop" style={{ textDecoration: 'none' }}>
          <div className="glass-panel delay-200 animate-fade-in">
            <Monitor size={32} color="#f0f0f5" style={{ marginBottom: '1rem' }} />
            <h3>Desktop Environment</h3>
            <p>Dive into the dormant but highly customized Wayland compositor setup including Hyprland, Waybar, and Wofi configurations.</p>
            <div>
              <span className="badge">Hyprland</span>
              <span className="badge">Wayland</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="glass-panel delay-300 animate-fade-in" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Shield size={28} color="#00ffcc" />
          <h3 style={{ margin: 0 }}>Zero-Trust Architecture</h3>
        </div>
        <p>
          This node operates with absolute zero exposure to the public internet. Administrative access is brokered exclusively via SSH over a WireGuard-backed mesh network (Tailscale), completely circumventing the need for localized port forwarding or exposed ingress routes.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)' }}><HardDrive size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}/> Hardware</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
              <li>Intel Core i3-10110U</li>
              <li>8 GiB DDR4 RAM</li>
              <li>233 GiB SSD (ext4)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)' }}>Network Interface</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
              <li>802.11ac Wi-Fi</li>
              <li>NetworkManager</li>
              <li>wlctl (TUI Orchestration)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
