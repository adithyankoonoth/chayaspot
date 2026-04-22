import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SpotDetail from './pages/SpotDetail';
import './index.css';
import { Analytics } from "@vercel/analytics/react"

function BuyMeCoffeeWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
    script.setAttribute('data-name', 'BMC-Widget');
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-id', 'adithyank');
    script.setAttribute('data-description', 'Support me on Buy me a coffee!');
    script.setAttribute('data-message', '');
    script.setAttribute('data-color', '#D4520F');
    script.setAttribute('data-position', 'Left');
    script.setAttribute('data-x_margin', '18');
    script.setAttribute('data-y_margin', '18');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}

function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '32px 16px',
      borderTop: '1px solid rgba(212, 82, 15, 0.12)',
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        fontFamily: 'var(--font-body)',
      }}>
        Made with ☕ for ഒറ്റ mind teams
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: 'var(--muted)',
        fontFamily: 'var(--font-body)',
        opacity: '0.6',
      }}>
        <span>Crafted by</span>
        <a
          href="https://adithyankoonoth.github.io/Portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--orange-light)',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '12px',
            borderBottom: '1px solid rgba(232, 98, 26, 0.3)',
            paddingBottom: '1px',
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ff8c4a';
            e.currentTarget.style.borderColor = '#ff8c4a';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--orange-light)';
            e.currentTarget.style.borderColor = 'rgba(232, 98, 26, 0.3)';
          }}
        >
          Adithyan
        </a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/spot/:id" element={<SpotDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <BuyMeCoffeeWidget />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#3D1C08',
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 20px',
            },
            success: { iconTheme: { primary: '#E8621A', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
      <Analytics />
    </AuthProvider>
  );
}