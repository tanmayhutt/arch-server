import { ArrowDown, Cloud, Container, GitBranch, LockKeyhole, Network, Server } from "lucide-react";
import DetailedArchitectureMap from "@/components/DetailedArchitectureMap";

const planes = [
  {
    icon: Cloud,
    title: "Public data plane",
    tone: "public",
    description: "Visitor traffic terminates at Cloudflare. The edge handles DNS, TLS, filtering, and forwards only accepted HTTP traffic through the tunnel.",
    items: ["No home IP exposure", "No router port forwarding", "Automatic edge TLS"],
  },
  {
    icon: Network,
    title: "Private control plane",
    tone: "private",
    description: "Administrative traffic is separated from the public site. Tailscale carries SSH, Samba, and the deployment connection over WireGuard.",
    items: ["Device-bound identity", "Encrypted peer traffic", "Private service discovery"],
  },
  {
    icon: Container,
    title: "Origin runtime",
    tone: "origin",
    description: "Docker Compose owns the public workload. Nginx serves the compiled React bundle while cloudflared maintains the outbound edge connection.",
    items: ["Constrained CPU and memory", "No-new-privileges policy", "Automatic service restart"],
  },
];

const Architecture = () => (
  <div className="site-page architecture-page">
    <header className="page-header page-width">
      <div className="eyebrow">system architecture</div>
      <div className="page-header-grid">
        <h1>Two trust planes.<br />One physical origin.</h1>
        <p>
          Public delivery and private administration never share an exposed entry point. Outbound tunnels and identity-aware private routes mediate every path toward the host.
        </p>
      </div>
    </header>

    <section className="page-width architecture-map-section">
      <div className="panel-chrome">
        <span>LOSSLESS LOGICAL TOPOLOGY</span>
        <span>DOCUMENTED ROUTES</span>
      </div>
      <DetailedArchitectureMap />
    </section>

    <section className="section-block page-width">
      <div className="section-heading">
        <div><span className="section-index">01 / BOUNDARIES</span><h2>Each route has a single job.</h2></div>
        <p>The architecture is intentionally small enough to audit and strict enough to keep public delivery away from private services.</p>
      </div>
      <div className="plane-grid">
        {planes.map(({ icon: Icon, title, tone, description, items }, index) => (
          <article className={`plane-card plane-${tone}`} key={title}>
            <div className="plane-card-top"><span>0{index + 1}</span><Icon size={21} strokeWidth={1.5} /></div>
            <h3>{title}</h3>
            <p>{description}</p>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>

    <section className="section-block page-width request-sequence">
      <div className="sequence-copy">
        <span className="section-index">02 / REQUEST TRACE</span>
        <h2>What happens when this page loads.</h2>
        <p>The visitor never connects directly to the Lenovo server or the home network.</p>
      </div>
      <ol className="sequence-list">
        {[
          [Cloud, "Cloudflare edge", "Resolves the domain, negotiates TLS, and applies edge controls."],
          [LockKeyhole, "Encrypted tunnel", "Forwards the accepted request over the existing outbound connection."],
          [Container, "Nginx container", "Receives internal HTTP traffic on the isolated Docker network."],
          [Server, "Static response", "Returns the compiled React application from the physical node."],
          [GitBranch, "Continuous replacement", "The next website-path push rebuilds and replaces the served web image."],
        ].map(([Icon, title, description], index) => (
          <li key={title}>
            <span className="sequence-number">0{index + 1}</span>
            <Icon size={20} strokeWidth={1.5} />
            <div><h3>{title}</h3><p>{description}</p></div>
            {index < 4 && <ArrowDown className="sequence-arrow" size={15} />}
          </li>
        ))}
      </ol>
    </section>
  </div>
);

export default Architecture;
