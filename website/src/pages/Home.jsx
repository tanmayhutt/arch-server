import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1>arch-server</h1>
        <p>System initialized. Lenovo IdeaPad operating as a secure NAS and deployment sandbox.</p>
      </header>

      <div className="terminal-image-container delay-100" style={{ marginBottom: '2.5rem' }}>
        <img src="/fastfetch.png" alt="Arch Linux Fastfetch Output" />
      </div>

      <div className="grid-2">
        <Link to="/server">
          <div className="server-panel delay-200">
            <h2>/server_node</h2>
            <p>
              Tailscale mesh architecture, Samba storage configuration, and background telemetry
              daemons.
            </p>
            <div className="badges-container">
              <img
                src="https://img.shields.io/badge/Arch_Linux-1793D1?style=for-the-badge&logo=arch-linux&logoColor=white"
                alt="Arch Linux"
              />
              <img
                src="https://img.shields.io/badge/Tailscale-000000?style=for-the-badge&logo=tailscale&logoColor=white"
                alt="Tailscale"
              />
              <img
                src="https://img.shields.io/badge/Samba_NAS-FF6600?style=for-the-badge&logo=linux&logoColor=white"
                alt="Samba"
              />
              <img
                src="https://img.shields.io/badge/SSH-4D4D4D?style=for-the-badge&logo=openssh&logoColor=white"
                alt="SSH"
              />
            </div>
          </div>
        </Link>

        <Link to="/desktop">
          <div className="server-panel delay-300">
            <h2>/desktop_env</h2>
            <p>
              Dormant Wayland compositor stack, custom scripts, and visual aesthetics (Hyprland).
            </p>
            <div className="badges-container">
              <img
                src="https://img.shields.io/badge/Hyprland-00A86B?style=for-the-badge&logo=linux&logoColor=white"
                alt="Hyprland"
              />
              <img
                src="https://img.shields.io/badge/Wayland-3D85C6?style=for-the-badge&logo=linux&logoColor=white"
                alt="Wayland"
              />
            </div>
          </div>
        </Link>
      </div>

      <div className="server-panel delay-400">
        <h2>/security_protocols</h2>
        <p>
          Zero exposure to public internet. Administrative ingress restricted to WireGuard-backed
          mesh network (Tailscale).
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
          }}
        >
          <div>
            <h3>Hardware Specs</h3>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
              <li>CPU: i3-10110U</li>
              <li>RAM: 8 GiB DDR4</li>
              <li>DISK: 233 GiB SSD (ext4)</li>
            </ul>
          </div>
          <div>
            <h3>Net Interfaces</h3>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
              <li>WLAN: 802.11ac</li>
              <li>MGR: NetworkManager</li>
              <li>TUI: wlctl</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="server-panel delay-400" style={{ marginTop: '1rem' }}>
        <h2>/self_hosting_hub</h2>
        <p>
          System is configured as a scalable homelab. Utilizing Docker Compose to orchestrate
          independent microservices, databases, and APIs within isolated network boundaries.
        </p>
        <div className="badges-container">
          <img
            src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"
            alt="Docker"
          />
          <img
            src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white"
            alt="GitHub Actions"
          />
          <img
            src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white"
            alt="Cloudflare"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
