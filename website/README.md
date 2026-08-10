# arch-server website

React and Vite documentation frontend for the physical Arch Linux node.

## Development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Design constraints

- Infrastructure diagrams must reflect the deployed trust boundaries.
- Static labels must not imply live telemetry.
- Public copy and media must omit private endpoints, identities, and local network details.
- Motion must honor `prefers-reduced-motion` and pause when offscreen where practical.
- Decorative effects should remain secondary to the physical server, access model, and deployment flow.

The production image is built by the root Docker Compose stack and served through Nginx behind an outbound Cloudflare Tunnel.
