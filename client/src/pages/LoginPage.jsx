import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './LoginPage.css';
import itbFoto from '../assets/itb-foto.png';
import logoITBputih from '../assets/itb-logo-putih.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nim: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  }


  async function handleSubmit(e) {
    e.preventDefault(); 
    
    if (!form.nim || !form.password) {
      setError('NIM dan password harus diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Logging in with NIM:', form.nim);

      const response = await authService.login({
        nim: form.nim,
        password: form.password
      });

      console.log('📥 Login response:', response);

      if (response.success) {
        console.log('✅ Login successful, redirecting...');
        window.location.href = '/homepage'; 
      } else {
        setError(response.error || 'Login gagal');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-left">
        <img src={itbFoto} alt="ITB" className="left-image" />
        <div className="image-overlay"></div>
      </div>

      <div className="login-right">
        <img src={logoITBputih} alt="ITB Logo" className="logo-itb-white" />

        <form className="login-box" onSubmit={handleSubmit}>
          <h1>Login</h1>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#ff3b30',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <label className="field">
            <span>NIM</span>
            <input 
              type="text" 
              name="nim" 
              value={form.nim}
              onChange={handleChange}
              placeholder="Masukkan NIM" 
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input 
              type="password" 
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan Password" 
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </label>

          <button 
            className="btn-login" 
            type="submit"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Memproses...' : 'Login'}
          </button>

          <p className="register-link">
            Belum punya akun?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#b2d0e4ff',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Daftar di sini
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}