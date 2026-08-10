import { NavLink, Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-black text-neutral-200">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/10">
        <Link to="/" className="flex items-center gap-1 font-bold text-lg text-white hover:text-purple-400 transition-colors">
          <span className="text-purple-500 font-mono">~/</span>arch-server
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink to="/" end className={({ isActive }) => `transition-colors hover:text-white ${isActive ? 'text-white' : 'text-neutral-500'}`}>
            /home
          </NavLink>
          <NavLink to="/server" className={({ isActive }) => `transition-colors hover:text-white ${isActive ? 'text-white' : 'text-neutral-500'}`}>
            /server_node
          </NavLink>
          <NavLink to="/desktop" className={({ isActive }) => `transition-colors hover:text-white ${isActive ? 'text-white' : 'text-neutral-500'}`}>
            /desktop_env
          </NavLink>
          <NavLink to="/architecture" className={({ isActive }) => `transition-colors hover:text-white ${isActive ? 'text-white' : 'text-neutral-500'}`}>
            /architecture
          </NavLink>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      <footer className="w-full text-center py-8 border-t border-white/10 bg-black/50 backdrop-blur-md mt-auto z-10 relative">
        <p className="text-neutral-400 font-bold text-xs tracking-widest mb-2 uppercase">
          LIVE · SELF-HOSTED INFRASTRUCTURE
        </p>
        <p className="text-neutral-500 text-xs leading-relaxed">
          You are viewing a production website served from a{' '}
          <strong className="text-neutral-300">Lenovo IdeaPad</strong> in a home network. <br />
          Arch Linux · Docker · Cloudflare Zero Trust
        </p>
      </footer>
    </div>
  );
};

export default Layout;
