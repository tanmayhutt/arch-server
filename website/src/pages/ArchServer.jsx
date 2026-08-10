import {
  ArrowUpRight,
  Code2,
  HardDrive,
  KeyRound,
  Network,
  Radio,
  Server,
  Terminal,
  Wrench,
} from "lucide-react";

const accessMethods = [
  {
    index: "01",
    icon: Network,
    title: "Tailscale SSH",
    label: "TRUSTED DEVICES",
    description: "Direct administration over the private WireGuard mesh. This is the default path for owned devices and CI/CD.",
    command: "ssh user@<tailscale-ip>",
    tone: "private",
  },
  {
    index: "02",
    icon: KeyRound,
    title: "Cloudflare Access",
    label: "ANY AUTHORIZED DEVICE",
    description: "Native SSH is proxied over HTTPS after an identity check, without exposing port 22 on the home router.",
    command: "ssh ssh.tanmaytiwari.me",
    tone: "public",
  },
  {
    index: "03",
    icon: Terminal,
    title: "Browser terminal",
    label: "ZERO CLIENT INSTALL",
    description: "Cloudflare renders an interactive shell in a modern browser after the same access policy is satisfied.",
    command: "https://ssh.tanmaytiwari.me",
    tone: "origin",
  },
];

const ArchServer = () => (
  <div className="site-page detail-page">
    <header className="page-header page-width">
      <div className="eyebrow"><span className="live-dot" /> server node / operational</div>
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
      <div className="panel-chrome"><span>NODE TELEMETRY / DECLARED STATE</span><span className="panel-status"><i /> HOST ONLINE</span></div>
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
        <p>Cloudflare Access verifies the operator before the tunnel carries a session toward SSH. Tailscale uses trusted device identity for the private path.</p>
        <a href="https://ssh.tanmaytiwari.me" target="_blank" rel="noreferrer" className="primary-action">Open browser terminal <ArrowUpRight size={15} /></a>
      </div>
      <div className="shell-sequence">
        <div className="panel-chrome"><span>SESSION NEGOTIATION</span><span>access.trace</span></div>
        <ol>
          {[
            ["01", "Request", "Open the SSH hostname from a browser or configured client."],
            ["02", "Verify", "Cloudflare Access checks the allowed identity and session policy."],
            ["03", "Tunnel", "Traffic enters the existing outbound-only cloudflared connection."],
            ["04", "Shell", "OpenSSH on the Arch host grants the authorized terminal session."],
          ].map(([index, title, detail]) => <li key={index}><span>{index}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}
        </ol>
        <div className="shell-command"><span>$</span><code>ssh ssh.tanmaytiwari.me</code><i /></div>
      </div>
    </section>

    <section className="section-block page-width subsystem-grid">
      <article className="subsystem-card">
        <div className="subsystem-icon"><HardDrive size={21} strokeWidth={1.5} /></div>
        <span className="section-index">STORAGE SUBSYSTEM</span><h3>Samba over the private mesh</h3>
        <p>Cross-platform file access stays bound to Tailscale and remains invisible to the public internet.</p>
        <div className="command-pair"><code>smb://&lt;tailscale-ip&gt;</code><code>\\&lt;tailscale-ip&gt;</code></div>
      </article>
      <article className="subsystem-card">
        <div className="subsystem-icon"><Radio size={21} strokeWidth={1.5} /></div>
        <span className="section-index">SERVICE SURFACE</span><h3>Small, inspectable workload</h3>
        <p>The production surface is two constrained containers: Nginx for the static site and cloudflared for the tunnel.</p>
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
