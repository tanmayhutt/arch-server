import { Terminal, Shield, FolderGit2, HardDrive } from 'lucide-react';

const ArchServer = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <span className="badge arch">arch-server</span>
        <h1 style={{ marginTop: '1rem' }}>Server Node Architecture</h1>
        <p style={{ fontSize: '1.2rem' }}>Detailed breakdown of the networking, storage, and telemetry subsystems.</p>
      </div>

      <div className="glass-panel delay-100" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Shield size={24} color="#00ffcc" />
          <h2 style={{ margin: 0 }}>Network Topology & Remote Access</h2>
        </div>
        <p>
          Administrative access is brokered exclusively via <strong>SSH over Tailscale</strong>. This design provides several critical security advantages, including zero ingress ports, NAT traversal, and end-to-end encryption.
        </p>
        <pre>
          <code>ssh user@&lt;tailscale-ip&gt;</code>
        </pre>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          <em>The server operates with zero exposure to the public internet. Access is strictly confined to the Tailscale mesh.</em>
        </p>
      </div>

      <div className="glass-panel delay-200" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <HardDrive size={24} color="#ff6600" />
          <h2 style={{ margin: 0 }}>Storage Subsystem (Samba NAS)</h2>
        </div>
        <p>
          The primary storage interface is implemented using the Server Message Block (SMB) protocol via Samba, facilitating seamless cross-platform file operations across the mesh network.
        </p>
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Client Integration</h4>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
            <li><strong>macOS / iOS:</strong> <code>smb://&lt;tailscale-ip&gt;</code></li>
            <li><strong>Windows:</strong> <code>\\&lt;tailscale-ip&gt;</code></li>
          </ul>
        </div>
        <pre>
          <code>
{`[global]
   workgroup = WORKGROUP
   server string = Lenovo NAS Node
   security = user
   map to guest = bad user
   dns proxy = no

[ShareName]
   path = /home/<username>
   browsable = yes
   writable = yes`}
          </code>
        </pre>
      </div>

      <div className="grid-2 delay-300">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Terminal size={20} />
            <h3 style={{ margin: 0 }}>Administrative Tools</h3>
          </div>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><strong>wlctl:</strong> Wireless network provisioning TUI built for NetworkManager.</li>
            <li><strong>yazi:</strong> Asynchronous TUI file manager with advanced preview capabilities.</li>
            <li><strong>KDE Connect:</strong> Background telemetry for clipboard synchronization and payload deployment.</li>
          </ul>
        </div>
        
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FolderGit2 size={20} />
            <h3 style={{ margin: 0 }}>Utility Scripts</h3>
          </div>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><code>battery.sh</code> - Raw power telemetry</li>
            <li><code>network-status.sh</code> - Active WLAN state</li>
            <li><code>whatsong.sh</code> - Media playback state</li>
            <li><code>whoami.sh</code> - Session identity verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArchServer;
