import { Code2, Server } from "lucide-react";
import { useLayoutEffect } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  ["/", "Home"],
  ["/server", "Server"],
  ["/architecture", "How it works"],
  ["/status", "Live"],
  ["/desktop", "Setup"],
  ["/about", "About"],
];

const pageMeta = {
  "/": ["arch-server | an old laptop with a second job", "The story and architecture of Tanmay's self-hosted Arch Linux laptop server."],
  "/server": ["The server | arch-server", "Hardware, remote access, storage, tools, and operating details for the physical Arch Linux node."],
  "/architecture": ["How it works | arch-server", "A detailed, zoomable map of the public, private, storage, and deployment routes."],
  "/status": ["Live server status | arch-server", "A privacy-conscious live snapshot of the physical Arch Linux server."],
  "/desktop": ["The Arch desktop | arch-server", "The personal Hyprland, Pywal, Waybar, Kitty, Zsh, Wofi, and CAVA setup retained on the server."],
  "/about": ["About the project | arch-server", "How a broken laptop display led to a personal home server instead of discarded hardware."],
};

const siteOrigin = "https://arch-server.tanmaytiwari.me";

const setMeta = (selector, attribute, value) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const match = selector.match(/meta\[([^=]+)="([^"]+)"\]/);
    if (match) element.setAttribute(match[1], match[2]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

const Layout = () => {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    const knownRoute = Boolean(pageMeta[pathname]);
    const [title, description] = pageMeta[pathname] || ["Page not found | arch-server", "This route does not exist on the arch-server project site."];
    const canonicalUrl = `${siteOrigin}${knownRoute ? pathname : "/"}`;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="robots"]', "content", knownRoute ? "index, follow" : "noindex, follow");

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    if (hash) {
      window.requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
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

    <main id="main-content"><Outlet /></main>

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
