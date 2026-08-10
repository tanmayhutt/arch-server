import { Code, Network, Shield, Server, Terminal, HardDrive, Wrench } from "lucide-react";
import SparklesText from "@/components/magicui/sparkles-text";
import { BorderBeam } from "@/components/magicui/border-beam";
import Meteors from "@/components/magicui/meteors";

const ArchServer = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-20 pb-24 px-6 overflow-hidden bg-black selection:bg-purple-500/30">

      {/* Background */}
      <Meteors number={25} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black z-0 pointer-events-none" />

      {/* ── Header ───────────────────────────────────────── */}
      <header className="z-10 flex flex-col items-center text-center mb-16 w-full max-w-4xl relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]">
            module: arch-server
          </span>
        </div>
        
        <div className="mb-6">
          <SparklesText text="SERVER_ARCHITECTURE" colors={{ first: "#3b82f6", second: "#a855f7" }} className="text-4xl md:text-5xl" />
        </div>

        <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed mb-8">
          Subsystem breakdown: networking, storage, remote access, telemetry.
        </p>

        <a
          href="https://github.com/tanmayhutt/arch-server"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white overflow-hidden shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
        >
          <BorderBeam size={50} duration={3} delay={0.5} colorFrom="#ffffff" colorTo="#3b82f6" />
          <Code className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          View Source Code
        </a>
      </header>

      <div className="w-full max-w-4xl flex flex-col gap-8 z-10 relative">

        {/* ── Net Topology ─────────────────────────────────── */}
        <div className="relative p-8 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_-20px_rgba(59,130,246,0.15)] overflow-hidden">
          <BorderBeam size={300} duration={12} delay={1} colorFrom="#3b82f6" colorTo="#0ea5e9" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Network className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">/net_topology</h2>
            </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Zero open ports on the physical router. All inbound access is brokered via outbound-only encrypted tunnels. Three independent access paths are provisioned.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tailscale */}
              <div className="p-5 border-l-2 border-blue-500 bg-blue-500/5 rounded-r-xl transition-colors hover:bg-blue-500/10">
                <h3 className="text-lg font-semibold text-white mb-2">Tailscale</h3>
                <p className="text-sm text-neutral-400 mb-3">WireGuard mesh VPN. Trusted devices only.</p>
                <code className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded-md text-xs font-mono">ssh user@&lt;tailscale-ip&gt;</code>
              </div>

              {/* Cloudflare SSH */}
              <div className="p-5 border-l-2 border-orange-500 bg-orange-500/5 rounded-r-xl transition-colors hover:bg-orange-500/10">
                <h3 className="text-lg font-semibold text-white mb-2">Cloudflare Access</h3>
                <p className="text-sm text-neutral-400 mb-3">SSH over HTTPS. Email OTP + SSH key. Any device.</p>
                <code className="px-2 py-1 bg-orange-500/10 text-orange-300 rounded-md text-xs font-mono">ssh ssh.tanmaytiwari.me</code>
              </div>

              {/* Browser SSH */}
              <div className="p-5 border-l-2 border-purple-500 bg-purple-500/5 rounded-r-xl transition-colors hover:bg-purple-500/10">
                <h3 className="text-lg font-semibold text-white mb-2">Browser SSH</h3>
                <p className="text-sm text-neutral-400 mb-3">Full terminal in the browser. Zero installs required.</p>
                <code className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded-md text-xs font-mono">https://ssh.tanmaytiwari.me</code>
              </div>
            </div>
          </div>
        </div>

        {/* ── Remote Access ─────────────────────────────────── */}
        <div className="relative p-8 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_-20px_rgba(249,115,22,0.15)] overflow-hidden">
          <BorderBeam size={300} duration={14} delay={3} colorFrom="#f97316" colorTo="#a855f7" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Shield className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-200">/remote_access</h2>
            </div>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              SSH is accessible from any device worldwide via Cloudflare Access — no Tailscale, no open ports, no client software needed.
            </p>

            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">Method A — Native SSH (requires cloudflared CLI)</h3>
              <div className="p-5 border-l-2 border-orange-500/50 bg-orange-500/5 text-sm text-neutral-400 leading-loose rounded-r-xl">
                <p>1. Run: <code className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-md text-xs font-mono">ssh ssh.tanmaytiwari.me</code></p>
                <p>2. Browser opens → Cloudflare Access identity check</p>
                <p>3. One-time PIN sent to owner email</p>
                <p>4. Token valid for 24h — next connections are instant</p>
                <p>5. Shell access granted. No Tailscale. No open ports.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">Method B — Browser Terminal (zero installs)</h3>
              <div className="p-5 border-l-2 border-purple-500/50 bg-purple-500/5 text-sm text-neutral-400 leading-loose rounded-r-xl">
                <p>1. Open: <code className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-mono"><a href="https://ssh.tanmaytiwari.me" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors">https://ssh.tanmaytiwari.me</a></code></p>
                <p>2. Cloudflare Access → enter email → receive OTP</p>
                <p>3. Full terminal renders in the browser tab (Requires Chrome/Safari/Firefox)</p>
                <p>4. Enter server username (e.g., <code className="px-1 py-0.5 bg-white/10 rounded text-neutral-200">tanmay</code>) → shell access granted</p>
                <p>5. Works on any device: phone, tablet, library PC.</p>
                
                <div className="mt-5 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]">
                  <p className="font-semibold text-purple-300 text-sm mb-2 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Configuration Requirements:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-purple-100/70 space-y-1">
                    <li>Tunnel service type must be set to <code className="px-1 bg-black/40 rounded text-purple-300 border border-purple-500/20">SSH</code> (not TCP/HTTP).</li>
                    <li><strong>"Browser rendering"</strong> must be enabled in the Access Application.</li>
                    <li>Access Application policies must only use <strong>Allow</strong> (no Bypass/Service Auth).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Storage ──────────────────────────────────────── */}
        <div className="relative p-8 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_-20px_rgba(16,185,129,0.15)] overflow-hidden">
          <BorderBeam size={200} duration={10} delay={5} colorFrom="#10b981" colorTo="#34d399" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-white">
              <HardDrive className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">/storage_subsystem</h2>
            </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Server Message Block (SMB) via Samba. Cross-platform file operations across the Tailscale mesh.
              SMB daemon listens exclusively on the Tailscale interface — inaccessible from the public internet.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl transition-colors hover:bg-emerald-500/10">
                <p className="text-xs uppercase tracking-widest text-emerald-500/70 mb-1">macOS / iOS</p>
                <code className="text-emerald-300 font-mono text-sm">smb://&lt;tailscale-ip&gt;</code>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl transition-colors hover:bg-emerald-500/10">
                <p className="text-xs uppercase tracking-widest text-emerald-500/70 mb-1">Windows</p>
                <code className="text-emerald-300 font-mono text-sm">\\\\&lt;tailscale-ip&gt;</code>
              </div>
            </div>

            <pre className="p-5 bg-black/80 border border-white/10 rounded-xl text-emerald-100/70 font-mono text-sm overflow-x-auto shadow-inner">
{`[ShareName]
   path = /home/<username>
   browsable = yes
   writable = yes`}
            </pre>
          </div>
        </div>

        {/* ── Admin Tools + Scripts ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative p-8 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)] overflow-hidden">
            <BorderBeam size={150} duration={8} delay={2} colorFrom="#737373" colorTo="#d4d4d4" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 text-white">
                <Wrench className="w-5 h-5 text-neutral-400" />
                <h3 className="text-lg font-bold">/admin_tools</h3>
              </div>
              <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-600 mt-0.5">—</span>
                  <div>
                    <strong className="text-white font-medium block">wlctl</strong>
                    <span className="text-xs text-neutral-500">WLAN provisioning TUI</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-600 mt-0.5">—</span>
                  <div>
                    <strong className="text-white font-medium block">yazi</strong>
                    <span className="text-xs text-neutral-500">Async TUI file manager</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-600 mt-0.5">—</span>
                  <div>
                    <strong className="text-white font-medium block">KDE Connect</strong>
                    <span className="text-xs text-neutral-500">Telemetry & payload drop</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative p-8 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)] overflow-hidden">
            <BorderBeam size={150} duration={8} delay={6} colorFrom="#737373" colorTo="#d4d4d4" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 text-white">
                <Terminal className="w-5 h-5 text-neutral-400" />
                <h3 className="text-lg font-bold">/utility_scripts</h3>
              </div>
              <ul className="flex flex-col gap-3 text-neutral-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-neutral-600">—</span>
                  <code className="text-neutral-200 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">battery.sh</code> 
                  <span className="text-xs text-neutral-500 ml-auto">Power</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neutral-600">—</span>
                  <code className="text-neutral-200 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">network-status.sh</code> 
                  <span className="text-xs text-neutral-500 ml-auto">WLAN state</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neutral-600">—</span>
                  <code className="text-neutral-200 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">whatsong.sh</code> 
                  <span className="text-xs text-neutral-500 ml-auto">Media state</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neutral-600">—</span>
                  <code className="text-neutral-200 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">whoami.sh</code> 
                  <span className="text-xs text-neutral-500 ml-auto">Session id</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArchServer;
