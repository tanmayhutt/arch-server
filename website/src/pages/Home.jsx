import { Link } from 'react-router-dom';
import { Server, Monitor, Shield, Box, Code, Terminal } from "lucide-react";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import RetroGrid from "@/components/magicui/retro-grid";
import fastfetchImg from '../../../assets/fastfetch.png';

const Home = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-20 pb-24 px-6 overflow-hidden">
      <RetroGrid />

      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="z-10 flex flex-col items-center text-center mb-16 w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-blue-500/30 bg-blue-500/10 text-blue-400">
            arch linux x86_64
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
            <span>arch-server</span>
          </AnimatedShinyText>
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-8">
          Headless Arch Linux deployment on repurposed hardware. Zero-trust web hosting,
          NAS, and global SSH — no open ports.
        </p>

        <div className="flex gap-4">
          <a
            href="https://github.com/tanmayhutt/arch-server"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white"
          >
            <Code className="w-4 h-4" />
            View Source
          </a>
          <a
            href="https://ssh.tanmaytiwari.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors"
          >
            <Terminal className="w-4 h-4" />
            Browser SSH
          </a>
        </div>
      </header>

      {/* ── Fastfetch Terminal ────────────────────────────── */}
      <div className="z-10 w-full max-w-4xl mb-16 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span className="mx-auto text-xs font-mono text-neutral-400">fastfetch — tanmay@puturdawaywaltuh</span>
        </div>
        <img src={fastfetchImg} alt="Arch Linux Fastfetch Output" className="w-full opacity-90 hover:opacity-100 transition-opacity" />
      </div>

      {/* ── Bento Grid ───────────────────────────────────── */}
      <div className="z-10 w-full max-w-4xl">
        <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BentoCard
            name="/server_node"
            description="Tailscale mesh, Samba NAS, Zero-Trust SSH. Three access methods, zero open ports."
            Icon={Server}
            href="/server"
            cta="Read Docs"
            className="col-span-1 md:col-span-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />}
          />
          <BentoCard
            name="/desktop_env"
            description="Dormant Wayland compositor stack, custom dotfiles, and visual aesthetics via Hyprland."
            Icon={Monitor}
            href="/desktop"
            cta="Read Docs"
            className="col-span-1"
            background={<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />}
          />
          <BentoCard
            name="/security"
            description="Zero exposure to the public internet. All ingress is brokered through outbound-only encrypted tunnels."
            Icon={Shield}
            href="/server"
            cta="View Architecture"
            className="col-span-1"
            background={<div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-transparent" />}
          />
          <BentoCard
            name="/self_hosting"
            description="Scalable homelab orchestrated via Docker Compose. Hardened containers with resource limits."
            Icon={Box}
            href="/server"
            cta="Explore Stack"
            className="col-span-1 md:col-span-2"
            background={<div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent" />}
          />
        </BentoGrid>
      </div>
      
    </div>
  );
};

export default Home;
