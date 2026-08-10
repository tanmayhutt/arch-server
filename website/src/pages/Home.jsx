import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Box,
  Cloud,
  Code2,
  GitBranch,
  HardDrive,
  Network,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import NetworkGlobe from "@/components/NetworkGlobe";
import InfrastructureMap from "@/components/InfrastructureMap";
import fastfetchImg from "../../../assets/fastfetch-sanitized.jpg";

const capabilities = [
  {
    number: "01",
    icon: Cloud,
    title: "Public edge",
    label: "Cloudflare Tunnel",
    description: "HTTPS reaches the machine through an outbound-only tunnel. The router exposes no inbound ports.",
  },
  {
    number: "02",
    icon: Network,
    title: "Private control plane",
    label: "Tailscale mesh",
    description: "OpenSSH, NAS traffic, and automated deployments stay inside an identity-bound WireGuard network.",
  },
  {
    number: "03",
    icon: Box,
    title: "Isolated runtime",
    label: "Docker Compose",
    description: "Nginx and cloudflared run as constrained services with restart policies and privilege stripping.",
  },
  {
    number: "04",
    icon: GitBranch,
    title: "Continuous delivery",
    label: "GitHub Actions",
    description: "A website change on main securely reaches the node, rebuilds the frontend, and replaces the served container.",
  },
];

const Home = () => (
    <div className="site-page home-page">
      <section className="hero-section page-width">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> served by physical hardware</div>
          <h1>A private edge,<br />built from an old laptop.</h1>
          <p className="hero-lead">
            A headless Arch Linux node operating as storage, deployment target, secure remote shell, and the origin serving this website.
          </p>

          <div className="hero-actions">
            <Link to="/architecture" className="primary-action">
              Trace the architecture <ArrowUpRight size={16} />
            </Link>
            <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer" className="secondary-action">
              <Code2 size={16} /> View repository
            </a>
          </div>

          <dl className="hero-metrics">
            <div><dt>0</dt><dd>router ports open</dd></div>
            <div><dt>2</dt><dd>isolated trust planes</dd></div>
            <div><dt>1</dt><dd>physical origin node</dd></div>
          </dl>
        </div>

        <div className="globe-panel">
          <div className="panel-chrome">
            <span>NETWORK ROUTES</span>
            <span>ROTATABLE MODEL</span>
          </div>
          <NetworkGlobe />
          <div className="globe-readout">
            <div><span>PUBLIC PATH</span><strong>Cloudflare Edge</strong></div>
            <div><span>PRIVATE PATH</span><strong>WireGuard Mesh</strong></div>
            <div><span>ORIGIN</span><strong>Lenovo IdeaPad 3</strong></div>
          </div>
        </div>
      </section>

      <section className="transmission-band">
        <div className="page-width transmission-inner">
          <span className="transmission-label">DOCUMENTED REQUEST PATH</span>
          <div className="transmission-route" aria-label="Browser traffic route">
            {[
              ["01", "Browser"],
              ["02", "Cloudflare edge"],
              ["03", "Encrypted tunnel"],
              ["04", "Nginx container"],
            ].map(([number, label], index) => (
              <div className="route-step" key={number}>
                <span>{number}</span><strong>{label}</strong>
                {index < 3 && <i aria-hidden="true" />}
              </div>
            ))}
          </div>
          <span className="transmission-state">DECLARED / ENCRYPTED</span>
        </div>
      </section>

      <section className="section-block page-width">
        <div className="section-heading">
          <div><span className="section-index">01 / SYSTEM</span><h2>How this request reaches my Lenovo.</h2></div>
          <p>The diagram separates public delivery, private administration, and deployment into their actual boundaries.</p>
        </div>
        <InfrastructureMap />
      </section>

      <section className="section-block page-width">
        <div className="section-heading">
          <div><span className="section-index">02 / CAPABILITIES</span><h2>Small node. Deliberate architecture.</h2></div>
          <p>The machine is modest. The network model is not. Each layer has one clear responsibility and one controlled path in.</p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ number, icon: Icon, title, label, description }) => (
            <article className="capability-card" key={number}>
              <div className="capability-top"><span>{number}</span><Icon size={20} strokeWidth={1.5} /></div>
              <h3>{title}</h3>
              <p className="capability-label">{label}</p>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block page-width evidence-grid">
        <div className="evidence-copy">
          <span className="section-index">03 / BUILD NOTE</span>
          <h2>I kept the laptop. I changed its job.</h2>
          <p>
            When its display became unreliable, I stopped treating the IdeaPad as a laptop. It now stays headless, stores files, accepts private administration, and serves the page documenting it.
          </p>
          <div className="hardware-list">
            <div><Server size={18} /><span><small>HOST</small>Lenovo IdeaPad 3</span></div>
            <div><HardDrive size={18} /><span><small>STORAGE</small>233 GiB ext4 SSD</span></div>
            <div><ShieldCheck size={18} /><span><small>INGRESS</small>Zero exposed ports</span></div>
            <div><Terminal size={18} /><span><small>ADMIN</small>Identity-gated shell</span></div>
          </div>
          <Link to="/server" className="text-link">Inspect what the node actually runs <ArrowUpRight size={15} /></Link>
        </div>
        <div className="terminal-evidence">
          <div className="panel-chrome"><span>SANITIZED ORIGIN CAPTURE</span><span>identity redacted</span></div>
          <img src={fastfetchImg} alt="Privacy-sanitized Fastfetch output from the physical Arch Linux server" />
          <div className="terminal-foot"><span>hardware snapshot</span><span>arch linux x86_64</span></div>
        </div>
      </section>
    </div>
);

export default Home;
