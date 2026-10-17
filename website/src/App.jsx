import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArchServer from './pages/ArchServer';
import Dotfiles from './pages/Dotfiles';
import About from './pages/About';
import Status from './pages/Status';
import NotFound from './pages/NotFound';

import Architecture from './pages/Architecture';

// Owner-only console, loaded as a separate chunk so public visitors never download it.
const Console = lazy(() => import('./pages/console/Console'));
const GuestPortal = lazy(() => import('./pages/console/GuestPortal'));
const Apps = lazy(() => import('./pages/Apps'));

function App() {
  return (
    <Routes>
      <Route path="console/*" element={<Suspense fallback={null}><Console /></Suspense>} />
      <Route path="guest/*" element={<Suspense fallback={null}><GuestPortal /></Suspense>} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="server" element={<ArchServer />} />
        <Route path="desktop" element={<Dotfiles />} />
        <Route path="architecture" element={<Architecture />} />
        <Route path="about" element={<About />} />
        <Route path="status" element={<Status />} />
        <Route path="apps" element={<Suspense fallback={null}><Apps /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
