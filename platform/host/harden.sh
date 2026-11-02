#!/usr/bin/env bash
# One-time host hardening. Run with sudo from the repository checkout. Safe to re-run.
#
# 1. Lets tailnet-bound containers (Ollama, Dozzle, Uptime Kuma, Filebrowser) start even if Docker
#    comes up before Tailscale has its address. It does not expose anything new.
# 2. SSH accepts keys only, except connections from the Cloudflare tunnel's Docker network: the
#    browser terminal at ssh.<domain>, which Cloudflare Access already restricts to the owner.
#    sshd is validated before reload and every change is rolled back if validation fails.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo." >&2
  exit 1
fi
user="${SUDO_USER:-tanmay}"

echo "net.ipv4.ip_nonlocal_bind=1" > /etc/sysctl.d/90-tailnet-bind.conf
sysctl -q --system
echo "Tailnet bind at boot: $(sysctl -n net.ipv4.ip_nonlocal_bind)"

# Never disable passwords unless an unrestricted key exists for the account.
if ! grep -qE '^(ssh-ed25519|ssh-rsa|ecdsa-sha2-|sk-)' "/home/$user/.ssh/authorized_keys"; then
  echo "No unrestricted SSH key for $user; leaving password login unchanged." >&2
  exit 1
fi

dropin=/etc/ssh/sshd_config.d/10-arch-server-hardening.conf
main=/etc/ssh/sshd_config
backup="$main.before-hardening"
[ -f "$backup" ] || cp -p "$main" "$backup"

cat > "$dropin" <<'EOF'
# Managed by arch-server platform/host/harden.sh
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
MaxAuthTries 4
LoginGraceTime 30
EOF

# A Match block must be the last thing sshd reads, so it is appended to the main file rather than
# placed in a drop-in (drop-ins are included at the top of sshd_config).
if ! grep -q "arch-server-hardening" "$main"; then
  cat >> "$main" <<'EOF'

# arch-server-hardening: the Cloudflare Access browser terminal arrives from the tunnel container.
Match Address 172.16.0.0/12
    PasswordAuthentication yes
    KbdInteractiveAuthentication yes
EOF
fi

if ! sshd -t; then
  echo "sshd rejected the configuration; rolling back." >&2
  rm -f "$dropin"
  cp -p "$backup" "$main"
  sshd -t && echo "Rolled back. SSH unchanged." >&2
  exit 1
fi

systemctl reload sshd
echo "SSH: keys only from the LAN and tailnet; passwords only via the Cloudflare Access browser terminal."
# Informational only: show the effective setting for a LAN client and for the tunnel network.
echo "LAN client:    $(sshd -T -C "user=$user,host=lan,addr=192.168.1.50,laddr=127.0.0.1,lport=22" 2>/dev/null | grep -E '^passwordauthentication' || echo 'see sshd -T')"
echo "Tunnel client: $(sshd -T -C "user=$user,host=tunnel,addr=172.19.0.3,laddr=127.0.0.1,lport=22" 2>/dev/null | grep -E '^passwordauthentication' || echo 'see sshd -T')"

# Start anything that failed to bind at boot before this setting existed.
docker start ai-ollama >/dev/null 2>&1 || true
echo "Done."
