import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArchServer from './pages/ArchServer';
import Dotfiles from './pages/Dotfiles';
import About from './pages/About';
import Status from './pages/Status';
import NotFound from './pages/NotFound';

import Architecture from './pages/Architecture';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="server" element={<ArchServer />} />
        <Route path="desktop" element={<Dotfiles />} />
        <Route path="architecture" element={<Architecture />} />
        <Route path="about" element={<About />} />
        <Route path="status" element={<Status />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
