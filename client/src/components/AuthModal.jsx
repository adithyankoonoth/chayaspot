import { useState } from 'react';
import { signIn, signUp } from '../lib/supabase';
import toast from 'react-hot-toast';
import styles from './AuthModal.module.css';

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password);
      if (error) { toast.error(error.message); }
      else { toast.success('Welcome back!'); onClose(); }
    } else {
      const { error } = await signUp(form.email, form.password, form.name);
      if (error) { toast.error(error.message); }
      else { toast.success('Account created! Check your email to confirm.'); onClose(); }
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>✕</button>

        <div className={styles.header}>
          <div className={styles.icon}>☕</div>
          <h2 className={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Join ChayaSpot'}
          </h2>
          <p className={styles.sub}>
            {mode === 'login'
              ? 'Sign in to add and edit chai spots'
              : 'Create an account to contribute spots'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>Your name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Rahul"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <button className={styles.submit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className={styles.switchBtn} onClick={onSwitch}>
            {mode === 'login' ? 'Join now' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
