<div align="center">

```
                  -`                     tanmay@puturdawaywaltuh
                 .o+`                    OS: Arch Linux x86_64
                `ooo/                    Host: IdeaPad 3 15IML05
               `+oooo:                   CPU: Intel Core i3-10110U (4) @ 4.10 GHz
              `+oooooo:                  RAM: 8 GiB  |  Disk: 233 GiB
              -+oooooo+:                 Services: SSH · Tailscale · Samba · ProtonVPN
```

# 🖥️ arch-server

**A repurposed Lenovo IdeaPad running headless Arch Linux as a personal home server and globally-accessible NAS.**

[![Arch Linux](https://img.shields.io/badge/Arch_Linux-1793D1?style=for-the-badge&logo=arch-linux&logoColor=white)](https://archlinux.org/)
[![Tailscale](https://img.shields.io/badge/Tailscale-000000?style=for-the-badge&logo=tailscale&logoColor=white)](https://tailscale.com/)
[![Samba](https://img.shields.io/badge/Samba_NAS-FF6600?style=for-the-badge&logo=linux&logoColor=white)](https://www.samba.org/)
[![SSH](https://img.shields.io/badge/SSH-4D4D4D?style=for-the-badge&logo=openssh&logoColor=white)](https://www.openssh.com/)

</div>

---

## 📖 The Story

This is a **spare Lenovo IdeaPad** that was previously used as a daily driver running Arch Linux with a full Hyprland desktop setup (those configs are preserved at [hyprland-dotfiles](https://github.com/tanmayhutt/hyprland-dotfiles)).

Rather than letting it collect dust, it was repurposed into a personal home server and NAS — while **keeping the entire Hyprland setup intact** for sentimental reasons and future use. The machine now runs headless (no monitor needed) and is controlled entirely over SSH through a private Tailscale network, accessible from anywhere in the world.

---

## 🔧 Hardware

| Component | Details |
|-----------|---------|
| **Machine** | Lenovo IdeaPad 3 15IML05 |
| **CPU** | Intel Core i3-10110U (4 cores @ 4.10 GHz) |
| **RAM** | 8 GiB DDR4 |
| **Storage** | 233 GiB SSD (ext4) |
| **GPU** | Intel UHD Graphics (Integrated) |
| **Network** | Wi-Fi via NetworkManager (`wlan0`) |
| **OS** | Arch Linux x86_64 |
| **Kernel** | Linux 7.1.3-arch1-2 |

---

## 🌐 Remote Access

### SSH + Tailscale

The server is controlled entirely via **SSH over a private [Tailscale](https://tailscale.com/) mesh network**. No open firewall ports. No public IP exposure. Works from anywhere in the world — home, coffee shop, or internationally.

```bash
ssh tanmay@<your-tailscale-ip>
```

Tailscale creates an encrypted, private network between all your devices (Mac, iPhone, Android). Any device logged into the same Tailscale account can reach the server using its dedicated private IP.

**Services keeping remote access alive:**
```
sshd.service       → OpenSSH Daemon (remote shell access)
tailscaled.service → Tailscale node agent (private mesh network)
```

---

## 💾 NAS — Network Attached Storage

The entire home directory (`/home/tanmay`) is shared over the local Tailscale network using **Samba (SMB)** — the universal file sharing protocol natively supported by macOS, Windows, iOS, and Android.

### Connect from any device

| Device | Method |
|--------|--------|
| **Mac** | Finder → `Cmd+K` → `smb://<tailscale-ip>` |
| **Windows** | File Explorer → `\\<tailscale-ip>` |
| **iPhone/iPad** | Files app → `...` → Connect to Server → `smb://<tailscale-ip>` |
| **Android** | File Manager → Network Storage → SMBv2/SMBv3 → `<tailscale-ip>` |

> ⚠️ **Tailscale must be active** on the connecting device. The SMB share is not exposed to the open internet.

### Samba Config (`/etc/samba/smb.conf`)

```ini
[global]
   workgroup = WORKGROUP
   server string = Lenovo NAS
   security = user
   map to guest = bad user
   dns proxy = no

[Lenovo]
   path = /home/tanmay
   browsable = yes
   writable = yes
   valid users = tanmay
```

### Running services

```
smb.service  → Samba SMB Daemon (file sharing)
nmb.service  → Samba NMB Daemon (network browsing/discovery)
```

### Set up Samba password

```bash
sudo smbpasswd -a tanmay
```

---

## ⚙️ Running Services

These are all the background services actively running on the server:

| Service | Description |
|---------|-------------|
| `sshd` | OpenSSH — remote shell access |
| `tailscaled` | Tailscale — private mesh VPN network |
| `smb` | Samba — SMB file sharing (NAS) |
| `nmb` | Samba NMB — network browsing/discovery |
| `NetworkManager` | WiFi and network management |
| `wpa_supplicant` | WiFi authentication |
| `proton.VPN` | ProtonVPN daemon |
| `earlyoom` | Early OOM killer — prevents system freeze under memory pressure |
| `irqbalance` | Balances CPU interrupts across cores for better performance |
| `power-profiles-daemon` | Power profile management |
| `bluetooth` | Bluetooth service |
| `polkit` | Authorization manager |
| `rtkit-daemon` | Realtime scheduling policy for audio |
| `udisks2` | Disk manager |
| `upower` | Power management |
| `waydroid-container` | Waydroid Android container |
| `systemd-timesyncd` | Network time synchronization |

