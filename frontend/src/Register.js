import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Paper, TextField, Button, Typography, InputAdornment
} from '@mui/material';
import { Link } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5143/api/Auth/register', { email, password });
      setMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
    } catch (error) {
      setMessage('Kayıt başarısız! ' + (error.response?.data?.message || 'Sunucuya ulaşılamıyor'));
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#deeaff 0%,#b6ccfa 60%,#2563eb 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Paper elevation={8}
        sx={{
          p: 5, borderRadius: 4, minWidth: 350,
          backdropFilter: "blur(2px)",
          boxShadow: "0 6px 48px 0 rgba(44, 114, 209, .18)"
        }}>
        <Typography variant="h4" align="center" fontWeight={800} color="#2563eb" letterSpacing={1} mb={3}>
          <span style={{ fontFamily: "monospace" }}>🗺️ MapBased Register</span>
        </Typography>
        <form onSubmit={handleSubmit}>
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
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
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
            Kayıt Ol
          </Button>
        </form>
        {message && (
          <Typography color={message.includes('başarılı') ? "success.main" : "error.main"} sx={{ mt: 2, textAlign: "center" }}>
            {message}
          </Typography>
        )}
        <Typography sx={{ mt: 2, textAlign: "center", fontSize: 15 }}>
          <Link to="/" style={{ color: '#2563eb', fontWeight: 700 }}>Giriş yap</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;
