import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Code2, Server } from "lucide-react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  ["/", "Overview"],
  ["/server", "Server"],
  ["/architecture", "Architecture"],
  ["/desktop", "Desktop"],
];

const Layout = () => {
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();

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

    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.main
        key={pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -5 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
      >
        <Outlet />
      </motion.main>
    </AnimatePresence>

    <footer className="site-footer">
      <div className="page-width footer-inner">
        <div><span className="live-dot" /> PHYSICAL ORIGIN / SELF-HOSTED</div>
        <p>Arch Linux · Docker · Cloudflare · Tailscale</p>
        <p>Built and operated by Tanmay.</p>
      </div>
    </footer>
    </div>
  );
};

export default Layout;
