import React, { useState } from 'react';

const LoginForm = ({ onLogin, loading, onSwitchToRegister }) => {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(form.username, form.password);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '28rem', 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        margin: '2.5rem 0'
      }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '800', 
          color: '#111827', 
          textAlign: 'center', 
          marginBottom: '1.5rem' 
        }}>
          Login to your account
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.25rem'
            }} htmlFor="login-username">
              Username
            </label>
            <input
              type="text" 
              id="login-username" 
              name="username"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
              value={form.username} 
              onChange={handleChange} 
              required
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.25rem'
            }} htmlFor="login-password">
              Password
            </label>
            <input
              type="password" 
              id="login-password" 
              name="password"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
              value={form.password} 
              onChange={handleChange} 
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 0.3s'
            }}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
          >
            Login
          </button>
        </form>
        <p style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          fontSize: '0.875rem', 
          color: '#6b7280' 
        }}>
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToRegister} 
            style={{ 
              fontWeight: '500', 
              color: '#2563eb', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;