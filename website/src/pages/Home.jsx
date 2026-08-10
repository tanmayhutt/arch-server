import { Link } from 'react-router-dom';
import { Server, Monitor, Shield, Box, Code, Terminal } from "lucide-react";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Particles from "@/components/magicui/particles";
import MagicCard from "@/components/magicui/magic-card";
import ShimmerButton from "@/components/magicui/shimmer-button";
import fastfetchImg from '../../../assets/fastfetch.png';

const Home = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-20 pb-24 px-6 overflow-hidden bg-black selection:bg-purple-500/30">
      
      {/* Background */}
      <Particles className="absolute inset-0" quantity={80} ease={80} color="#ffffff" refresh />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black z-0 pointer-events-none" />

      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="z-10 flex flex-col items-center text-center mb-16 w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            ONLINE
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-blue-500/30 bg-blue-500/10 text-blue-300">
            arch linux x86_64
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-300 hover:duration-300">
            <span>arch-server</span>
          </AnimatedShinyText>
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-10">
          Headless Arch Linux deployment on repurposed hardware. Zero-trust web hosting,
          NAS, and global SSH — no open ports.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a
            href="https://github.com/tanmayhutt/arch-server"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white overflow-hidden"
          >
            <Code className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            View Source
          </a>
          
          <a
            href="https://ssh.tanmaytiwari.me"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ShimmerButton shimmerColor="#a855f7" background="rgba(255,255,255,0.03)" className="px-6 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                <Terminal className="w-4 h-4 text-purple-300" />
                Browser SSH
              </span>
            </ShimmerButton>
          </a>
        </div>
      </header>

      {/* ── Fastfetch Terminal ────────────────────────────── */}
      <MagicCard 
        className="z-10 w-full max-w-4xl mb-16 rounded-xl border border-white/10 shadow-[0_0_80px_-20px_rgba(168,85,247,0.15)] bg-black/60 backdrop-blur-xl p-0 h-auto"
        spotlightColor="rgba(168,85,247,0.05)"
        spotlightBorderColor="rgba(168,85,247,0.4)"
      >
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10 relative z-10">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="mx-auto text-xs font-mono text-neutral-400">fastfetch — tanmay@puturdawaywaltuh</span>
          </div>
          <img src={fastfetchImg} alt="Arch Linux Fastfetch Output" className="w-full opacity-90 relative z-10 block" />
        </div>
      </MagicCard>

      {/* ── Bento Grid ───────────────────────────────────── */}
      <div className="z-10 w-full max-w-4xl relative">
        <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BentoCard
            name="/server_node"
            description="Tailscale mesh, Samba NAS, Zero-Trust SSH. Three access methods, zero open ports."
            Icon={Server}
            href="/server"
            cta="Read Docs"
            className="col-span-1 md:col-span-2 shadow-[0_0_40px_-20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.2)] transition-shadow"
            background={<div className="absolute inset-0 bg-neutral-950" />}
          />
          <BentoCard
            name="/desktop_env"
            description="Dormant Wayland compositor stack, custom dotfiles, and visual aesthetics via Hyprland."
            Icon={Monitor}
            href="/desktop"
            cta="Read Docs"
            className="col-span-1 shadow-[0_0_40px_-20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.2)] transition-shadow"
            background={<div className="absolute inset-0 bg-neutral-950" />}
          />
          <BentoCard
            name="/security"
            description="Zero exposure to the public internet. All ingress is brokered through outbound-only encrypted tunnels."
            Icon={Shield}
            href="/server"
            cta="View Architecture"
            className="col-span-1"
            background={<div className="absolute inset-0 bg-neutral-950" />}
          />
          <BentoCard
            name="/self_hosting"
            description="Scalable homelab orchestrated via Docker Compose. Hardened containers with resource limits."
            Icon={Box}
            href="/server"
            cta="Explore Stack"
            className="col-span-1 md:col-span-2 shadow-[0_0_40px_-20px_rgba(14,165,233,0.1)] hover:shadow-[0_0_60px_-15px_rgba(14,165,233,0.2)] transition-shadow"
            background={<div className="absolute inset-0 bg-neutral-950" />}
          />
        </BentoGrid>
      </div>
      
    </div>
  );
};

export default Home;
