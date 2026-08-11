import { Code2, Server } from "lucide-react";
import { useLayoutEffect } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  ["/", "Home"],
  ["/server", "Server"],
  ["/architecture", "How it works"],
  ["/desktop", "Setup"],
  ["/about", "About"],
];

const pageMeta = {
  "/": ["arch-server | an old laptop with a second job", "The story and architecture of Tanmay's self-hosted Arch Linux laptop server."],
  "/server": ["The server | arch-server", "Hardware, remote access, storage, tools, and operating details for the physical Arch Linux node."],
  "/architecture": ["How it works | arch-server", "A detailed, zoomable map of the public, private, storage, and deployment routes."],
  "/desktop": ["The Arch desktop | arch-server", "The personal Hyprland, Pywal, Waybar, Kitty, Zsh, Wofi, and CAVA setup retained on the server."],
  "/about": ["About the project | arch-server", "How a broken laptop display led to a personal home server instead of discarded hardware."],
};

const Layout = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const [title, description] = pageMeta[pathname] || ["Page not found | arch-server", "This route does not exist on the arch-server project site."];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [pathname]);

  return (
    <div className="app-shell">
    <nav className="site-nav">
      <div className="nav-inner page-width">
        <Link to="/" className="brand-mark" aria-label="arch-server home">
          <span className="brand-icon"><Server size={17} strokeWidth={1.7} /></span>
          <span className="brand-name">arch-server</span>
          <small>HOME NODE</small>
        </Link>
        <div className="nav-links">
          {navItems.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "active" : ""}>
              {label}
            </NavLink>
          ))}
        </div>
        <a className="nav-source" href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer">
          <Code2 size={16} /> <span>Source</span>
        </a>
      </div>
    </nav>

    <main><Outlet /></main>

    <footer className="site-footer">
      <div className="page-width footer-inner">
        <div>PHYSICAL ORIGIN / SELF-HOSTED</div>
        <p>Arch Linux · Docker · Cloudflare · Tailscale</p>
        <p>Built and operated by Tanmay.</p>
      </div>
    </footer>
    </div>
  );
};

export default Layout;
