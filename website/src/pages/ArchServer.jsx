const ArchServer = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge arch">module: arch-server</span>
        <h1 style={{ marginTop: '1rem' }}>SERVER_ARCHITECTURE</h1>
        <p>[INFO] Subsystem breakdown: networking, storage, telemetry.</p>
      </div>

      <div className="server-panel delay-100">
        <h2>/net_topology</h2>
        <p>
          [SECURE] Administrative access brokered exclusively via SSH over Tailscale. Zero ingress
          ports. NAT traversal active.
        </p>
        <pre>
          <code>ssh user@&lt;tailscale-ip&gt;</code>
        </pre>
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
