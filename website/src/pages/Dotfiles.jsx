import { Code, Monitor, Cpu, Terminal as TerminalIcon, Shield } from "lucide-react";
import MagicCard from "@/components/magicui/magic-card";
import Particles from "@/components/magicui/particles";
import hyprlandImg from '../../../assets/hyprland.png';

const Dotfiles = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-20 pb-24 px-6 overflow-hidden bg-black selection:bg-emerald-500/30">

      {/* Background */}
      <Particles className="absolute inset-0" quantity={60} ease={80} color="#ffffff" refresh />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black z-0 pointer-events-none" />

      {/* ── Header ───────────────────────────────────────── */}
      <header className="z-10 flex flex-col items-center text-center mb-16 w-full max-w-4xl relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
            module: hyprland-dotfiles
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          DESKTOP_ENVIRONMENT
        </h1>

        <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed mb-8">
          High-performance Hyprland and Zsh configuration, tuned for Arch Linux. Built for
          speed, aesthetics, and a powerful, keyboard-driven workflow.
        </p>

        <a
          href="https://github.com/tanmayhutt/hyprland-dotfiles"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white overflow-hidden shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
        >
          <Code className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          View Source Code
        </a>
      </header>

      <div className="w-full max-w-4xl flex flex-col gap-8 z-10 relative">

        {/* ── Terminal Image ─────────────────────────────────── */}
        <MagicCard 
          className="p-0 shadow-[0_0_50px_-20px_rgba(16,185,129,0.15)] h-auto"
          spotlightColor="rgba(16,185,129,0.05)"
          spotlightBorderColor="rgba(16,185,129,0.4)"
        >
          <img src={hyprlandImg} alt="Hyprland Desktop Environment Showcase" className="w-full relative z-10 block opacity-90" />
        </MagicCard>

        {/* ── Features and Highlights ─────────────────────────────────── */}
        <MagicCard 
          className="p-8 shadow-[0_0_50px_-20px_rgba(16,185,129,0.15)] h-auto"
          spotlightColor="rgba(16,185,129,0.05)"
          spotlightBorderColor="rgba(16,185,129,0.4)"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2 text-white">
              <Cpu className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">/features_and_highlights</h2>
            </div>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              This configuration is built for a clean and efficient Linux experience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h3 className="text-emerald-400 font-semibold mb-2">Window Manager</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-200 font-medium">Hyprland</strong> with dynamic tiling, 10px inner gaps, 15px outer gaps, and 20px window rounding.
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h3 className="text-emerald-400 font-semibold mb-2">Aesthetics</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  System-wide theming via <strong className="text-neutral-200 font-medium">Pywal</strong>, with automatic reload on terminal startup.
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h3 className="text-emerald-400 font-semibold mb-2">Terminal</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-200 font-medium">Kitty</strong>. GPU-accelerated. Uses a custom color scheme and displays system info using neofetch on launch.
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h3 className="text-emerald-400 font-semibold mb-2">Shell</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-200 font-medium">Zsh</strong> powered by Oh My Zsh, with zsh-autosuggestions, syntax-highlighting, and a Heisenberg quote.
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h3 className="text-emerald-400 font-semibold mb-2">Visualizer</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-200 font-medium">CAVA</strong> configured with custom shaders (eye_of_phi, northern_lights, spectrum).
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h3 className="text-emerald-400 font-semibold mb-2">App Launcher</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-200 font-medium">Wofi</strong> styled as a transparent dark window with frosted glass blur and shadow.
                </p>
              </div>
            </div>
          </div>
        </MagicCard>

        {/* ── Key Bindings ─────────────────────────────────── */}
        <MagicCard 
          className="p-8 shadow-[0_0_50px_-20px_rgba(255,255,255,0.05)] h-auto"
          spotlightColor="rgba(255,255,255,0.03)"
          spotlightBorderColor="rgba(255,255,255,0.2)"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 text-white">
              <TerminalIcon className="w-6 h-6 text-neutral-300" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">/key_bindings</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-500">
                    <th className="py-3 px-4 font-medium uppercase tracking-widest text-xs">Action</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-widest text-xs">Key Binding</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-widest text-xs">Command</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300 divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">Terminal</td>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Super + T</code></td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">kitty</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">App Launcher</td>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Super + A</code></td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">wofi --show drun</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">File Manager</td>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Super + E</code></td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">thunar</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">Browser</td>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Super + B</code></td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">brave</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">Kill Window</td>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Super + Q</code></td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">killactive</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">Lock Screen</td>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Super + L</code></td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">hyprlock</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">Full Screenshot</td>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Print</code></td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">grim</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </MagicCard>

        {/* ── Deployment Automation ─────────────────────────────────── */}
        <MagicCard 
          className="p-8 shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)] h-auto"
          spotlightColor="rgba(255,255,255,0.03)"
          spotlightBorderColor="rgba(255,255,255,0.2)"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Code className="w-6 h-6 text-neutral-300" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">/deployment_automation</h2>
            </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Configuration deployment is handled by automated bash orchestration via symlink injection to <code className="px-1 bg-white/10 rounded font-mono text-xs">~/.config</code>.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-200 mb-2 font-mono">deploy.sh</h3>
                <pre className="p-4 bg-black/80 border border-white/10 rounded-xl text-neutral-400 font-mono text-xs overflow-x-auto shadow-inner leading-loose">
{`#!/bin/bash
echo "Deploying..."
DIR="$HOME/dotfiles"

ln -sf "$DIR/.config/hypr" "$HOME/.config/hypr"
ln -sf "$DIR/.config/waybar" "$HOME/.config/waybar"`}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200 mb-2 font-mono">push.sh</h3>
                <pre className="p-4 bg-black/80 border border-white/10 rounded-xl text-neutral-400 font-mono text-xs overflow-x-auto shadow-inner leading-loose">
{`#!/bin/bash
git add .
git commit -m "Auto update: $(date)"
git push origin main
echo "All pushed, Heisenberg style"`}
                </pre>
              </div>
            </div>
          </div>
        </MagicCard>

      </div>
    </div>
  );
};

export default Dotfiles;
