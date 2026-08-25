import { Activity, ArrowUpRight, Code2, Network, Server } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  ["/", "Overview", "The transformation"],
  ["/server", "Server", "Physical node"],
  ["/architecture", "Routes", "Trust and traffic"],
  ["/status", "Live", "Coarse telemetry"],
  ["/desktop", "Setup", "The retained desktop"],
  ["/about", "About", "Why I built it"],
];

const homeNavItems = [
  ["home", "Opening"],
  ["story", "Particle story"],
  ["how-it-works", "Traffic routes"],
  ["live", "Live machine"],
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
  const reducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState(hash.slice(1) || "home");
  const [scrollProgress, setScrollProgress] = useState(0);

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

    if (hash) window.requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    let frameId = 0;
    const sections = pathname === "/" ? homeNavItems.map(([id]) => document.getElementById(id)).filter(Boolean) : [];

    const syncScroll = () => {
      frameId = 0;
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0);
      if (!sections.length) return;

      const activationLine = Math.min(window.innerHeight * 0.38, 340);
      let current = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine) current = section;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
      setActiveSection(current.id);
    };

    const scheduleSync = () => {
      if (!frameId) frameId = window.requestAnimationFrame(syncScroll);
    };

    syncScroll();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    const resizeObserver = new ResizeObserver(scheduleSync);
    sections.forEach((section) => resizeObserver.observe(section));
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      resizeObserver.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  const jumpHome = (event, id) => {
    if (pathname !== "/") return;
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="app-shell field-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <aside className="site-rail" aria-label="Project navigation">
        <Link to="/" className="rail-brand" aria-label="arch-server home">
          <span className="brand-icon"><Server size={17} strokeWidth={1.7} /></span>
          <span><strong>arch-server</strong><small>HOME NODE / 01</small></span>
        </Link>

        <nav className="rail-primary" aria-label="Main pages">
          <span className="rail-kicker">Project index</span>
          {navItems.map(([to, label, detail], index) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "active" : ""}>
              <span className="rail-index">0{index + 1}</span>
              <span><strong>{label}</strong><small>{detail}</small></span>
            </NavLink>
          ))}
        </nav>

        {pathname === "/" && (
          <nav className="rail-sections" aria-label="Overview sections">
            <span className="rail-kicker">On this page</span>
            {homeNavItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={(event) => jumpHome(event, id)} className={activeSection === id ? "active" : ""} aria-current={activeSection === id ? "location" : undefined}>
                <span aria-hidden="true" />{label}
              </a>
            ))}
          </nav>
        )}

        <div className="rail-footer">
          <Link to="/status" className="rail-live"><Activity size={14} /><span><strong>Public snapshot</strong><small>Privacy-coarsened</small></span></Link>
          <a href="https://github.com/tanmayhutt/arch-server" target="_blank" rel="noreferrer"><Code2 size={14} /> Source <ArrowUpRight size={12} /></a>
          <p><Network size={13} /> India / Physical origin</p>
        </div>
      </aside>

      <header className="mobile-dock">
        <Link to="/" className="mobile-brand"><Server size={16} /><strong>arch-server</strong></Link>
        <nav aria-label="Mobile navigation">
          {pathname === "/" ? homeNavItems.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(event) => jumpHome(event, id)} className={activeSection === id ? "active" : ""}>{label}</a>
          )) : navItems.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "active" : ""}>{label}</NavLink>
          ))}
        </nav>
      </header>

      <div className="shell-content">
        <div className="page-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
        <main id="main-content">
          <motion.div key={pathname} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}>
            <Outlet />
          </motion.div>
        </main>

        <footer className="site-footer">
          <div className="page-width footer-inner">
            <div>PHYSICAL ORIGIN / SELF-HOSTED</div>
            <p>Arch Linux · Docker · Cloudflare · Tailscale</p>
            <p>Built and operated by Tanmay.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
