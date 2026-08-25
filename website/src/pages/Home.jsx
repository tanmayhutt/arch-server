import { lazy, Suspense, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Cloud, Code2, Container, GitBranch, HardDrive, Network, Server, ShieldCheck, Terminal } from "lucide-react";
import InfrastructureMap from "@/components/InfrastructureMap";
import ServerStatus from "@/components/ServerStatus";
import { particleStoryStages } from "@/data/particleStory";
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

const Home = () => {
  const storyRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(particleStoryStages.length - 1, Math.floor(value * particleStoryStages.length));
    setActiveStage((current) => current === next ? current : next);
  });

  const goToStage = (index) => {
    const story = storyRef.current;
    if (!story) return;
    const available = story.offsetHeight - window.innerHeight;
    const target = story.offsetTop + (available * index) / (particleStoryStages.length - 1);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const [number, title, description] = particleStoryStages[activeStage];

  return (
    <div className="site-page home-page home-redesign">
      <section className="story-prologue page-width" id="home">
        <div className="story-prologue-meta"><span>Lenovo IdeaPad / Arch Linux</span><span>Physical node / India</span></div>
        <div className="story-prologue-copy">
          <span className="section-index">A SECOND LIFE, TOLD BY 2,100 POINTS</span>
          <h1>A broken screen became <em>a server.</em></h1>
          <p>I loved this laptop as an Arch and Hyprland machine. When its display failed, the computer did not. Scroll to watch the same hardware change jobs.</p>
        </div>
        <a className="story-scroll-cue" href="#story"><span>Begin the transformation</span><ArrowDown size={16} /></a>
      </section>

      <section className="particle-story" id="story" ref={storyRef} aria-label="The Arch server transformation story">
        <div className="particle-story-sticky">
          <div className="particle-story-frame page-width" data-stage={activeStage + 1}>
            <div className="particle-story-topline"><span>Scroll-driven system model</span><span>{number} / 08</span><span>Move the cursor through the field</span></div>
            <div className="particle-story-visual">
              <Suspense fallback={<div className="machine-scene machine-scene-loading" aria-label="Loading the particle story" />}><NetworkGlobe activeStage={activeStage} /></Suspense>
            </div>
            <div className="particle-story-copy" aria-live="polite">
              <span className="particle-story-number">{number}</span>
              <div><span className="particle-story-label">Chapter {number}</span><h2>{title}</h2><p>{description}</p></div>
            </div>
            <div className="particle-story-navigation" role="group" aria-label="Jump to a story chapter">
              {particleStoryStages.map(([stageNumber, stageTitle], index) => (
                <button key={stageTitle} type="button" className={index === activeStage ? "active" : ""} onClick={() => goToStage(index)} aria-label={`Chapter ${stageNumber}: ${stageTitle}`} aria-pressed={index === activeStage}>
                  <span>{stageNumber}</span><strong>{stageTitle}</strong>
                </button>
              ))}
            </div>
            <div className="particle-story-progress" aria-hidden="true"><motion.span style={{ scaleX: progressScale }} /></div>
          </div>
        </div>
      </section>

      <section className="story-resolution page-width">
        <Reveal className="story-resolution-copy">
          <span className="section-index">WHAT CHANGED</span><h2>The display disappeared. The personality did not.</h2>
          <p>Pywal, Waybar, Kitty, Zsh, Wofi, Hyprlock, and the rest of my customized Arch setup remain available for local recovery. The machine simply gained a quieter default life: headless, reachable, and useful.</p>
          <Link to="/about" className="text-link">Read the complete story <ArrowUpRight size={15} /></Link>
        </Reveal>
        <div className="story-resolution-facts"><span><b>01</b>No open router ports</span><span><b>02</b>Separate public and private trust</span><span><b>03</b>Short-lived deployment identity</span></div>
      </section>

      <section className="route-section page-width" id="how-it-works">
        <div className="route-overview">
          <Reveal className="editorial-heading"><span className="section-index">THE TECHNICAL PAYOFF</span><h2>One laptop. Three routes. Different trust.</h2><p>The particle story shows why the machine changed. This map shows exactly how traffic reaches it now.</p></Reveal>
          <InfrastructureMap />
        </div>
        <ol className="request-story">{requestStory.map(([Icon, stepTitle, body], index) => <li key={stepTitle}><span className="story-number">0{index + 1}</span><Icon size={20} strokeWidth={1.5} /><div><h3>{stepTitle}</h3><p>{body}</p></div></li>)}</ol>
        <div className="deep-dive-link"><p>The detailed map includes Cloudflare Access, Samba, container boundaries, restart behaviour, and the full OIDC deployment path.</p><Link to="/architecture" className="text-link">Open the technical architecture <ArrowUpRight size={15} /></Link></div>
      </section>

      <section className="jobs-section page-width">
        <Reveal className="editorial-heading compact"><span className="section-index">WHAT IT EARNS ITS POWER FOR</span><h2>Three useful jobs. No homelab theatre.</h2></Reveal>
        <div className="job-ledger">{jobs.map(([Icon, jobTitle, body], index) => <article key={jobTitle}><span>0{index + 1}</span><Icon size={20} strokeWidth={1.5} /><h3>{jobTitle}</h3><p>{body}</p></article>)}</div>
        <div className="access-principle"><ShieldCheck size={20} strokeWidth={1.5} /><p><strong>Reachable from anywhere does not mean open to anyone.</strong> People receive separate, revocable identities. They never receive my password, private key, or reusable network key.</p><Link to="/server#trust-model" className="text-link">Read the access model <ArrowUpRight size={15} /></Link></div>
      </section>

      <section className="home-live page-width" id="live"><ServerStatus compact /></section>

      <section className="section-block page-width home-story-bridge">
        <Reveal className="story-bridge-copy"><span className="section-index">THE MACHINE TODAY</span><h2>Still personal. Just useful in a different way.</h2><p>The graphical setup remains available for local recovery and maintenance, while the public serving path stays small: React, Nginx, cloudflared, and a coarse telemetry service.</p><div className="hero-actions"><Link to="/desktop" className="primary-action">See the retained desktop <ArrowUpRight size={15} /></Link><a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer" className="secondary-action"><Code2 size={16} /> View source</a></div></Reveal>
        <div className="terminal-evidence"><div className="panel-chrome"><span>PRIVACY-SANITIZED CAPTURE</span><span>ARCH LINUX / PHYSICAL NODE</span></div><img src={fastfetchImg} alt="Privacy-sanitized Fastfetch output from the physical Arch Linux server" /></div>
      </section>
    </div>
  );
};

export default Home;
