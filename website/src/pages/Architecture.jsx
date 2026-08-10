import Mermaid from '../components/Mermaid';
import MagicCard from "@/components/magicui/magic-card";
import Particles from "@/components/magicui/particles";
import { Network, Shield, Server } from "lucide-react";

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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-20 pb-24 px-6 overflow-hidden bg-black selection:bg-blue-500/30">
      
      {/* Background */}
      <Particles className="absolute inset-0" quantity={60} ease={80} color="#ffffff" refresh />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black z-0 pointer-events-none" />

      {/* ── Header ───────────────────────────────────────── */}
      <header className="z-10 flex flex-col items-center text-center mb-16 w-full max-w-5xl relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]">
            module: system-architecture
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          SYSTEM_ARCHITECTURE
        </h1>

        <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed mb-8">
          A comprehensive overview of the zero-trust infrastructure, containerization stack, and
          hardware deployment.
        </p>
      </header>

      <div className="w-full max-w-5xl flex flex-col gap-8 z-10 relative">

        {/* ── Infrastructure Map ─────────────────────────────────── */}
        <MagicCard 
          className="p-8 shadow-[0_0_50px_-20px_rgba(59,130,246,0.15)] h-auto"
          spotlightColor="rgba(59,130,246,0.05)"
          spotlightBorderColor="rgba(59,130,246,0.4)"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Network className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">/infrastructure_map</h2>
            </div>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              The logical flow of ingress, authentication, and data isolation.
            </p>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-x-auto overflow-y-hidden">
              <div className="min-w-[800px] flex justify-center mermaid-wrapper dark-theme-mermaid">
                <Mermaid chart={architectureDiagram} />
              </div>
            </div>
          </div>
        </MagicCard>

        {/* ── Security Breakdowns ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MagicCard 
            className="p-8 shadow-[0_0_40px_-15px_rgba(249,115,22,0.1)] h-auto"
            spotlightColor="rgba(249,115,22,0.05)"
            spotlightBorderColor="rgba(249,115,22,0.4)"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-white">
                <Shield className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-200">/cloudflare_zero_trust</h2>
              </div>
              <p className="text-neutral-400 text-sm leading-loose">
                Public ingress is exclusively handled by Cloudflare Edge Network. The <code className="px-1.5 py-0.5 bg-orange-500/10 text-orange-300 rounded font-mono border border-orange-500/20">cloudflared</code> daemon establishes an outbound-only tunnel to Cloudflare, meaning the physical router has zero open ports.
              </p>
            </div>
          </MagicCard>

          <MagicCard 
            className="p-8 shadow-[0_0_40px_-15px_rgba(16,185,129,0.1)] h-auto"
            spotlightColor="rgba(16,185,129,0.05)"
            spotlightBorderColor="rgba(16,185,129,0.4)"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-white">
                <Server className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">/tailscale_mesh</h2>
              </div>
              <p className="text-neutral-400 text-sm leading-loose">
                Administrative ingress (SSH) and NAS Storage (Samba) are securely confined to an encrypted WireGuard mesh network. These services are completely invisible to the public internet.
              </p>
            </div>
          </MagicCard>
        </div>

      </div>
    </div>
  );
};

export default Architecture;
