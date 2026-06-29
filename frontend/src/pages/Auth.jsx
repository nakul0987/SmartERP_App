import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, { email, password });
      setToken(res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto', backgroundColor: '#fff', border: '1px solid #ccc', marginTop: '100px' }}>
      <h2>SmartERP Gateway - {isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email ID:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '5px' }} />
        </div>
        <button type="submit" style={{ background: '#24333c', color: '#fff', padding: '8px 12px', border: 'none', cursor: 'pointer' }}>
          {isLogin ? 'Login (Enter)' : 'Create Account'}
        </button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: '#007acc', marginTop: '15px', fontSize: '12px' }}>
        {isLogin ? 'New to SmartERP? Register here' : 'Already have an account? Login'}
      </p>
    </div>
  );
}