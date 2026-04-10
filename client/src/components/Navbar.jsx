import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/supabase';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    setMenuOpen(false);
  };

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  return (
    <>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>☕</span>
          <span className={styles.logoText}>chaya<strong>spot</strong></span>
        </Link>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span className={styles.avatar}>
                  {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownUser}>
                    <span className={styles.dropdownName}>{user.user_metadata?.full_name || 'Editor'}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <button className={styles.dropdownItem} onClick={() => { navigate('/add'); setMenuOpen(false); }}>
                    + Add Spot
                  </button>
                  <button className={styles.dropdownItem} onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className={styles.btnGhost} onClick={openLogin}>Sign in</button>
              <button className={styles.btnPrimary} onClick={openRegister}>Join</button>
            </>
          )}
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      )}
    </>
  );
}
