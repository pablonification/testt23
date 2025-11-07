import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './RegisterPage.css';
import itbFoto from '../assets/itb-foto.png';
import logoITBputih from '../assets/itb-logo-putih.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    nim: '',
    fakultas: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  }


  async function handleSubmit(e) {
    e.preventDefault(); 

    if (!form.fullName || !form.nim || !form.password) {
      setError('Nama, NIM, dan Password harus diisi');
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📝 Registering:', form.nim);

      const response = await authService.register({
        fullName: form.fullName,
        nim: form.nim,
        password: form.password
      });

      console.log('📥 Register response:', response);

      if (response.success) {
        console.log('✅ Registration successful');
        alert('🎉 Registrasi berhasil! Selamat datang di LingoBee!');
        window.location.href = '/homepage'; 
      } else {
        setError(response.error || 'Registrasi gagal');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="register-root">
      <div className="register-left">
        <img src={itbFoto} alt="ITB" className="left-image" />
        <div className="image-overlay"></div>
      </div>

      <div className="register-right">
        <img src={logoITBputih} alt="ITB Logo" className="logo-itb-white" />

        <form className="register-box" onSubmit={handleSubmit}>
          <h1>Register</h1>

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
            <span>Nama Lengkap</span>
            <input 
              type="text" 
              name="fullName" 
              value={form.fullName}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap" 
              required
              disabled={isLoading}
            />
          </label>

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
            />
          </label>

          <label className="field">
            <span>Fakultas</span>
            <input 
              type="text" 
              name="fakultas" 
              value={form.fakultas}
              onChange={handleChange}
              placeholder="Masukkan fakultas" 
              disabled={isLoading}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input 
              type="password" 
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter" 
              required
              disabled={isLoading}
            />
          </label>

          <button 
            className="btn-register" 
            type="submit"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Mendaftar...' : 'Daftar'}
          </button>

          <p className="login-link">
            Sudah punya akun?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0063a3',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Login di sini
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}