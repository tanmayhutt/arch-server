import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Code2,
  Container,
  HardDrive,
  KeyRound,
  MonitorOff,
  Network,
  Server,
  Terminal,
  Wrench,
} from "lucide-react";

const accessRoutes = [
  [Network, "My own devices", "Tailscale + OpenSSH", "The normal route. A trusted device joins the WireGuard mesh, then connects directly to the private node."],
  [KeyRound, "A borrowed browser", "Cloudflare Access", "The portable route. Cloudflare verifies an allowed identity before it renders a browser terminal."],
  [HardDrive, "Files, not a shell", "Samba + Tailscale", "The SSD appears as a private network share on my Mac, phone, tablet, and other enrolled devices."],
];

const machineNotes = [
  ["Hardware", "Lenovo IdeaPad 3 15IML05, Intel Core i3-10110U, 8 GiB memory"],
  ["System", "Arch Linux x86_64 on an ext4 volume of roughly 233 GiB"],
  ["Host services", "OpenSSH, Tailscale, Samba, NetworkManager, and systemd"],
  ["Compose workload", "One Nginx container for this site and one cloudflared container for public ingress"],
  ["Router exposure", "No forwarded ports. The public connection begins outbound from the laptop"],
  ["Failure recovery", "Closed-lid operation plus systemd and restart: unless-stopped for the declared services"],
];

const smallTools = [
  ["yazi", "keyboard-first file work"],
  ["wlctl", "wireless provisioning from the terminal"],
  ["KDE Connect", "moving files between the laptop and phone"],
  ["zoxide + ripgrep", "getting around and finding things quickly"],
  ["network-status.sh", "a small, readable network check"],
  ["battery.sh / whoami.sh", "tiny local status helpers"],
];

const ArchServer = () => (
  <div className="site-page detail-page server-page">
    <header className="page-header page-width">
      <div className="eyebrow">the physical machine / the practical details</div>
      <div className="page-header-grid">
        <h1>The laptop behind this page.</h1>
        <div className="header-side">
          <p>An old Lenovo running Arch as a headless origin, a private file share, a deployment target, and a shell I can reach when I am away.</p>
          <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer" className="text-link">
            <Code2 size={15} /> Inspect source <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </header>

    <section className="page-width node-dashboard">
      <div className="panel-chrome"><span>THE MACHINE, NOT LIVE TELEMETRY</span><span>DOCUMENTED CONFIGURATION</span></div>
      <div className="node-dashboard-grid">
        <div className="node-core">
          <div className="node-core-icon"><Server size={31} strokeWidth={1.3} /></div>
          <div><span>PHYSICAL ORIGIN</span><h2>Lenovo IdeaPad 3</h2><p>Intel Core i3-10110U · 8 GiB DDR4</p></div>
        </div>
        <div className="node-telemetry">
          {[
            ["OS", "Arch Linux x86_64"],
            ["ROOT DISK", "~233 GiB / ext4"],
            ["PUBLIC INGRESS", "Cloudflare Tunnel"],
            ["PRIVATE NETWORK", "Tailscale / WireGuard"],
            ["CONTAINER RUNTIME", "Docker Compose"],
            ["OPEN ROUTER PORTS", "0"],
          ].map(([label, value]) => <div className="telemetry-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
      </div>
    </section>

    <section className="section-block page-width terminal-door">
      <div className="terminal-door-copy">
        <span className="section-index">THE BROWSER TERMINAL</span>
        <h2>The address I use when Tailscale is not on the device.</h2>
        <p><strong>ssh.tanmaytiwari.me</strong> is not an open shell. Cloudflare Access asks who I am first, and only an approved identity can reach the browser-rendered SSH session. OpenSSH still guards the origin behind that check.</p>
        <a href="https://ssh.tanmaytiwari.me" target="_blank" rel="noreferrer" className="primary-action">
          Open the identity-gated terminal <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="terminal-route" aria-label="Browser terminal access sequence">
        <div className="terminal-route-head"><Terminal size={18} /><span>ssh.tanmaytiwari.me</span></div>
        <ol>
          <li><span>01</span><p><strong>Browser</strong> requests the protected hostname</p></li>
          <li><span>02</span><p><strong>Access</strong> checks the allowed identity and policy</p></li>
          <li><span>03</span><p><strong>Tunnel</strong> carries the approved session inward</p></li>
          <li><span>04</span><p><strong>OpenSSH</strong> authenticates at the laptop</p></li>
        </ol>
      </div>
    </section>

    <section className="section-block page-width access-editorial">
      <div className="section-heading">
        <div><span className="section-index">ACCESS, BY SITUATION</span><h2>Three routes, because one route should not do everything.</h2></div>
        <p>The public site, private administration, and file sharing remain separate even though they end at the same laptop.</p>
      </div>
      <div className="access-route-list">
        {accessRoutes.map(([Icon, situation, route, detail], index) => (
          <article key={route}>
            <span>0{index + 1}</span><Icon size={20} strokeWidth={1.5} />
            <div><small>{situation}</small><h3>{route}</h3></div><p>{detail}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="section-block page-width machine-notebook">
      <div className="notebook-intro">
        <span className="section-index">FIELD NOTES</span>
        <h2>The niche details I actually care about.</h2>
        <p>The desktop was not erased to make a server. I kept the Arch system, removed the display as a dependency, and added only the services that gave the machine a useful second life.</p>
        <Link to="/desktop" className="text-link">See the retained desktop setup <ArrowUpRight size={14} /></Link>
      </div>
      <dl className="machine-spec-list">
        {machineNotes.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}
      </dl>
    </section>

    <section className="section-block page-width tool-notes">
      <div className="tool-notes-heading">
        <Wrench size={21} strokeWidth={1.5} />
        <div><span className="section-index">SMALL TOOLS, KEPT ON PURPOSE</span><h2>Useful beats impressive.</h2></div>
      </div>
      <div className="tool-note-list">
        {smallTools.map(([tool, use]) => <p key={tool}><code>{tool}</code><span>{use}</span></p>)}
      </div>
      <div className="honest-footnotes">
        <p><MonitorOff size={18} /><span><strong>Headless now.</strong> Closing the lid does not suspend the node.</span></p>
        <p><Container size={18} /><span><strong>Deliberately small.</strong> The current Compose surface is only this site and its tunnel.</span></p>
        <p><Wrench size={18} /><span><strong>Experiments get removed.</strong> WayVNC/noVNC and a local Ollama setup were tried, then deleted when they did not earn their overhead.</span></p>
      </div>
    </section>
  </div>
);

export default ArchServer;
