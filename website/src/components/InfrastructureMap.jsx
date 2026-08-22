import { useState } from "react";

const routes = {
  public: {
    label: "Public site",
    note: "A visitor reaches Cloudflare. The server's outbound tunnel carries the accepted request to Nginx.",
    nodes: ["Browser", "Cloudflare", "cloudflared", "Nginx", "React"],
  },
  private: {
    label: "Private admin",
    note: "An enrolled device reaches SSH and Samba over the private Tailscale mesh, not through the public website.",
    nodes: ["My device", "Tailscale", "WireGuard", "OpenSSH", "Arch"],
  },
  deploy: {
    label: "Deployment",
    note: "A GitHub runner receives a short-lived identity, joins as tag:ci, then reaches only SSH on the server.",
    nodes: ["Git push", "Actions", "OIDC", "SSH", "Compose"],
  },
};

const InfrastructureMap = () => {
  const [active, setActive] = useState("public");
  const route = routes[active];

  return (
    <div className={`route-explorer route-explorer-${active}`}>
      <div className="route-tabs" role="tablist" aria-label="Choose a route through the server">
        {Object.entries(routes).map(([key, value], index) => (
          <button key={key} type="button" role="tab" aria-selected={active === key} className={active === key ? "active" : ""} onClick={() => setActive(key)}>
            <span>0{index + 1}</span>{value.label}
          </button>
        ))}
      </div>
      <div className="route-canvas" role="tabpanel">
        <svg viewBox="0 0 1000 270" role="img" aria-labelledby="route-map-title route-map-description">
          <title id="route-map-title">{route.label} route through the arch-server</title>
          <desc id="route-map-description">{route.note}</desc>
          <path className="route-rail" d="M 90 135 C 205 62, 295 208, 410 135 S 615 62, 730 135 S 860 208, 925 135" />
          <path className="route-rail-active" d="M 90 135 C 205 62, 295 208, 410 135 S 615 62, 730 135 S 860 208, 925 135" pathLength="1" />
          {route.nodes.map((node, index) => {
            const x = [90, 300, 515, 730, 925][index];
            const y = [135, 108, 135, 108, 135][index];
            return (
              <g className="route-stop" transform={`translate(${x} ${y})`} key={node}>
                <circle r={index === 4 ? 16 : 11} />
                <text y={index % 2 ? -31 : 38} textAnchor="middle">{node}</text>
                <text className="route-stop-index" y={index % 2 ? -17 : 53} textAnchor="middle">0{index + 1}</text>
              </g>
            );
          })}
        </svg>
        <div className="route-explanation"><span>{route.label}</span><p>{route.note}</p></div>
      </div>
    </div>
  );
};

export default InfrastructureMap;
