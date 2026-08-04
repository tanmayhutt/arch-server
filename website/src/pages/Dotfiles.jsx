import hyprlandImg from '../../../assets/hyprland.png';

const Dotfiles = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <span className="badge">module: hyprland-dotfiles</span>
        <h1 style={{ marginTop: '1rem' }}>DESKTOP_ENVIRONMENT</h1>
        <p>
          High-performance Hyprland and Zsh configuration, tuned for Arch Linux. Built for speed,
          aesthetics, and a powerful, keyboard-driven workflow.
        </p>
      </header>

      <div className="terminal-image-container delay-100" style={{ marginBottom: '2.5rem' }}>
        <img src={hyprlandImg} alt="Hyprland Desktop Environment Showcase" />
      </div>

      <div className="server-panel delay-200">
        <h2>/features_and_highlights</h2>
        <p>This configuration is built for a clean and efficient Linux experience.</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem',
          }}
        >
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Window Manager</h3>
            <p style={{ fontSize: '0.85rem' }}>
              <strong>Hyprland</strong> with dynamic tiling, 10px inner gaps, 15px outer gaps, and
              20px window rounding.
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Aesthetics</h3>
            <p style={{ fontSize: '0.85rem' }}>
              System-wide theming via <strong>Pywal</strong>, with automatic reload on terminal
              startup.
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Terminal</h3>
            <p style={{ fontSize: '0.85rem' }}>
              <strong>Kitty</strong>. GPU-accelerated. Uses a custom color scheme and displays
              system info using neofetch on launch.
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Shell</h3>
            <p style={{ fontSize: '0.85rem' }}>
              <strong>Zsh</strong> powered by Oh My Zsh, with zsh-autosuggestions,
              syntax-highlighting, and a Heisenberg-inspired welcome quote.
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Visualizer</h3>
            <p style={{ fontSize: '0.85rem' }}>
              <strong>CAVA</strong> configured with custom shaders (eye_of_phi, northern_lights,
              winamp_line_style_spectrum).
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>App Launcher</h3>
            <p style={{ fontSize: '0.85rem' }}>
              <strong>Wofi</strong> styled as a transparent dark window with frosted glass blur and
              shadow.
            </p>
          </div>
        </div>
      </div>

      <div className="server-panel delay-300">
        <h2>/key_bindings</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
            fontSize: '0.9rem',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Action</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Key Binding</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #1f242e' }}>
              <td style={{ padding: '0.75rem' }}>Terminal</td>
              <td style={{ padding: '0.75rem' }}>
                <code>Super + T</code>
              </td>
              <td style={{ padding: '0.75rem' }}>kitty</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1f242e' }}>
              <td style={{ padding: '0.75rem' }}>App Launcher</td>
              <td style={{ padding: '0.75rem' }}>
                <code>Super + A</code>
              </td>
              <td style={{ padding: '0.75rem' }}>wofi --show drun</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1f242e' }}>
              <td style={{ padding: '0.75rem' }}>File Manager</td>
              <td style={{ padding: '0.75rem' }}>
                <code>Super + E</code>
              </td>
              <td style={{ padding: '0.75rem' }}>thunar</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1f242e' }}>
              <td style={{ padding: '0.75rem' }}>Browser</td>
              <td style={{ padding: '0.75rem' }}>
                <code>Super + B</code>
              </td>
              <td style={{ padding: '0.75rem' }}>brave</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1f242e' }}>
              <td style={{ padding: '0.75rem' }}>Kill Window</td>
              <td style={{ padding: '0.75rem' }}>
                <code>Super + Q</code>
              </td>
              <td style={{ padding: '0.75rem' }}>killactive</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1f242e' }}>
              <td style={{ padding: '0.75rem' }}>Lock Screen</td>
              <td style={{ padding: '0.75rem' }}>
                <code>Super + L</code>
              </td>
              <td style={{ padding: '0.75rem' }}>hyprlock</td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem' }}>Full Screenshot</td>
              <td style={{ padding: '0.75rem' }}>
                <code>Print</code>
              </td>
              <td style={{ padding: '0.75rem' }}>grim</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="server-panel delay-400">
        <h2>/deployment_automation</h2>
        <p>
          Configuration deployment is handled by automated bash orchestration via symlink injection
          to <code>~/.config</code>.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '1.5rem',
          }}
        >
          <div>
            <h3
              style={{
                marginBottom: '0.5rem',
                textTransform: 'none',
                color: 'var(--text-primary)',
              }}
            >
              deploy.sh
            </h3>
            <pre>
              <code>{`#!/bin/bash
echo "Deploying..."
DIR="$HOME/dotfiles"

ln -sf "$DIR/.config/hypr" "$HOME/.config/hypr"
ln -sf "$DIR/.config/waybar" "$HOME/.config/waybar"`}</code>
            </pre>
          </div>
          <div>
            <h3
              style={{
                marginBottom: '0.5rem',
                textTransform: 'none',
                color: 'var(--text-primary)',
              }}
            >
              push.sh
            </h3>
            <pre>
              <code>{`#!/bin/bash
git add .
git commit -m "Auto update: $(date)"
git push origin main
echo "All pushed, Heisenberg style"`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dotfiles;
