import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5143/api/Auth/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      setMessage('Login başarılı! 🎉');
    } catch (error) {
      setMessage('Giriş başarısız! ' + (error.response?.data?.message || 'Sunucuya ulaşılamıyor'));
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '100px auto', padding: 24, border: '1px solid #ccc', borderRadius: 12 }}>
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 10, fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 10, fontSize: 16 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10, fontSize: 16 }}>Giriş Yap</button>
      </form>
      {message && <p style={{marginTop: 12}}>{message}</p>}
      <p style={{marginTop: 20, textAlign: 'center'}}>
        Üye değil misiniz?{' '}
        <Link to="/register" style={{color:'#007bff', textDecoration: 'underline'}}>Kayıt olun</Link>
      </p>
    </div>
  );
}

export default Login;
