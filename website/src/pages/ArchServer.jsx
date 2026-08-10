const ArchServer = () => {
  return (
    <div className="animate-fade-in">

      {/* ── Header ───────────────────────────────────────── */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge arch">module: arch-server</span>
            <h1 style={{ marginTop: '1rem' }}>SERVER_ARCHITECTURE</h1>
            <p style={{ marginBottom: 0 }}>Subsystem breakdown: networking, storage, remote access, telemetry.</p>
          </div>
          <a
            href="https://github.com/tanmayhutt/arch-server"
            target="_blank"
            rel="noopener noreferrer"
            className="badge"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.82rem' }}
          >
            [view_source_code]
          </a>
        </div>
      </header>

      {/* ── Net Topology ─────────────────────────────────── */}
      <div className="server-panel delay-100">
        <h2>/net_topology</h2>
        <p>
          Zero open ports on the physical router. All inbound access is brokered via outbound-only
          encrypted tunnels. Three independent access paths are provisioned.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          {/* Tailscale */}
          <div style={{ padding: '1rem', borderLeft: '2px solid var(--accent-blue)', background: 'rgba(59,130,246,0.05)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ margin: '0 0 0.4rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Tailscale
            </p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem' }}>WireGuard mesh VPN. Trusted devices only.</p>
            <pre style={{ margin: 0, fontSize: '0.78rem' }}><code>ssh user@&lt;tailscale-ip&gt;</code></pre>
          </div>

          {/* Cloudflare SSH */}
          <div style={{ padding: '1rem', borderLeft: '2px solid var(--accent-orange)', background: 'rgba(243,128,32,0.05)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ margin: '0 0 0.4rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Cloudflare Access SSH
            </p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem' }}>SSH over HTTPS. Email OTP + SSH key. Any device.</p>
            <pre style={{ margin: 0, fontSize: '0.78rem' }}><code>ssh ssh.tanmaytiwari.me</code></pre>
          </div>

          {/* Browser SSH */}
          <div style={{ padding: '1rem', borderLeft: '2px solid var(--accent-purple)', background: 'rgba(139,92,246,0.05)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ margin: '0 0 0.4rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Browser SSH
            </p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem' }}>Full terminal in the browser. Zero installs required.</p>
            <pre style={{ margin: 0, fontSize: '0.78rem' }}><code>https://ssh.tanmaytiwari.me</code></pre>
          </div>
        </div>
      </div>

      {/* ── Remote Access ─────────────────────────────────── */}
      <div className="server-panel delay-150">
        <h2>/remote_access</h2>
        <p>
          SSH is accessible from any device worldwide via Cloudflare Access — no Tailscale,
          no open ports, no client software needed.
        </p>

        {/* Access Method 2: cloudflared CLI */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--accent-orange)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Method A — Native SSH (requires cloudflared CLI)
          </p>
          <div style={{ padding: '1rem', borderLeft: '2px solid var(--accent-orange)', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
            <p style={{ margin: 0 }}>1. Run: <code>ssh ssh.tanmaytiwari.me</code></p>
            <p style={{ margin: 0 }}>2. Browser opens → Cloudflare Access identity check</p>
            <p style={{ margin: 0 }}>3. One-time PIN sent to owner email</p>
            <p style={{ margin: 0 }}>4. Token valid for 24h — next connections are instant</p>
            <p style={{ margin: 0 }}>5. Shell access granted. No Tailscale. No open ports.</p>
          </div>
        </div>

        {/* Access Method 3: Browser */}
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Method B — Browser Terminal (zero installs)
          </p>
          <div style={{ padding: '1rem', borderLeft: '2px solid var(--accent-purple)', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
            <p style={{ margin: 0 }}>1. Open: <code><a href="https://ssh.tanmaytiwari.me" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)' }}>https://ssh.tanmaytiwari.me</a></code></p>
            <p style={{ margin: 0 }}>2. Cloudflare Access → enter email → receive OTP</p>
            <p style={{ margin: 0 }}>3. Full terminal renders in the browser tab</p>
            <p style={{ margin: 0 }}>4. Enter server username → shell access granted</p>
            <p style={{ margin: 0 }}>5. Works on any device: phone, tablet, library PC.</p>
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500 }}></th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: 'var(--accent-blue)' }}>Tailscale</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: 'var(--accent-orange)' }}>CF Access SSH</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: 'var(--accent-purple)' }}>Browser SSH</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Needs Tailscale', '✅', '❌', '❌'],
                ['Works any device', '❌', '✅', '✅'],
                ['Zero installs', '❌', '❌', '✅'],
                ['Zero open ports', '✅', '✅', '✅'],
                ['Auth mechanism', 'Device trust', 'OTP + key', 'OTP'],
                ['Audit logs', '❌', '✅', '✅'],
              ].map(([label, ...vals]) => (
                <tr key={label} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: 'var(--text-primary)' }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Storage ──────────────────────────────────────── */}
      <div className="server-panel delay-200">
        <h2>/storage_subsystem</h2>
        <p>
          Server Message Block (SMB) via Samba. Cross-platform file operations across the Tailscale mesh.
          SMB daemon listens exclusively on the Tailscale interface — inaccessible from the public internet.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            ['macOS / iOS', 'smb://<tailscale-ip>'],
            ['Windows', '\\\\<tailscale-ip>'],
          ].map(([os, uri]) => (
            <div key={os} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{os}</p>
              <code style={{ fontSize: '0.82rem' }}>{uri}</code>
            </div>
          ))}
        </div>
        <pre><code>{`[ShareName]
   path = /home/<username>
   browsable = yes
   writable = yes`}</code></pre>
      </div>

      {/* ── Admin Tools + Scripts ─────────────────────────── */}
      <div className="grid-2 delay-300">
        <div className="server-panel">
          <h3>/admin_tools</h3>
          <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            <li>— <strong style={{ color: 'var(--text-primary)' }}>wlctl</strong>: WLAN provisioning TUI</li>
            <li>— <strong style={{ color: 'var(--text-primary)' }}>yazi</strong>: Async TUI file manager</li>
            <li>— <strong style={{ color: 'var(--text-primary)' }}>KDE Connect</strong>: Telemetry &amp; payload drop</li>
          </ul>
        </div>

        <div className="server-panel">
          <h3>/utility_scripts</h3>
          <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            <li>— <code>battery.sh</code> (Power)</li>
            <li>— <code>network-status.sh</code> (WLAN state)</li>
            <li>— <code>whatsong.sh</code> (Media state)</li>
            <li>— <code>whoami.sh</code> (Session identity)</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default ArchServer;
