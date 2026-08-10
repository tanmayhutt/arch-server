import { useMemo, useRef, useState } from "react";

const InfrastructureMap = () => {
  const mapRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const paths = useMemo(() => {
    const bendX = pointer.x * 22;
    const bendY = pointer.y * 18;
    return {
      publicA: `M 92 112 C ${185 + bendX} ${58 + bendY}, ${238 + bendX} ${58 + bendY}, 330 112`,
      publicB: `M 430 112 C ${515 + bendX} ${76 + bendY}, ${566 + bendX} ${76 + bendY}, 646 112`,
      publicC: `M 746 112 C ${824 + bendX} ${112 + bendY}, ${835 + bendX} ${200 + bendY}, 866 246`,
      privateA: `M 92 386 C ${188 - bendX} ${442 - bendY}, ${245 - bendX} ${442 - bendY}, 330 386`,
      privateB: `M 430 386 C ${595 - bendX} ${386 - bendY}, ${706 - bendX} ${346 - bendY}, 866 275`,
      deploy: `M 378 250 C ${450 + bendX} ${302 + bendY}, ${540 + bendX} ${326 + bendY}, 646 386`,
      deployB: `M 746 386 C ${810 - bendX} ${374 - bendY}, ${840 - bendX} ${324 - bendY}, 866 282`,
    };
  }, [pointer]);

  const handlePointerMove = (event) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  return (
    <div
      ref={mapRef}
      className="infrastructure-map"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <svg viewBox="0 0 1000 500" role="img" aria-labelledby="map-title map-description">
        <title id="map-title">Interactive arch-server network architecture</title>
        <desc id="map-description">
          Public traffic passes through Cloudflare and an outbound tunnel. Private administration passes through Tailscale. Both terminate at the physical Arch Linux server.
        </desc>
        <defs>
          <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
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
          {Object.entries(paths).slice(0, 3).map(([key, path], index) => (
            <g key={key}>
              <path id={key} d={path} />
              <circle r="3" filter="url(#route-glow)">
                <animateMotion dur={`${2.8 + index * 0.45}s`} repeatCount="indefinite" path={path} />
              </circle>
            </g>
          ))}
        </g>

        <g className="route route-private">
          {[paths.privateA, paths.privateB].map((path, index) => (
            <g key={`private-${index}`}>
              <path d={path} />
              <circle r="3" filter="url(#route-glow)">
                <animateMotion dur={`${3.2 + index * 0.5}s`} repeatCount="indefinite" path={path} />
              </circle>
            </g>
          ))}
        </g>

        <g className="route route-deploy">
          {[paths.deploy, paths.deployB].map((path, index) => (
            <g key={`deploy-${index}`}>
              <path d={path} />
              <circle r="2.5"><animateMotion dur={`${3.6 + index * 0.4}s`} repeatCount="indefinite" path={path} /></circle>
            </g>
          ))}
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
          <text x="14" y="25">COMPOSE</text><text x="14" y="43" className="map-node-detail">rebuild stack</text>
        </g>

        <g className="host-node" transform="translate(850 188)">
          <rect width="126" height="136" rx="12" fill="url(#host-fill)" />
          <circle cx="18" cy="20" r="4" />
          <text x="30" y="24" className="host-label">PHYSICAL NODE</text>
          <line x1="14" x2="112" y1="38" y2="38" />
          <text x="14" y="62">ARCH LINUX</text>
          <text x="14" y="82" className="map-node-detail">Docker / Nginx</text>
          <text x="14" y="99" className="map-node-detail">SSH / Samba</text>
          <text x="14" y="120" className="host-foot">HOME NETWORK</text>
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
};

export default InfrastructureMap;
