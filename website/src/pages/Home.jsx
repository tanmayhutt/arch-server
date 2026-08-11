import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Cloud,
  Code2,
  Container,
  GitBranch,
  HardDrive,
  Network,
  Server,
  Terminal,
} from "lucide-react";
import NetworkGlobe from "@/components/NetworkGlobe";
import InfrastructureMap from "@/components/InfrastructureMap";
import fastfetchImg from "../../../assets/fastfetch-sanitized.jpg";

const requestStory = [
  {
    icon: Cloud,
    title: "Your browser asks Cloudflare",
    body: "Cloudflare answers the public door: it resolves the domain, handles HTTPS, and filters the request. At this point, your browser still knows nothing about my home network.",
  },
  {
    icon: Network,
    title: "The server has already called out",
    body: "A cloudflared container on the Lenovo keeps an outbound tunnel open. Cloudflare sends the accepted request down that existing connection, so I never have to expose a router port.",
  },
  {
    icon: Container,
    title: "Nginx serves this page",
    body: "Inside Docker, Nginx receives the request and returns the compiled React site. The page describing the machine is literally coming from that machine.",
  },
  {
    icon: Terminal,
    title: "Administration takes a different road",
    body: "SSH and Samba do not share the public route. My own devices reach them over Tailscale, an encrypted WireGuard mesh with device identity built in.",
  },
  {
    icon: GitBranch,
    title: "A push updates the server",
    body: "When website code lands on main, GitHub Actions joins the private network, connects over SSH, rebuilds the Compose stack, and replaces the site you are reading.",
  },
];

const Home = () => (
  <div className="site-page home-page">
    <section className="hero-section page-width">
      <div className="hero-copy">
        <div className="eyebrow">an old laptop with a second job</div>
        <h1>The screen died.<br />The computer did not.</h1>
        <p className="hero-lead">
          I turned my old Arch Linux laptop into a headless home server. It stores files, accepts a private shell, deploys my projects, and serves this website about itself.
        </p>
        <p className="origin-proof">You are reading a page delivered by the Lenovo IdeaPad sitting on my desk in India.</p>
        <div className="hero-actions">
          <a href="#how-it-works" className="primary-action">See how it works <ArrowDown size={16} /></a>
          <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer" className="secondary-action">
            <Code2 size={16} /> View source
          </a>
        </div>
      </div>

      <div className="globe-panel">
        <div className="panel-chrome"><span>ROUTES TO THE PHYSICAL ORIGIN</span><span>INDIA / LENOVO IDEAPAD 3</span></div>
        <NetworkGlobe />
        <div className="globe-readout">
          <div><span>PUBLIC</span><strong>Cloudflare Tunnel</strong></div>
          <div><span>PRIVATE</span><strong>Tailscale / WireGuard</strong></div>
          <div><span>ORIGIN</span><strong>Arch Linux at home</strong></div>
        </div>
      </div>
    </section>

    <section className="explain-section page-width" id="how-it-works">
      <div className="editorial-heading">
        <span className="section-index">HOW IT WORKS</span>
        <h2>One request, three networks, no mysterious magic.</h2>
        <p>
          The animated dots below are the only lights that move on purpose. They represent traffic: blue for the public site, green for private administration, and amber for deployment.
        </p>
      </div>
      <InfrastructureMap />
      <ol className="request-story">
        {requestStory.map(({ icon: Icon, title, body }, index) => (
          <li key={title}>
            <span className="story-number">0{index + 1}</span>
            <Icon size={21} strokeWidth={1.5} />
            <div><h3>{title}</h3><p>{body}</p></div>
          </li>
        ))}
      </ol>
      <div className="deep-dive-link">
        <p>That is the friendly version. The complete topology also documents Cloudflare Access, Samba, container boundaries, restart behavior, and the deployment route.</p>
        <Link to="/architecture" className="text-link">Open the technical architecture <ArrowUpRight size={15} /></Link>
      </div>
    </section>

    <section className="section-block page-width useful-section">
      <div className="editorial-heading compact">
        <span className="section-index">WHAT THE MACHINE DOES</span>
        <h2>A small server with a short, useful job list.</h2>
      </div>
      <div className="useful-list">
        <article><HardDrive size={21} /><div><h3>Private storage</h3><p>Samba turns the internal SSD into a NAS for my Mac, phone, and other trusted devices over Tailscale.</p></div></article>
        <article><Terminal size={21} /><div><h3>Remote Linux machine</h3><p>I administer Arch, move files, and run tools from a private shell without needing the broken display. On an unenrolled device, <a href="https://ssh.tanmaytiwari.me" target="_blank" rel="noreferrer">ssh.tanmaytiwari.me</a> opens the identity-gated browser terminal.</p></div></article>
        <article><Server size={21} /><div><h3>Self-hosted projects</h3><p>Docker keeps the public workloads isolated and repeatable. Today that includes this site and its Cloudflare tunnel.</p></div></article>
      </div>
    </section>

    <section className="section-block page-width home-story-bridge">
      <div className="story-bridge-copy">
        <span className="section-index">WHY THIS EXISTS</span>
        <h2>It started as a very customized laptop.</h2>
        <p>
          Before it was a server, this IdeaPad was my Arch and Hyprland playground: Pywal colors, Waybar, Kitty, Zsh, Wofi, CAVA shaders, and a keyboard-first workflow. When the display failed, I kept the system I loved and changed the role around it.
        </p>
        <Link to="/about" className="primary-action">Read the full story <ArrowUpRight size={15} /></Link>
      </div>
      <div className="terminal-evidence">
        <div className="panel-chrome"><span>THE MACHINE TODAY</span><span>PRIVACY-SANITIZED CAPTURE</span></div>
        <img src={fastfetchImg} alt="Privacy-sanitized Fastfetch output from the physical Arch Linux server" />
      </div>
    </section>
  </div>
);

export default Home;
