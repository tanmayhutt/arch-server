import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Code2,
  FlaskConical,
  HardDrive,
  KeyRound,
  MonitorOff,
  Network,
  Radio,
  RefreshCcw,
  Server,
  Terminal,
  Wrench,
} from "lucide-react";

const accessMethods = [
  {
    index: "01",
    icon: Network,
    title: "OpenSSH over Tailscale",
    label: "TRUSTED DEVICES",
    description: "Direct administration over the private WireGuard mesh. This is the default path for owned devices and the deployment runner.",
    command: "ssh <user>@<private-node>",
    tone: "private",
  },
  {
    index: "02",
    icon: KeyRound,
    title: "Cloudflare Access",
    label: "AUTHORIZED DEVICES",
    description: "Remote SSH is proxied after an identity policy is satisfied, without exposing port 22 on the home router.",
    command: "ssh <identity-gated-host>",
    tone: "public",
  },
  {
    index: "03",
    icon: Terminal,
    title: "Browser terminal",
    label: "ZERO CLIENT INSTALL",
    description: "Cloudflare can render the shell in a modern browser after the same access boundary is satisfied.",
    command: "identity-gated browser session",
    tone: "origin",
  },
];

const continuity = [
  {
    icon: MonitorOff,
    label: "CLOSED-LID OPERATION",
    title: "Headless by design",
    description: "The damaged display is no longer part of the serving path. The host is configured so lid-close behavior does not suspend the node.",
  },
  {
    icon: RefreshCcw,
    label: "SERVICE RECOVERY",
    title: "Restart intent is declared",
    description: "Both public containers use restart: unless-stopped. Host daemons such as OpenSSH and Tailscale remain managed separately by systemd.",
  },
  {
    icon: FlaskConical,
    label: "PLANNED / NOT DEPLOYED",
    title: "Local automation later",
    description: "Home automation and ESP8266 experiments remain on the roadmap. They are not part of the current production surface.",
  },
];

const ArchServer = () => (
  <div className="site-page detail-page">
    <header className="page-header page-width">
      <div className="eyebrow"><span className="live-dot" /> documented node / physical origin</div>
      <div className="page-header-grid">
        <h1>The machine behind the edge.</h1>
        <div className="header-side">
          <p>An 8 GiB Lenovo laptop running Arch Linux as a headless origin, private NAS, deployment target, and secure remote shell.</p>
          <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer" className="text-link">
            <Code2 size={15} /> Inspect source <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </header>

    <section className="page-width node-dashboard">
      <div className="panel-chrome"><span>NODE PROFILE / DOCUMENTED STATE</span><span className="panel-status"><i /> PHYSICAL HARDWARE</span></div>
      <div className="node-dashboard-grid">
        <div className="node-core">
          <div className="node-core-icon"><Server size={31} strokeWidth={1.3} /></div>
          <div><span>PHYSICAL ORIGIN</span><h2>Lenovo IdeaPad 3</h2><p>Intel Core i3-10110U · 8 GiB DDR4</p></div>
        </div>
        <div className="node-telemetry">
          {[
            ["OS", "Arch Linux x86_64"],
            ["RUNTIME", "Docker Compose"],
            ["STORAGE", "233 GiB / ext4"],
            ["NETWORK", "Wi-Fi + WireGuard"],
            ["PUBLIC INGRESS", "Cloudflare Tunnel"],
            ["OPEN ROUTER PORTS", "0"],
          ].map(([label, value]) => <div className="telemetry-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
      </div>
    </section>

    <section className="section-block page-width">
      <div className="section-heading">
        <div><span className="section-index">01 / ACCESS</span><h2>Three paths in. No exposed ports.</h2></div>
        <p>Each method serves a different operating condition without turning the home router into a public entry point.</p>
      </div>
      <div className="access-method-grid">
        {accessMethods.map(({ index, icon: Icon, title, label, description, command, tone }) => (
          <article className={`access-method method-${tone}`} key={index}>
            <div className="access-method-top"><span>{index}</span><Icon size={20} strokeWidth={1.5} /></div>
            <h3>{title}</h3><small>{label}</small><p>{description}</p><code>{command}</code>
          </article>
        ))}
      </div>
    </section>

    <section className="section-block page-width remote-grid">
      <div className="remote-copy">
        <span className="section-index">02 / REMOTE SHELL</span>
        <h2>Identity before connectivity.</h2>
        <p>Cloudflare Access verifies the operator before a remote session reaches OpenSSH. Tailscale uses trusted device identity for the private path. Public documentation stops at that boundary.</p>
        <Link to="/architecture" className="primary-action">Trace the access boundary <ArrowUpRight size={15} /></Link>
      </div>
      <div className="shell-sequence">
        <div className="panel-chrome"><span>SESSION NEGOTIATION</span><span>declared sequence</span></div>
        <ol>
          {[
            ["01", "Request", "Open an identity-gated SSH route from an authorized client."],
            ["02", "Verify", "Cloudflare Access checks the allowed identity and session policy."],
            ["03", "Tunnel", "Traffic uses an existing outbound-only connection toward the host."],
            ["04", "Shell", "OpenSSH grants the terminal session after origin authentication."],
          ].map(([index, title, detail]) => <li key={index}><span>{index}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}
        </ol>
        <div className="shell-command"><span>$</span><code>ssh &lt;identity-gated-host&gt;</code><i /></div>
      </div>
    </section>

    <section className="section-block page-width">
      <div className="section-heading">
        <div><span className="section-index">03 / CONTINUITY</span><h2>What keeps a laptop useful as a node.</h2></div>
        <p>Headless operation, explicit restart behavior, and a deliberately small workload matter more here than pretending this is datacenter hardware.</p>
      </div>
      <div className="continuity-grid">
        {continuity.map(({ icon: Icon, label, title, description }) => (
          <article key={title}>
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="section-block page-width subsystem-grid">
      <article className="subsystem-card">
        <div className="subsystem-icon"><HardDrive size={21} strokeWidth={1.5} /></div>
        <span className="section-index">STORAGE SUBSYSTEM</span><h3>Samba over the private mesh</h3>
        <p>Cross-platform file access for macOS, Windows, Android, iOS, and iPadOS is reached privately over Tailscale.</p>
        <div className="command-pair"><code>smb://&lt;private-node&gt;</code><code>\\&lt;private-node&gt;</code></div>
      </article>
      <article className="subsystem-card">
        <div className="subsystem-icon"><Radio size={21} strokeWidth={1.5} /></div>
        <span className="section-index">SERVICE SURFACE</span><h3>Small, inspectable workload</h3>
        <p>The Compose-managed production surface is two constrained containers: Nginx for this static site and cloudflared for its public tunnel.</p>
        <div className="service-lines"><span><i /> arch-server-docs</span><span><i /> cloudflared</span></div>
      </article>
      <article className="subsystem-card">
        <div className="subsystem-icon"><Wrench size={21} strokeWidth={1.5} /></div>
        <span className="section-index">OPERATIONS</span><h3>Local administration</h3>
        <p>Network provisioning, file operations, device transfer, and system checks remain available from the terminal.</p>
        <div className="tool-list"><code>wlctl</code><code>yazi</code><code>KDE Connect</code><code>network-status.sh</code></div>
      </article>
    </section>
  </div>
);

export default ArchServer;
