import Mermaid from '../components/Mermaid';

const Architecture = () => {
  const architectureDiagram = `graph TD
    %% EXTERNAL
    User["Public Web Browser"]
    Admin["Admin Devices"]
    GH["GitHub Actions CI/CD"]

    %% CLOUDFLARE EDGE
    subgraph Cloudflare ["Cloudflare Global Network"]
        DNS["DNS Resolution"]
        WAF["Web Application Firewall"]
        CDN["CDN / Cache"]
        ZT["Zero Trust Edge"]
        DNS --> WAF --> CDN --> ZT
    end
    User -->|"HTTPS"| DNS

    %% TAILSCALE
    subgraph Tailscale ["Tailscale Mesh VPN"]
        DERP["Tailscale Control Plane & DERP Relays"]
    end
    Admin <-->|"WireGuard P2P"| DERP
    GH -->|"SSH Deployment via Tailscale"| DERP

    %% PHYSICAL HARDWARE
    subgraph Hardware ["Lenovo IdeaPad 3 - Core i3 / 8GB RAM"]
        WLAN["802.11ac Wi-Fi Interface"]
        SSD[("233 GiB Ext4 SSD")]

        %% ARCH LINUX OS
        subgraph ArchHost ["Arch Linux Host OS"]
            TS0["tailscale0 Interface 100.x.x.x"]
            SSHD["OpenSSH Daemon"]
            SMBD["Samba NAS Daemon"]
            
            %% DOCKER
            subgraph Docker ["Docker Engine & Bridge Network"]
                CF_Tunnel["Container: cloudflared"]
                NGINX["Container: Nginx Alpine"]
                REACT["React / Vite Static Bundle"]
                
                CF_Tunnel <-->|"Reverse Proxy HTTP"| NGINX
                NGINX -->|"Serves"| REACT
            end
        end
        
        %% Internal OS bindings
        WLAN <--> TS0
        WLAN <--> CF_Tunnel
        
        TS0 <--> SSHD
        TS0 <--> SMBD
        SMBD -->|"Read/Write"| SSD
    end
    
    %% External to Hardware Bindings
    ZT <-->|"Outbound-Only Encrypted Tunnel"| CF_Tunnel
    DERP <-->|"WireGuard NAT Traversal"| TS0
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
