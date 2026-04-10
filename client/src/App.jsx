import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SpotDetail from './pages/SpotDetail';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spot/:id" element={<SpotDetail />} />
        </Routes>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#3D1C08',
              color: '#fff',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 20px',
            },
            success: { iconTheme: { primary: '#E8621A', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
