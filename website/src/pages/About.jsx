import { ArrowUpRight, Code2, MonitorOff, Palette, Server, Wrench } from "lucide-react";
import hyprlandImg from "../../../assets/hyprland-redacted.jpg";

const chapters = [
  {
    icon: Palette,
    number: "01",
    title: "First, it was my Linux playground.",
    body: "I installed Arch because I liked knowing what made the system work, then built a Hyprland desktop around the way I actually use a computer. Pywal carried wallpaper colors across the system. Waybar, Kitty, Zsh, Wofi, Hyprlock, and CAVA were all tuned and versioned in my dotfiles instead of being one-off tweaks I could never reproduce.",
  },
  {
    icon: MonitorOff,
    number: "02",
    title: "Then the display stopped being dependable.",
    body: "The laptop still worked, but using it meant relying on an external HDMI display. Disconnecting that display could interrupt the graphical session and, for a machine I wanted to reach remotely, that was the wrong dependency. The useful computer was still there; only the usual way of using it had failed.",
  },
  {
    icon: Wrench,
    number: "03",
    title: "So I removed the screen from the equation.",
    body: "I configured closed-lid operation, moved administration to SSH, connected my devices through Tailscale, and made the machine useful without a local display. Samba gave it a practical storage job. Systemd and Docker made its services restartable and easier to reason about.",
  },
  {
    icon: Server,
    number: "04",
    title: "Now it explains itself.",
    body: "Cloudflare Tunnel publishes this site without exposing my home IP or forwarding router ports. GitHub Actions deploys updates over the private network. The result is deliberately modest: an old laptop, still running the Arch setup I care about, now doing quiet infrastructure work instead of becoming e-waste.",
  },
];

const About = () => (
  <div className="site-page about-page">
    <header className="about-hero page-width">
      <div className="eyebrow">about this machine and the person who kept it</div>
      <h1>I like computers most when I can understand and reshape them.</h1>
      <p>
        This project is a small story about Linux, customization, broken hardware, and refusing to treat a dead display as a dead computer.
      </p>
    </header>

    <section className="page-width about-image">
      <img src={hyprlandImg} alt="Privacy-redacted capture of Tanmay's customized Arch Linux and Hyprland desktop" />
      <div><span>BEFORE THE SERVER</span><p>The Hyprland desktop that taught me to treat the operating system as something I could shape, not just use.</p></div>
    </section>

    <section className="page-width about-story">
      <aside>
        <span className="section-index">THE SHORT VERSION</span>
        <blockquote>“The display died. The machine got a new job.”</blockquote>
        <p>I did not set out to build a miniature datacenter. I wanted to keep a computer I liked useful, then learned the networking and operations needed to do that properly.</p>
      </aside>
      <div className="about-chapters">
        {chapters.map(({ icon: Icon, number, title, body }) => (
          <article key={number}>
            <div><span>{number}</span><Icon size={20} strokeWidth={1.5} /></div>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="page-width about-links">
      <div>
        <span className="section-index">THE DESKTOP</span>
        <h2>The customization is still part of the story.</h2>
        <p>The public dotfiles include the Hyprland configuration, Zsh setup, Pywal integration, CAVA shaders, helper scripts, keybindings, and a reproducible symlink-based deployment.</p>
        <a href="https://github.com/tanmayhutt/hyprland-dotfiles" target="_blank" rel="noreferrer" className="text-link"><Code2 size={15} /> Explore the dotfiles <ArrowUpRight size={14} /></a>
      </div>
      <div>
        <span className="section-index">THE SERVER</span>
        <h2>The new job is documented too.</h2>
        <p>The server repository contains the Compose workload, deployment automation, security boundaries, and this website.</p>
        <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer" className="text-link"><Code2 size={15} /> Explore the server <ArrowUpRight size={14} /></a>
      </div>
    </section>
  </div>
);

export default About;
