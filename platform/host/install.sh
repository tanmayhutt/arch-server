#!/usr/bin/env bash
# One-time host setup for the deploy platform. Run with sudo from the repository checkout.
# Copies the scripts to root-owned locations so nothing that runs as root, or as the
# builder's forced command, can be modified through the user-writable checkout.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo." >&2
  exit 1
fi

here="$(cd "$(dirname "$0")" && pwd)"
owner="${SUDO_USER:-tanmay}"

install -o root -g root -m 0755 "$here/arch-apps-firewall" /usr/local/sbin/arch-apps-firewall
install -o root -g root -m 0755 "$here/arch-image-load" /usr/local/bin/arch-image-load
install -o root -g root -m 0644 "$here/arch-apps-firewall.service" /etc/systemd/system/arch-apps-firewall.service

systemctl daemon-reload
systemctl enable --now arch-apps-firewall.service
systemctl restart arch-apps-firewall.service

echo
echo "Installed:"
echo "  /usr/local/sbin/arch-apps-firewall   (root-owned, runs after every Docker start)"
echo "  /usr/local/bin/arch-image-load       (root-owned forced command for the builder key)"
systemctl --no-pager --lines=0 status arch-apps-firewall.service | head -3
iptables -S ARCH-APPS-FWD | head -3
echo "Done for user $owner."
