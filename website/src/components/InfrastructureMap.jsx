const paths = {
  publicA: "M 92 112 C 185 58, 238 58, 330 112",
  publicB: "M 430 112 C 515 76, 566 76, 646 112",
  publicC: "M 746 112 C 824 112, 835 200, 866 246",
  privateA: "M 92 386 C 188 442, 245 442, 330 386",
  privateB: "M 430 386 C 595 386, 706 346, 866 275",
  deploy: "M 378 280 C 382 314, 382 336, 380 356",
  deployB: "M 430 386 C 500 372, 572 372, 646 386",
  deployC: "M 746 386 C 810 374, 840 324, 866 282",
};

const InfrastructureMap = () => (
  <div className="infrastructure-map">
    <svg viewBox="0 0 1000 500" role="img" aria-labelledby="map-title map-description">
      <title id="map-title">Arch-server network architecture</title>
      <desc id="map-description">
        Public traffic passes through Cloudflare and an outbound tunnel. Private administration passes through Tailscale. Both terminate at the physical Arch Linux server.
      </desc>
      <defs>
        <linearGradient id="host-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12212a" />
          <stop offset="1" stopColor="#080d11" />
        </linearGradient>
      </defs>

      <g className="map-grid">
        {Array.from({ length: 11 }, (_, index) => <line key={`v-${index}`} x1={index * 100} x2={index * 100} y1="0" y2="500" />)}
        {Array.from({ length: 6 }, (_, index) => <line key={`h-${index}`} x1="0" x2="1000" y1={index * 100} y2={index * 100} />)}
      </g>

      <g className="route route-public">
        <path d={paths.publicA} />
        <path d={paths.publicB} />
        <path d={paths.publicC} />
      </g>
      <g className="route route-private">
        <path d={paths.privateA} />
        <path d={paths.privateB} />
      </g>
      <g className="route route-deploy">
        <path d={paths.deploy} />
        <path d={paths.deployB} />
        <path d={paths.deployC} />
      </g>

      <g className="map-node" transform="translate(42 82)">
        <rect width="100" height="60" rx="8" />
        <text x="14" y="25">PUBLIC</text><text x="14" y="43" className="map-node-detail">browser request</text>
      </g>
      <g className="map-node map-node-public" transform="translate(330 82)">
        <rect width="100" height="60" rx="8" />
        <text x="14" y="25">CLOUDFLARE</text><text x="14" y="43" className="map-node-detail">edge + TLS</text>
      </g>
      <g className="map-node map-node-public" transform="translate(646 82)">
        <rect width="100" height="60" rx="8" />
        <text x="14" y="25">TUNNEL</text><text x="14" y="43" className="map-node-detail">outbound only</text>
      </g>
      <g className="map-node" transform="translate(42 356)">
        <rect width="100" height="60" rx="8" />
        <text x="14" y="25">ADMIN</text><text x="14" y="43" className="map-node-detail">trusted device</text>
      </g>
      <g className="map-node map-node-private" transform="translate(330 356)">
        <rect width="100" height="60" rx="8" />
        <text x="14" y="25">TAILSCALE</text><text x="14" y="43" className="map-node-detail">WireGuard mesh</text>
      </g>
      <g className="map-node map-node-deploy" transform="translate(328 220)">
        <rect width="100" height="60" rx="8" />
        <text x="14" y="25">GITHUB</text><text x="14" y="43" className="map-node-detail">deploy runner</text>
      </g>
      <g className="map-node map-node-deploy" transform="translate(646 356)">
        <rect width="100" height="60" rx="8" />
        <text x="14" y="25">COMPOSE</text><text x="14" y="43" className="map-node-detail">SSH / rebuild</text>
      </g>

      <g className="host-node" transform="translate(850 188)">
        <rect width="126" height="136" rx="12" fill="url(#host-fill)" />
        <rect className="host-status-mark" x="14" y="16" width="8" height="8" rx="1" />
        <text x="30" y="24" className="host-label">PHYSICAL NODE</text>
        <line x1="14" x2="112" y1="38" y2="38" />
        <text x="14" y="62">ARCH LINUX</text>
        <text x="14" y="82" className="map-node-detail">Docker / Nginx</text>
        <text x="14" y="99" className="map-node-detail">SSH / Samba</text>
        <text x="14" y="120" className="host-foot">LENOVO IDEAPAD 3</text>
      </g>

      <text x="42" y="35" className="map-lane-label">PUBLIC DATA PLANE</text>
      <text x="42" y="476" className="map-lane-label">PRIVATE CONTROL PLANE</text>
      <text x="852" y="165" className="map-lane-label">ORIGIN</text>
    </svg>
    <div className="map-caption">
      <span><i className="legend-public" /> public ingress</span>
      <span><i className="legend-private" /> private administration</span>
      <span><i className="legend-deploy" /> deployment</span>
    </div>
  </div>
);

export default InfrastructureMap;
