export const particleStoryStages = [
  ["01", "The display failed", "The panel stopped being useful, but the laptop itself was still healthy."],
  ["02", "Arch survived", "The customized Arch system underneath the broken display was still mine."],
  ["03", "It went headless", "I closed the lid on desktop life and kept the machine running without a screen."],
  ["04", "Services moved in", "Docker isolates the workloads; Nginx serves this React site from the machine."],
  ["05", "The public route", "Cloudflared makes an outbound tunnel, so Cloudflare can deliver the site without an open router port."],
  ["06", "The private route", "Tailscale gives trusted devices a private mesh for SSH, Samba, and administration."],
  ["07", "The deploy route", "A push lets GitHub Actions join as ephemeral CI, reach only SSH, and rebuild the Compose stack."],
  ["08", "One connected node", "The old laptop is now a physical Arch server with separate public, private, and deployment paths."],
];
