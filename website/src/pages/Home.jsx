import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Cloud, Code2, Container, GitBranch, HardDrive, Network, Server, ShieldCheck, Terminal } from "lucide-react";
import InfrastructureMap from "@/components/InfrastructureMap";
import ServerStatus from "@/components/ServerStatus";
import fastfetchImg from "../../../assets/fastfetch-sanitized.jpg";

const NetworkGlobe = lazy(() => import("@/components/NetworkGlobe"));

const requestStory = [
  [Cloud, "Your browser asks Cloudflare", "Cloudflare resolves the domain, handles HTTPS, and filters the request. Your browser never learns where my home network is."],
  [Network, "The laptop has already called out", "A cloudflared container keeps an outbound tunnel open. Accepted requests travel down that existing connection, so the router exposes no port."],
  [Container, "Nginx returns the website", "Inside Docker, Nginx receives internal HTTP and serves the compiled React files. This page about the machine is coming from the machine."],
  [Terminal, "Administration takes another road", "SSH and Samba stay on Tailscale. My devices reach them through an encrypted WireGuard mesh with device identity attached."],
  [GitBranch, "A push replaces the running site", "GitHub Actions receives a short-lived Tailscale identity, reaches only SSH, rebuilds Compose, and verifies the public health route."],
];

const jobs = [
  [HardDrive, "Private storage", "Samba makes the internal SSD available to enrolled devices without publishing a file browser."],
  [Terminal, "Remote Linux machine", "I can use a private SSH route, or an identity-gated browser terminal at ssh.tanmaytiwari.me."],
  [Server, "Self-hosted origin", "Docker runs this website, its telemetry endpoint, and the outbound Cloudflare connector."],
];

const Reveal = ({ children, className = "" }) => {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
};

const Home = () => (
  <div className="site-page home-page">
    <section className="hero-section page-width" id="home">
      <div className="hero-copy">
        <div className="eyebrow">A broken display became a working piece of infrastructure</div>
        <h1>The laptop became a node.</h1>
        <p className="hero-lead">My old Arch Linux laptop stores files, accepts a private shell, deploys projects, and serves this website about itself.</p>
        <p className="origin-proof">This page travelled from a Lenovo IdeaPad on my desk in India, through an outbound Cloudflare tunnel, to your browser.</p>
        <div className="hero-actions">
          <a href="#story" className="primary-action">Follow the transformation <ArrowDown size={16} /></a>
          <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer" className="secondary-action"><Code2 size={16} /> View source</a>
        </div>
      </div>
      <div className="hero-machine">
        <div className="machine-kicker"><span>Interactive system model</span><span>Three states / one machine</span></div>
        <Suspense fallback={<div className="machine-scene machine-scene-loading" aria-label="Loading interactive system model" />}>
          <NetworkGlobe />
        </Suspense>
      </div>
    </section>

    <section className="transformation-story page-width" id="story">
      <Reveal className="story-intro">
        <span className="section-index">THE SHORT VERSION</span>
        <h2>A screen failure changed the role, not the computer.</h2>
        <p>I already loved the machine because it was my Arch and Hyprland playground. When its display stopped being dependable, I did not wipe away that history. I removed the display as a dependency and gave the hardware a quieter job.</p>
      </Reveal>
      <div className="story-chapters">
        {[
          ["01", "It was personal first.", "Pywal, Waybar, Kitty, Zsh, Wofi, Hyprlock, and a keyboard-first workflow made the laptop mine."],
          ["02", "The display failed.", "The computer still booted and the SSD still held a system I cared about. Only the normal doorway had gone."],
          ["03", "I made it headless.", "Closed-lid operation, SSH, Tailscale, Samba, Docker, and systemd turned it into a machine that did not need a screen."],
          ["04", "Then I gave it a public proof.", "Cloudflare Tunnel lets the laptop serve this site without exposing my router or home address."],
        ].map(([number, title, body]) => <Reveal className="story-chapter" key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></Reveal>)}
      </div>
      <Link to="/about" className="text-link story-more">Read the complete story <ArrowUpRight size={15} /></Link>
    </section>

    <section className="route-section page-width" id="how-it-works">
      <div className="route-overview">
        <Reveal className="editorial-heading">
          <span className="section-index">FOLLOW ONE REQUEST</span>
          <h2>Three routes end at the same laptop. They do not share the same trust.</h2>
          <p>Choose a route. The diagram explains what crosses the public internet, what stays private, and what a deployment runner can reach.</p>
        </Reveal>
        <InfrastructureMap />
      </div>
      <ol className="request-story">
        {requestStory.map(([Icon, title, body], index) => (
          <li key={title}><span className="story-number">0{index + 1}</span><Icon size={20} strokeWidth={1.5} /><div><h3>{title}</h3><p>{body}</p></div></li>
        ))}
      </ol>
      <div className="deep-dive-link"><p>The detailed map includes Cloudflare Access, Samba, container boundaries, restart behaviour, and the full OIDC deployment path.</p><Link to="/architecture" className="text-link">Open the technical architecture <ArrowUpRight size={15} /></Link></div>
    </section>

    <section className="jobs-section page-width">
      <Reveal className="editorial-heading compact"><span className="section-index">WHAT IT EARNS ITS POWER FOR</span><h2>Three useful jobs. No homelab theatre.</h2></Reveal>
      <div className="job-ledger">
        {jobs.map(([Icon, title, body], index) => <article key={title}><span>0{index + 1}</span><Icon size={20} strokeWidth={1.5} /><h3>{title}</h3><p>{body}</p></article>)}
      </div>
      <div className="access-principle"><ShieldCheck size={20} strokeWidth={1.5} /><p><strong>Reachable from anywhere does not mean open to anyone.</strong> People receive separate, revocable identities. They never receive my password, private key, or reusable network key.</p><Link to="/server#trust-model" className="text-link">Read the access model <ArrowUpRight size={15} /></Link></div>
    </section>

    <section className="home-live page-width" id="live">
      <ServerStatus compact />
    </section>

    <section className="section-block page-width home-story-bridge">
      <Reveal className="story-bridge-copy"><span className="section-index">THE MACHINE TODAY</span><h2>Still personal. Just useful in a different way.</h2><p>The graphical setup remains available for local recovery and maintenance, while the public serving path stays small and boring: React, Nginx, cloudflared, and a coarse telemetry service.</p><Link to="/desktop" className="primary-action">See the retained desktop <ArrowUpRight size={15} /></Link></Reveal>
      <div className="terminal-evidence"><div className="panel-chrome"><span>PRIVACY-SANITIZED CAPTURE</span><span>ARCH LINUX / PHYSICAL NODE</span></div><img src={fastfetchImg} alt="Privacy-sanitized Fastfetch output from the physical Arch Linux server" /></div>
    </section>
  </div>
);

export default Home;
