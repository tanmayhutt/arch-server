const Dotfiles = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge">module: hyprland-dotfiles</span>
        <h1 style={{ marginTop: '1rem' }}>DESKTOP_ENVIRONMENT</h1>
        <p>[WARN] Compositor dormant. Configurations retained for deployment.</p>
      </div>

      <div className="grid-2 delay-100">
        <div className="server-panel">
          <h2>/wayland_stack</h2>
          <p>
            Graphical stack built around <strong>Hyprland</strong>, a dynamic tiling Wayland compositor. Headless execution active. UI available upon physical access.
          </p>
        </div>

        <div className="server-panel delay-200">
          <h2>/core_components</h2>
          <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>- <strong>Waybar:</strong> Status bar</li>
            <li>- <strong>Wofi:</strong> App launcher</li>
            <li>- <strong>Kitty:</strong> GPU-accel terminal</li>
            <li>- <strong>Cava:</strong> Audio visualizer</li>
            <li>- <strong>Hyprlock:</strong> Screen lock</li>
          </ul>
        </div>
      </div>

      <div className="server-panel delay-300" style={{ marginTop: '1rem' }}>
        <h2>/deployment_automation</h2>
        <p>
          [EXEC] Configuration deployment handled by automated bash orchestration via symlink injection to `.config`.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>deploy.sh</h3>
            <pre>
              <code>
{`#!/bin/bash
echo "Deploying..."
DIR="$HOME/dotfiles"

ln -sf "$DIR/.config/hypr" "$HOME/.config/hypr"
ln -sf "$DIR/.config/waybar" "$HOME/.config/waybar"`}
              </code>
            </pre>
          </div>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>push.sh</h3>
            <pre>
              <code>
{`#!/bin/bash
git add .
git commit -m "push.sh"
git push origin main
echo "Pushed!"`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dotfiles;
