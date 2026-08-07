const ArchServer = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="badge arch">module: arch-server</span>
            <h1 style={{ marginTop: '1rem' }}>SERVER_ARCHITECTURE</h1>
            <p>[INFO] Subsystem breakdown: networking, storage, telemetry.</p>
          </div>
          <a
            href="https://github.com/tanmayhutt/arch-server"
            target="_blank"
            rel="noopener noreferrer"
            className="badge"
            style={{
              textDecoration: 'none',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            [view_source_code]
          </a>
        </div>
      </header>

      <div className="server-panel delay-100">
        <h2>/net_topology</h2>
        <p>
          [SECURE] Zero open ports on the physical router. All inbound access is brokered via
          outbound-only tunnels. Two independent access paths are provisioned.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderLeft: '2px solid var(--accent-secondary)',
              backgroundColor: 'rgba(88,166,255,0.04)',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Tailscale (Trusted Devices)
            </p>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              WireGuard mesh VPN. Requires Tailscale installed and authenticated.
            </p>
            <pre style={{ margin: 0, fontSize: '0.8rem' }}>
              <code>ssh user@&lt;tailscale-ip&gt;</code>
            </pre>
          </div>
          <div
            style={{
              padding: '1rem',
              borderLeft: '2px solid #f38020',
              backgroundColor: 'rgba(243,128,32,0.04)',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Cloudflare Access SSH (Any Device)
            </p>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              SSH over HTTPS via Cloudflare tunnel. Email OTP + SSH key required. No Tailscale needed.
            </p>
            <pre style={{ margin: 0, fontSize: '0.8rem' }}>
              <code>ssh ssh.tanmaytiwari.me</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="server-panel delay-150">
        <h2>/remote_access</h2>
        <p>
          [GLOBAL] SSH is accessible from any device worldwide via Cloudflare Access. Traffic is routed
          through the existing Zero Trust tunnel — no additional open ports required.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Connection flow:
          </p>
          <div
            style={{
              padding: '1rem',
              borderLeft: '2px solid #f38020',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              lineHeight: '2',
            }}
          >
            <p style={{ margin: 0 }}>1. Run: <code>ssh ssh.tanmaytiwari.me</code></p>
            <p style={{ margin: 0 }}>2. Browser opens → Cloudflare Access identity check</p>
            <p style={{ margin: 0 }}>3. One-time PIN sent to owner email</p>
            <p style={{ margin: 0 }}>4. Short-lived SSH certificate issued (~8h)</p>
            <p style={{ margin: 0 }}>5. Shell access granted. No Tailscale, no open ports.</p>
          </div>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Client prerequisite: <code>cloudflared</code> CLI + SSH key pair.
          See <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>README</a> for full setup instructions.
        </p>
      </div>

      <div className="server-panel delay-200">
        <h2>/storage_subsystem</h2>
        <p>
          [MOUNTED] Server Message Block (SMB) protocol via Samba. Cross-platform file operations
          across mesh network.
        </p>
        <div
          style={{
            padding: '1rem',
            borderLeft: '2px solid var(--accent-secondary)',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ margin: 0 }}>&gt; macOS / iOS: smb://&lt;tailscale-ip&gt;</p>
          <p style={{ margin: 0 }}>&gt; Windows: \\&lt;tailscale-ip&gt;</p>
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
        <div className="server-panel">
          <h3>/admin_tools</h3>
          <ul
            style={{
              listStyle: 'none',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}
          >
            <li>
              - <strong>wlctl:</strong> WLAN provisioning TUI
            </li>
            <li>
              - <strong>yazi:</strong> Async TUI file manager
            </li>
            <li>
              - <strong>KDE Connect:</strong> Telemetry & payload drop
            </li>
          </ul>
        </div>

        <div className="server-panel">
          <h3>/utility_scripts</h3>
          <ul
            style={{
              listStyle: 'none',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}
          >
            <li>
              - <code>battery.sh</code> (Power)
            </li>
            <li>
              - <code>network-status.sh</code> (WLAN state)
            </li>
            <li>
              - <code>whatsong.sh</code> (Media state)
            </li>
            <li>
              - <code>whoami.sh</code> (Session identity)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArchServer;
