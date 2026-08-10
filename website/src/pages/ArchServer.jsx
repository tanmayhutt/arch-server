import { Code, Network, Shield, Server, Terminal, HardDrive, Wrench } from "lucide-react";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";

const ArchServer = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-20 pb-24 px-6 overflow-hidden bg-black selection:bg-white/30">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="z-10 flex flex-col items-center text-center mb-16 w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-white/5 text-neutral-300">
            module: arch-server
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          SERVER_ARCHITECTURE
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed mb-6">
          Subsystem breakdown: networking, storage, remote access, telemetry.
        </p>

        <a
          href="https://github.com/tanmayhutt/arch-server"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white"
        >
          <Code className="w-4 h-4" />
          View Source Code
        </a>
      </header>

      <div className="w-full max-w-4xl flex flex-col gap-6 z-10">

        {/* ── Net Topology ─────────────────────────────────── */}
        <div className="p-8 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-4 text-white">
            <Network className="w-6 h-6 text-neutral-300" />
            <h2 className="text-2xl font-bold">/net_topology</h2>
          </div>
          <p className="text-neutral-400 mb-6">
            Zero open ports on the physical router. All inbound access is brokered via outbound-only encrypted tunnels. Three independent access paths are provisioned.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tailscale */}
            <div className="p-5 border-l-2 border-neutral-600 bg-white/5 rounded-r-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Tailscale</h3>
              <p className="text-sm text-neutral-400 mb-3">WireGuard mesh VPN. Trusted devices only.</p>
              <code className="px-2 py-1 bg-white/10 text-neutral-300 rounded-md text-xs font-mono">ssh user@&lt;tailscale-ip&gt;</code>
            </div>

            {/* Cloudflare SSH */}
            <div className="p-5 border-l-2 border-neutral-600 bg-white/5 rounded-r-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Cloudflare Access</h3>
              <p className="text-sm text-neutral-400 mb-3">SSH over HTTPS. Email OTP + SSH key. Any device.</p>
              <code className="px-2 py-1 bg-white/10 text-neutral-300 rounded-md text-xs font-mono">ssh ssh.tanmaytiwari.me</code>
            </div>

            {/* Browser SSH */}
            <div className="p-5 border-l-2 border-neutral-600 bg-white/5 rounded-r-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Browser SSH</h3>
              <p className="text-sm text-neutral-400 mb-3">Full terminal in the browser. Zero installs required.</p>
              <code className="px-2 py-1 bg-white/10 text-neutral-300 rounded-md text-xs font-mono">https://ssh.tanmaytiwari.me</code>
            </div>
          </div>
        </div>

        {/* ── Remote Access ─────────────────────────────────── */}
        <div className="p-8 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-4 text-white">
            <Shield className="w-6 h-6 text-neutral-300" />
            <h2 className="text-2xl font-bold">/remote_access</h2>
          </div>
          <p className="text-neutral-400 mb-8">
            SSH is accessible from any device worldwide via Cloudflare Access — no Tailscale, no open ports, no client software needed.
          </p>

          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Method A — Native SSH (requires cloudflared CLI)</h3>
            <div className="p-5 border-l-2 border-neutral-600 text-sm text-neutral-400 leading-loose">
              <p>1. Run: <code className="px-2 py-1 bg-white/10 text-neutral-300 rounded-md text-xs font-mono">ssh ssh.tanmaytiwari.me</code></p>
              <p>2. Browser opens → Cloudflare Access identity check</p>
              <p>3. One-time PIN sent to owner email</p>
              <p>4. Token valid for 24h — next connections are instant</p>
              <p>5. Shell access granted. No Tailscale. No open ports.</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Method B — Browser Terminal (zero installs)</h3>
            <div className="p-5 border-l-2 border-neutral-600 text-sm text-neutral-400 leading-loose">
              <p>1. Open: <code className="px-2 py-1 bg-white/10 text-neutral-300 rounded-md text-xs font-mono"><a href="https://ssh.tanmaytiwari.me" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white">https://ssh.tanmaytiwari.me</a></code></p>
              <p>2. Cloudflare Access → enter email → receive OTP</p>
              <p>3. Full terminal renders in the browser tab (Requires Chrome/Safari/Firefox)</p>
              <p>4. Enter server username (e.g., <code className="px-1 py-0.5 bg-white/10 rounded text-neutral-300">tanmay</code>) → shell access granted</p>
              <p>5. Works on any device: phone, tablet, library PC.</p>
              
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="font-semibold text-neutral-300 text-sm mb-2">⚠️ Configuration Requirements:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Tunnel service type must be set to <code className="px-1 bg-white/10 rounded text-neutral-300">SSH</code> (not TCP/HTTP).</li>
                  <li><strong>"Browser rendering"</strong> must be enabled in the Access Application.</li>
                  <li>Access Application policies must only use <strong>Allow</strong> (no Bypass/Service Auth).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Storage ──────────────────────────────────────── */}
        <div className="p-8 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-4 text-white">
            <HardDrive className="w-6 h-6 text-neutral-300" />
            <h2 className="text-2xl font-bold">/storage_subsystem</h2>
          </div>
          <p className="text-neutral-400 mb-6">
            Server Message Block (SMB) via Samba. Cross-platform file operations across the Tailscale mesh.
            SMB daemon listens exclusively on the Tailscale interface — inaccessible from the public internet.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">macOS / iOS</p>
              <code className="text-neutral-300 font-mono text-sm">smb://&lt;tailscale-ip&gt;</code>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Windows</p>
              <code className="text-neutral-300 font-mono text-sm">\\\\&lt;tailscale-ip&gt;</code>
            </div>
          </div>

          <pre className="p-4 bg-black/50 border border-white/10 rounded-xl text-neutral-300 font-mono text-sm overflow-x-auto">
{`[ShareName]
   path = /home/<username>
   browsable = yes
   writable = yes`}
          </pre>
        </div>

        {/* ── Admin Tools + Scripts ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Wrench className="w-5 h-5 text-neutral-300" />
              <h3 className="text-lg font-bold">/admin_tools</h3>
            </div>
            <ul className="flex flex-col gap-3 text-neutral-400 text-sm">
              <li>— <strong className="text-white">wlctl</strong>: WLAN provisioning TUI</li>
              <li>— <strong className="text-white">yazi</strong>: Async TUI file manager</li>
              <li>— <strong className="text-white">KDE Connect</strong>: Telemetry & payload drop</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Terminal className="w-5 h-5 text-neutral-300" />
              <h3 className="text-lg font-bold">/utility_scripts</h3>
            </div>
            <ul className="flex flex-col gap-3 text-neutral-400 text-sm">
              <li>— <code className="text-white bg-white/10 px-1 rounded">battery.sh</code> (Power)</li>
              <li>— <code className="text-white bg-white/10 px-1 rounded">network-status.sh</code> (WLAN state)</li>
              <li>— <code className="text-white bg-white/10 px-1 rounded">whatsong.sh</code> (Media state)</li>
              <li>— <code className="text-white bg-white/10 px-1 rounded">whoami.sh</code> (Session identity)</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArchServer;
