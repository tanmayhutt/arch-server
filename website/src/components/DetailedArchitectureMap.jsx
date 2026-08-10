import { Minus, Move, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

const getTopologyScale = (availableWidth) => {
  const scale = Math.min(0.7, Math.max(0.18, (availableWidth - 28) / 1600));
  return Math.round(scale * 50) / 50;
};

const TopologyNode = ({ x, y, width = 180, title, detail, tone = "neutral" }) => (
  <g className={`topology-node topology-node-${tone}`} transform={`translate(${x} ${y})`}>
    <rect width={width} height="58" rx="9" />
    <circle cx="15" cy="16" r="3" />
    <text x="27" y="19" className="topology-node-title">{title}</text>
    <text x="15" y="40" className="topology-node-detail">{detail}</text>
  </g>
);

const DetailedArchitectureMap = () => {
  const containerRef = useRef(null);
  const [initialScale, setInitialScale] = useState(() => (
    getTopologyScale(typeof window === "undefined" ? 1180 : window.innerWidth)
  ));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const nextScale = getTopologyScale(entry.contentRect.width);
      setInitialScale((currentScale) => currentScale === nextScale ? currentScale : nextScale);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const minScale = Math.min(0.42, Math.max(0.15, initialScale - 0.04));

  return (
  <div className="detailed-topology" ref={containerRef}>
    <TransformWrapper
      key={initialScale}
      initialScale={initialScale}
      minScale={minScale}
      maxScale={2.4}
      centerOnInit
      wheel={{ step: 0.08 }}
      doubleClick={{ disabled: true }}
      limitToBounds={false}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          <div className="topology-toolbar">
            <div><Move size={13} /><span>DRAG TO PAN / SCROLL TO ZOOM</span></div>
            <div className="topology-controls" aria-label="Architecture zoom controls">
              <button type="button" onClick={() => zoomOut()} aria-label="Zoom architecture out"><Minus size={14} /></button>
              <button type="button" onClick={() => resetTransform()} aria-label="Reset architecture view"><RotateCcw size={13} /></button>
              <button type="button" onClick={() => zoomIn()} aria-label="Zoom architecture in"><Plus size={14} /></button>
            </div>
          </div>

          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "1600px", height: "860px" }}
          >
            <svg className="detailed-topology-canvas" viewBox="0 0 1600 860" role="img" aria-labelledby="detail-map-title detail-map-description">
              <title id="detail-map-title">Detailed arch-server trust and deployment architecture</title>
              <desc id="detail-map-description">
                A lossless topology showing public website delivery, identity-gated remote shell, private Tailscale administration, Samba storage, and the GitHub Actions deployment path into a physical Arch Linux node.
              </desc>
              <defs>
                <pattern id="detail-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(153,181,194,0.035)" strokeWidth="1" />
                </pattern>
                <marker id="arrow-public" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#8bd2ed" />
                </marker>
                <marker id="arrow-private" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#72c9a3" />
                </marker>
                <marker id="arrow-deploy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#e8a25a" />
                </marker>
                <marker id="arrow-storage" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#a7b8c0" />
                </marker>
              </defs>

              <rect width="1600" height="860" fill="url(#detail-grid)" />
              <rect className="topology-host-boundary" x="890" y="54" width="650" height="754" rx="18" />
              <text className="topology-boundary-label" x="912" y="82">PHYSICAL ORIGIN / LENOVO IDEAPAD / ARCH LINUX</text>
              <rect className="topology-inner-boundary topology-docker-boundary" x="910" y="96" width="610" height="126" rx="13" />
              <text className="topology-boundary-label" x="928" y="118">DOCKER BRIDGE / COMPOSE-MANAGED PUBLIC WORKLOAD</text>
              <rect className="topology-inner-boundary" x="910" y="250" width="610" height="382" rx="13" />
              <text className="topology-boundary-label" x="928" y="275">HOST OS / PRIVATE SERVICES + STORAGE</text>
              <rect className="topology-inner-boundary topology-deploy-boundary" x="910" y="657" width="610" height="126" rx="13" />
              <text className="topology-boundary-label" x="928" y="682">DEPLOYMENT TARGET / ~/SERVICES/ARCH-SERVER</text>

              <text className="topology-lane-label" x="58" y="92">01 / PUBLIC WEBSITE DELIVERY</text>
              <text className="topology-lane-label" x="58" y="252">02 / IDENTITY-GATED REMOTE SHELL</text>
              <text className="topology-lane-label" x="58" y="412">03 / PRIVATE ADMINISTRATION + STORAGE</text>
              <text className="topology-lane-label" x="58" y="690">04 / CONTINUOUS DELIVERY</text>

              <g className="topology-routes topology-routes-public">
                <path d="M 238 145 H 310" />
                <path d="M 510 145 H 580" />
                <path d="M 780 145 H 920" />
                <path d="M 1100 145 H 1135" />
                <path d="M 1305 145 H 1350" />
              </g>
              <g className="topology-routes topology-routes-public topology-routes-access">
                <path d="M 238 305 H 310" />
                <path d="M 510 305 H 580" />
                <path d="M 780 305 C 840 305, 850 145, 920 145" />
                <path d="M 1100 145 C 1120 230, 1100 350, 1140 449" />
              </g>
              <g className="topology-routes topology-routes-private">
                <path d="M 238 449 H 330" />
                <path d="M 530 449 H 920" />
                <path d="M 1100 449 H 1140" />
                <path d="M 1320 449 H 1350" />
                <path d="M 238 568 C 280 568, 294 492, 330 466" />
                <path d="M 1010 478 C 1030 530, 1080 568, 1140 568" />
              </g>
              <g className="topology-routes topology-routes-storage">
                <path d="M 1320 568 H 1350" />
              </g>
              <g className="topology-routes topology-routes-deploy">
                <path d="M 218 735 H 252" />
                <path d="M 442 735 H 482" />
                <path d="M 672 735 H 712" />
                <path d="M 872 735 H 930" />
                <path d="M 1110 735 H 1150" />
                <path d="M 1330 735 H 1360" />
                <path d="M 1240 706 C 1260 620, 1245 310, 1220 174" />
              </g>

              <TopologyNode x={58} y={116} title="VISITOR" detail="public HTTPS request" />
              <TopologyNode x={310} y={116} width={200} title="CLOUDFLARE EDGE" detail="DNS / TLS / filtering" tone="public" />
              <TopologyNode x={580} y={116} width={200} title="OUTBOUND TUNNEL" detail="accepted HTTP traffic" tone="public" />
              <TopologyNode x={920} y={116} title="CLOUDFLARED" detail="tunnel connector" tone="public" />
              <TopologyNode x={1135} y={116} width={170} title="NGINX" detail="static web server" tone="origin" />
              <TopologyNode x={1350} y={116} width={150} title="REACT" detail="Vite bundle" tone="origin" />

              <TopologyNode x={58} y={276} title="AUTHORIZED CLIENT" detail="browser or SSH client" />
              <TopologyNode x={310} y={276} width={200} title="CLOUDFLARE ACCESS" detail="identity policy" tone="public" />
              <TopologyNode x={580} y={276} width={200} title="TUNNEL ROUTE" detail="no router port" tone="public" />

              <TopologyNode x={58} y={420} title="OWNED DEVICE" detail="private administration" />
              <TopologyNode x={330} y={420} width={200} title="TAILSCALE MESH" detail="WireGuard peer path" tone="private" />
              <TopologyNode x={920} y={420} title="TAILSCALE0" detail="private host interface" tone="private" />
              <TopologyNode x={1140} y={420} title="OPENSSH" detail="origin authentication" tone="private" />
              <TopologyNode x={1350} y={420} width={150} title="SHELL" detail="admin session" tone="origin" />

              <TopologyNode x={58} y={539} title="NAS CLIENT" detail="macOS / mobile / PC" />
              <TopologyNode x={1140} y={539} title="SAMBA" detail="private SMB service" tone="private" />
              <TopologyNode x={1350} y={539} width={150} title="EXT4 SSD" detail="233 GiB storage" tone="origin" />

              <TopologyNode x={58} y={706} width={160} title="GIT PUSH" detail="website path change" tone="deploy" />
              <TopologyNode x={252} y={706} width={190} title="ACTIONS RUNNER" detail="ephemeral Ubuntu job" tone="deploy" />
              <TopologyNode x={482} y={706} width={190} title="TAILNET JOIN" detail="scoped auth key" tone="deploy" />
              <TopologyNode x={712} y={706} width={160} title="SSH ACTION" detail="private connection" tone="deploy" />
              <TopologyNode x={930} y={706} title="REPOSITORY" detail="pull + env injection" tone="deploy" />
              <TopologyNode x={1150} y={706} title="COMPOSE" detail="build + replace" tone="deploy" />
              <TopologyNode x={1360} y={706} width={140} title="SERVE" detail="new container" tone="origin" />

              <g className="topology-note" transform="translate(58 815)">
                <circle cx="5" cy="5" r="3" />
                <text x="17" y="8">DOCUMENTED TOPOLOGY / NO LIVE HOST PROBES / PRIVATE IDENTIFIERS OMITTED</text>
              </g>
            </svg>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>

    <div className="topology-legend">
      <span><i className="legend-public" /> public ingress</span>
      <span><i className="legend-private" /> private administration</span>
      <span><i className="legend-storage" /> storage path</span>
      <span><i className="legend-deploy" /> deployment</span>
    </div>
  </div>
  );
};

export default DetailedArchitectureMap;
