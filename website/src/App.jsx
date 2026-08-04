import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArchServer from './pages/ArchServer';
import Dotfiles from './pages/Dotfiles';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="server" element={<ArchServer />} />
        <Route path="desktop" element={<Dotfiles />} />
      </Route>
    </Routes>
  );
}

export default App;
