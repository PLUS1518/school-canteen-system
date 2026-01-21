import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  Stack
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authLogin(login, password);
      
      if (result.success) {
        // Перенаправляем в зависимости от роли
        switch (result.user?.role) {
          case 'student':
            navigate('/student');
            break;
          case 'cook':
            navigate('/cook');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.error || 'Ошибка авторизации');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (role: string) => {
    console.log('📝 Заполняю данные для:', role);
    
    switch (role) {
        case 'student':
        setLogin('student1');
        setPassword('pass123');
        break;
        case 'cook':
        setLogin('cook1');
        setPassword('pass123');
        break;
        case 'admin':
        setLogin('admin1');
        setPassword('pass123');
        break;
        default:
        console.warn('⚠️ Неизвестная роль:', role);
    }
    };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Школьная столовая
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
            Вход в систему
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Логин"
              variant="outlined"
              margin="normal"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" align="center">
              Тестовые пользователи:
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => fillTestCredentials('student')}
              >
                Ученик
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => fillTestCredentials('cook')}
              >
                Повар
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => fillTestCredentials('admin')}
              >
                Админ
              </Button>
            </Stack>
          </Box>

          <Box mt={2}>
            <Typography variant="caption" color="textSecondary" align="center" display="block">
              Все пароли: pass123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;