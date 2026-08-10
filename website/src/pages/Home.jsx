import { Link } from 'react-router-dom';
import fastfetchImg from '../../../assets/fastfetch.png';

const Home = () => {
  return (
    <div className="animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────── */}
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span className="badge live">ONLINE</span>
          <span className="badge arch">arch linux x86_64</span>
        </div>
        <h1 className="shimmer-text" style={{ marginBottom: '1rem' }}>arch-server</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '560px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Headless Arch Linux deployment on repurposed hardware. Zero-trust web hosting,
          NAS, and global SSH — no open ports.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <a
            href="https://github.com/tanmayhutt/arch-server"
            target="_blank"
            rel="noopener noreferrer"
            className="badge"
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-primary)' }}
          >
            View Source ↗
          </a>
          <a
            href="https://ssh.tanmaytiwari.me"
            target="_blank"
            rel="noopener noreferrer"
            className="badge"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              borderColor: 'rgba(243,128,32,0.4)',
              color: '#f38020',
              background: 'rgba(243,128,32,0.08)',
            }}
          >
            Browser SSH ↗
          </a>
        </div>
      </header>

      {/* ── Fastfetch Terminal ────────────────────────────── */}
      <div className="terminal-image-container delay-100" style={{ marginBottom: '2rem' }}>
        <div className="terminal-titlebar">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">fastfetch — tanmay@puturdawaywaltuh</span>
        </div>
        <img src={fastfetchImg} alt="Arch Linux Fastfetch Output" />
      </div>

      {/* ── Bento Grid ───────────────────────────────────── */}
      <div className="bento-grid delay-200">
        <Link to="/server" style={{ textDecoration: 'none' }}>
          <div className="server-panel" style={{ height: '100%' }}>
            <h2>/server_node</h2>
            <p>
              Tailscale mesh, Samba NAS, Zero-Trust SSH. Three access methods, zero open ports.
            </p>
            <div className="badges-container">
              <img src="https://img.shields.io/badge/Arch_Linux-1793D1?style=for-the-badge&logo=arch-linux&logoColor=white" alt="Arch Linux" />
              <img src="https://img.shields.io/badge/Tailscale-000000?style=for-the-badge&logo=tailscale&logoColor=white" alt="Tailscale" />
              <img src="https://img.shields.io/badge/SSH-4D4D4D?style=for-the-badge&logo=openssh&logoColor=white" alt="SSH" />
            </div>
          </div>
        </Link>

        <Link to="/desktop" style={{ textDecoration: 'none' }}>
          <div className="server-panel" style={{ height: '100%' }}>
            <h2>/desktop_env</h2>
            <p>
              Dormant Wayland compositor stack, custom dotfiles, and visual aesthetics via Hyprland.
            </p>
            <div className="badges-container">
              <img src="https://img.shields.io/badge/Hyprland-00A86B?style=for-the-badge&logo=linux&logoColor=white" alt="Hyprland" />
              <img src="https://img.shields.io/badge/Wayland-3D85C6?style=for-the-badge&logo=linux&logoColor=white" alt="Wayland" />
            </div>
          </div>
        </Link>
      </div>

      {/* ── Security Panel ───────────────────────────────── */}
      <div className="server-panel delay-300">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>/security_protocols</h2>
            <p style={{ marginBottom: 0, maxWidth: '520px' }}>
              Zero exposure to the public internet. All ingress is brokered through outbound-only encrypted tunnels.
            </p>
          </div>
          <span className="badge" style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.07)', whiteSpace: 'nowrap' }}>
            0 open ports
          </span>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">i3</span>
            <span className="stat-label">CPU (10th Gen)</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">8 GB</span>
            <span className="stat-label">DDR4 RAM</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">233 GB</span>
            <span className="stat-label">SSD ext4</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">24/7</span>
            <span className="stat-label">Uptime target</span>
          </div>
        </div>
      </div>

      {/* ── Hosting Stack ────────────────────────────────── */}
      <div className="server-panel delay-400">
        <h2>/self_hosting_hub</h2>
        <p>
          Scalable homelab orchestrated via Docker Compose. Hardened containers with resource limits,
          privilege stripping, and automated CI/CD via GitHub Actions.
        </p>
        <div className="badges-container">
          <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
          <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" />
          <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
          <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
        </div>
      </div>

    </div>
  );
};

export default Home;