---

## 📱 Waydroid — Android on Linux

**Waydroid** is running as a container service, allowing Android apps to run natively inside the Linux environment using a full Android system image. This is purely experimental on this machine.

```bash
waydroid session start
waydroid show-full-ui
```

---

## 🌐 WiFi Management — `wlctl`

WiFi is managed with **[wlctl](https://github.com/sandorex/wlctl)** — a beautiful terminal-based WiFi TUI that works natively with NetworkManager.

```bash
wlctl
```

This is a fork of the popular `impala` TUI, specifically designed for NetworkManager-based systems. It provides a full ncurses interface showing nearby networks, signal strength, security type, and device info.

> **Note:** `impala` only works with `iwd`. Since this machine uses NetworkManager, `wlctl` is the correct equivalent.

**Key bindings:**

| Key | Action |
|-----|--------|
| `↑↓` / `k/j` | Navigate |
| `Enter` / `~` | Connect/Disconnect |
| `a` | Show all networks |
| `d` | Remove saved network |
| `s` | Scan for networks |
| `S` | Show speed |
| `u` | Show internet status |

---

## 📁 Yazi — TUI File Manager

**[Yazi](https://github.com/sxyazi/yazi)** is used for visually navigating the server's file system over SSH with a blazing-fast 3-column layout, file previews, and syntax highlighting.

```bash
yazi
```

### Config (`~/.config/yazi/yazi.toml`)

```toml
[preview]
image_quality = 50
max_width = 300
max_height = 300

[plugin]
prepend_previewers = [
  { mime = "image/png",  run = "image" },
  { mime = "image/jpeg", run = "image" },
  { mime = "image/webp", run = "image" },
]
```

### Key bindings

| Key | Action |
|-----|--------|
| `h/j/k/l` | Navigate |
| `Enter` | Open |
| `q` | Quit |
| `y/x/p` | Copy/Cut/Paste |
| `d` | Delete |
| `a` | Create file/folder |
| `r` | Rename |
| `/` | Search |
| `.` | Toggle hidden files |

---

## 📜 Custom Scripts (`~/scripts/`)

Small utility scripts for quick system info over SSH:

### `battery.sh`
```bash
#!/bin/bash
cat /sys/class/power_supply/BAT*/capacity 2>/dev/null || echo "No battery"
```
Reads raw battery percentage directly from the kernel's power supply interface.

### `network-status.sh`
```bash
#!/bin/bash
ssid=$(nmcli -t -f active,ssid dev wifi | grep '^yes' | cut -d ':' -f2)
if [[ -n "$ssid" ]]; then
  echo "WiFi: $ssid"
else
  echo "Disconnected"
fi
```
Shows the currently connected WiFi network name.

### `whatsong.sh`
```bash
#!/bin/bash
playerctl metadata --format '{{artist}} - {{title}}' 2>/dev/null || echo "No song playing"
```
Shows the currently playing song via `playerctl` (works with Spotify, VLC, etc.)

### `whoami.sh`
```bash
#!/bin/bash
echo "Logged in as: $(whoami)@$(hostname)"
```
Simple identity check.

---

## 🚀 Setting This Up From Scratch

### 1. Enable SSH
```bash
sudo systemctl enable --now sshd
```

### 2. Install and connect Tailscale
```bash
yay -S tailscale-bin
sudo systemctl enable --now tailscaled
sudo tailscale up
```

### 3. Set up Samba NAS
```bash
sudo pacman -S samba

sudo tee /etc/samba/smb.conf > /dev/null << 'EOF'
[global]
   workgroup = WORKGROUP
   server string = Lenovo NAS
   security = user
   map to guest = bad user
   dns proxy = no

[Lenovo]
   path = /home/tanmay
   browsable = yes
   writable = yes
   valid users = tanmay
EOF

sudo smbpasswd -a tanmay
sudo systemctl enable --now smb nmb
```

### 4. Install WiFi TUI
```bash
yay -S wlctl-bin
```

### 5. Install Yazi file manager
```bash
sudo pacman -S yazi poppler ripgrep zoxide fd fzf imagemagick
mkdir -p ~/.config/yazi
```

### 6. Install earlyoom (prevent freezing)
```bash
sudo pacman -S earlyoom
sudo systemctl enable --now earlyoom
```

---

## 🗂️ Related

- **[hyprland-dotfiles](https://github.com/tanmayhutt/hyprland-dotfiles)** — The Hyprland, Waybar, Wofi, Kitty, Cava, and Hyprlock configs running on this same machine. Includes `deploy.sh` for automated symlink deployment and `push.sh` for one-command git sync.

---

## 📝 Lessons Learned

- **i3 CPUs cannot run local LLMs practically.** Tried `ollama` with `phi3:latest` — it worked but was far too slow without a GPU.
- **Samba over Tailscale is incredibly powerful.** Mounting a Linux drive on a Mac through Finder feels exactly like plugging in a USB — except it works from anywhere in the world.
- **Samsung "My Files" is bad at SMB.** Use **Cx File Explorer** on Android instead.
- **AUR mirrors go stale.** Run `sudo pacman -Syy` to force-refresh if you hit 404 errors.
- **earlyoom is essential.** Without it, running multiple services on 8GB RAM can occasionally freeze the entire machine under pressure.

---

<div align="center">

*Built on a dusty Lenovo. Accessed from everywhere.*

</div>
