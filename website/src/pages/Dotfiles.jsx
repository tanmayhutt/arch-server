import { Monitor, Cpu, Layers } from 'lucide-react';

const Dotfiles = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <span className="badge">hyprland-dotfiles</span>
        <h1 style={{ marginTop: '1rem' }}>Desktop Environment</h1>
        <p style={{ fontSize: '1.2rem' }}>The dormant Wayland compositor configuration retained on the headless server.</p>
      </div>

      <div className="grid-2 delay-100">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={24} color="#1793d1" />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Wayland Compositor</h2>
          </div>
          <p>
            The graphical stack is built around <strong>Hyprland</strong>, a highly customizable dynamic tiling Wayland compositor. Although the server operates headlessly, these configurations allow it to instantly deploy a full desktop environment if physical access is restored.
          </p>
        </div>

        <div className="glass-panel delay-200">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Monitor size={24} color="#f0f0f5" />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Core UI Components</h2>
          </div>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Waybar:</strong> Highly customizable status bar</li>
            <li><strong>Wofi:</strong> Application launcher and menu</li>
            <li><strong>Kitty:</strong> GPU-accelerated terminal emulator</li>
            <li><strong>Cava:</strong> Audio visualizer</li>
            <li><strong>Hyprlock:</strong> Screen locking utility</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel delay-300" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Cpu size={24} color="#ff3366" />
          <h2 style={{ margin: 0 }}>Deployment Automation</h2>
        </div>
        <p>
          Configuration deployment is handled by automated bash orchestration. The setup relies on a symlink architecture to inject dotfiles directly into the `.config` directory.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>deploy.sh</h4>
            <pre style={{ fontSize: '0.8rem', padding: '0.8rem' }}>
              <code>
{`#!/bin/bash
echo "Deploying the rice..."
DOTFILES_DIR="$HOME/dotfiles"

ln -sf "$DOTFILES_DIR/.config/hypr" "$HOME/.config/hypr"
ln -sf "$DOTFILES_DIR/.config/waybar" "$HOME/.config/waybar"
# ...`}
              </code>
            </pre>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>push.sh</h4>
            <pre style={{ fontSize: '0.8rem', padding: '0.8rem' }}>
              <code>
{`#!/bin/bash
git add .
git commit -m "update via push.sh"
git push origin main
echo "Successfully pushed!"`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dotfiles;
