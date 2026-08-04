import Mermaid from '../components/Mermaid';

const Architecture = () => {
  const architectureDiagram = `graph TD
    %% External Actors
    User[Public Internet Users]
    Admin[Admin / Local Devices]

    %% External Networks
    CF[Cloudflare Edge Network]
    TS[Tailscale Mesh Network]

    %% Hardware & Host OS
    subgraph Host [Hardware: Lenovo IdeaPad i3 / Arch Linux]
        
        %% Docker Network
        subgraph Docker [Docker Engine]
            CF_Tunnel[cloudflared]
            Nginx[Nginx Web Server]
            React[React Frontend / Vite]
            
            CF_Tunnel <-->|Reverse Proxy| Nginx
            Nginx -->|Serves Static Files| React
        end

        %% Host Services
        SSH[OpenSSH Server]
        Samba[Samba NAS]
        Ext4[(233 GiB Ext4 SSD)]

        Samba --> Ext4
    end

    %% Connections
    User -->|HTTPS| CF
    CF <-->|Zero Trust Tunnel| CF_Tunnel
    
    Admin <-->|WireGuard VPN| TS
    TS <--> SSH
    TS <--> Samba
  `;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <span className="badge">module: system-architecture</span>
        <h1 style={{ marginTop: '1rem' }}>SYSTEM_ARCHITECTURE</h1>
        <p>
          A comprehensive overview of the zero-trust infrastructure, containerization stack, and
          hardware deployment.
        </p>
      </header>

      <div className="server-panel delay-100">
        <h2>/infrastructure_map</h2>
        <p style={{ marginBottom: '2rem' }}>
          The logical flow of ingress, authentication, and data isolation.
        </p>
        <Mermaid chart={architectureDiagram} />
      </div>

      <div className="grid-2 delay-200" style={{ marginTop: '2rem' }}>
        <div className="server-panel">
          <h2>/cloudflare_zero_trust</h2>
          <p>
            Public ingress is exclusively handled by Cloudflare Edge Network. The{' '}
            <code>cloudflared</code> daemon establishes an outbound-only tunnel to Cloudflare,
            meaning the router has zero open ports.
          </p>
        </div>
        <div className="server-panel">
          <h2>/tailscale_mesh</h2>
          <p>
            Administrative ingress (SSH) and NAS Storage (Samba) are securely confined to an
            encrypted WireGuard mesh network. These services are completely invisible to the public
            internet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
