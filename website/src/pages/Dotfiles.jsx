import { ArrowUpRight, Code2, Gauge, Keyboard, Monitor, Settings2, Terminal } from "lucide-react";
import hyprlandImg from "../../../assets/hyprland.png";

const desktopLayers = [
  ["01", "Hyprland", "Wayland compositor", "Dynamic tiling with 10 px inner gaps, 15 px outer gaps, and 20 px rounding"],
  ["02", "Waybar", "System surface", "Workspaces and status modules inherit the active Pywal palette"],
  ["03", "Zsh + Kitty", "Terminal layer", "Oh My Zsh, autosuggestions, syntax highlighting, z, sudo, and a Jesse Pinkman hello"],
  ["04", "Pywal", "Theme generator", "Wallpaper colors are exported and reloaded across the session from the terminal"],
  ["05", "Wofi", "Application launcher", "A frosted keyboard-first launcher whose prompt is simply: Yo, search it!"],
  ["06", "CAVA", "Audio visualizer", "Custom eye_of_phi, northern_lights, and Winamp-line GLSL shaders"],
  ["07", "Yazi", "File operations", "Keyboard-first file work with image previews, locally or through a remote shell"],
  ["08", "KDE Connect", "Device bridge", "Quick file transfer and phone integration without making it a server dependency"],
  ["09", "Hyprlock", "Local security", "Time, date, battery, network state, and a profile image on the lock screen"],
];

const bindings = [
  ["Terminal", "Super + T", "kitty"],
  ["Application launcher", "Super + A", "wofi --show drun"],
  ["File manager", "Super + E", "thunar"],
  ["Close window", "Super + Q", "killactive"],
  ["Lock session", "Super + L", "hyprlock"],
  ["Screenshot", "Print", "grim"],
];

const Dotfiles = () => (
  <div className="site-page detail-page desktop-page">
    <header className="page-header page-width">
      <div className="eyebrow">desktop layer / retained locally</div>
      <div className="page-header-grid">
        <h1>A desktop when the node needs one.</h1>
        <div className="header-side">
          <p>The server operates headlessly, but I kept its original Hyprland environment as a local maintenance, recovery, and configuration surface.</p>
          <a href="https://github.com/tanmayhutt/hyprland-dotfiles" target="_blank" rel="noreferrer" className="text-link">
            <Code2 size={15} /> Inspect dotfiles <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </header>

    <section className="page-width desktop-evidence">
      <div className="panel-chrome"><span>LOCAL DISPLAY CAPTURE</span><span>hyprland.session</span></div>
      <div className="desktop-image-wrap"><img src={hyprlandImg} alt="Hyprland desktop retained on the Arch Linux machine" /></div>
      <div className="desktop-caption"><span>DISPLAY STACK / WAYLAND</span><p>Original local session captured at full resolution. The graphical environment is not part of the public serving path.</p></div>
    </section>

    <section className="section-block page-width">
      <div className="section-heading">
        <div><span className="section-index">01 / LAYERS</span><h2>Purposeful local tooling.</h2></div>
        <p>The desktop remains useful for direct recovery, hardware access, and configuration work without defining the server’s runtime.</p>
      </div>
      <div className="desktop-layer-grid">
        {desktopLayers.map(([index, title, label, detail]) => (
          <article key={index}><span>{index}</span><div><h3>{title}</h3><small>{label}</small><p>{detail}</p></div></article>
        ))}
      </div>
    </section>

    <section className="section-block page-width desktop-operations">
      <div className="binding-panel">
        <div className="panel-chrome"><span>KEYBOARD CONTROL SURFACE</span><Keyboard size={13} /></div>
        <div className="binding-table">
          {bindings.map(([action, binding, command]) => (
            <div key={action}><strong>{action}</strong><code>{binding}</code><span>{command}</span></div>
          ))}
        </div>
      </div>
      <div className="automation-panel">
        <span className="section-index">02 / CONFIGURATION</span>
        <h2>Versioned and repeatable.</h2>
        <p>Configuration is kept in Git and linked into the active user environment. The repository remains the recoverable source, not a collection of untracked local edits.</p>
        <div className="automation-lines">
          <div><Settings2 size={17} /><span><small>DEPLOY</small><code>./deploy.sh</code></span></div>
          <div><Terminal size={17} /><span><small>SYNC</small><code>git push origin main</code></span></div>
          <div><Monitor size={17} /><span><small>TARGET</small><code>~/.config</code></span></div>
          <div><Gauge size={17} /><span><small>POWER PROFILE</small><code>./power-toggle.sh</code></span></div>
        </div>
      </div>
    </section>

    <section className="page-width dotfile-footnote">
      <p><strong>The setup survives because it is versioned.</strong> <code>deploy.sh</code> recreates the configuration with symlinks, <code>push.sh</code> wraps the small Git sync ritual, and <code>power-toggle.sh</code> cycles performance, balanced, and power-saver modes. The public repository contains the exact files rather than a screenshot-only “rice”.</p>
      <a href="https://github.com/tanmayhutt/hyprland-dotfiles" target="_blank" rel="noreferrer" className="text-link">Read the actual dotfiles <ArrowUpRight size={14} /></a>
    </section>
  </div>
);

export default Dotfiles;
