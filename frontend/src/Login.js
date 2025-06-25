import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, InputAdornment, IconButton
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5143/api/Auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setMessage('Giriş başarılı! 🎉');
      // Yönlendirme için 1 saniye bekletmek istemiyorsan setTimeout'u kaldırabilirsin!
      setTimeout(() => {
        navigate('/map');
      }, 1000);
      // Yönlendirme hemen olsun istersen yukarıdaki iki satırı şu şekilde değiştir:
      // navigate('/map');
    } catch (error) {
      setMessage('Giriş başarısız! ' + (error.response?.data?.message || 'Sunucuya ulaşılamıyor'));
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#e0e7ff 0%,#b6ccfa 50%,#2563eb 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Paper elevation={10}
        sx={{
          p: 5, borderRadius: 5, minWidth: 360,
          backdropFilter: "blur(3px)",
          boxShadow: "0 8px 48px 0 rgba(44, 114, 209, .18)"
        }}>
        <Typography variant="h4" align="center" fontWeight={900} color="#2563eb" letterSpacing={1} mb={3}>
          <span style={{ fontFamily: "monospace" }}>🗺️ MapBased Login</span>
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <TextField
            fullWidth
            margin="normal"
            label="E-posta"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Şifre"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPass(!showPass)}
                    edge="end"
                    size="small"
                  >
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2, fontWeight: 700, py: 1.5,
              background: "linear-gradient(90deg,#2563eb 10%,#60a5fa 90%)",
              boxShadow: "0 2px 12px 0 rgba(44, 114, 209, .10)",
              textTransform: "none",
              fontSize: "1.08rem",
              '&:hover': { background: "linear-gradient(90deg,#1e3a8a 10%,#3b82f6 90%)" }
            }}>
            Giriş Yap
          </Button>
        </form>
        {message && (
          <Typography color={message.includes('başarılı') ? "success.main" : "error.main"} sx={{ mt: 2, textAlign: "center" }}>
            {message}
          </Typography>
        )}
        <Typography sx={{ mt: 2, textAlign: "center", fontSize: 15 }}>
          Üye değil misiniz? <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>Kayıt olun</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
