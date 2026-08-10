import { ArrowUpRight, Code2, Keyboard, Monitor, Settings2, Terminal } from "lucide-react";
import hyprlandImg from "../../../assets/hyprland.png";

const desktopLayers = [
  ["01", "Hyprland", "Wayland compositor", "Tiling, animations, workspace control"],
  ["02", "Waybar", "System surface", "Workspaces, telemetry, media state"],
  ["03", "Zsh + Kitty", "Terminal layer", "Fast shell workflow and remote administration"],
  ["04", "Yazi", "File operations", "Keyboard-first local and remote file management"],
  ["05", "KDE Connect", "Device bridge", "Payload transfer and phone integration"],
  ["06", "Hyprlock", "Local security", "Session locking when the display stack is active"],
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
      <div className="eyebrow"><span className="live-dot dormant-dot" /> desktop layer / retained</div>
      <div className="page-header-grid">
        <h1>A desktop when the node needs one.</h1>
        <div className="header-side">
          <p>The server operates headlessly, but its original Hyprland environment remains a deliberate local maintenance and recovery surface.</p>
          <a href="https://github.com/tanmayhutt/hyprland-dotfiles" target="_blank" rel="noreferrer" className="text-link">
            <Code2 size={15} /> Inspect dotfiles <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </header>

    <section className="page-width desktop-evidence">
      <div className="panel-chrome"><span>LOCAL DISPLAY CAPTURE</span><span>hyprland.session</span></div>
      <div className="desktop-image-wrap"><img src={hyprlandImg} alt="Hyprland desktop running on the Arch Linux machine" /></div>
      <div className="desktop-caption"><span>DISPLAY STACK / WAYLAND</span><p>The graphical environment is supporting infrastructure, not part of the public serving path.</p></div>
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
        </div>
      </div>
    </section>
  </div>
);

export default Dotfiles;
