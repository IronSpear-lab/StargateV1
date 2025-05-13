import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Sheet,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  Box,
  Alert,
  Grid,
  Divider
} from '@mui/joy';
import { Email as EmailIcon, Key as KeyIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validera formulär
    if (!email || !password) {
      setFormError('Vänligen fyll i alla fält');
      return;
    }
    
    // Försök logga in
    const success = await login(email, password);
    
    if (success) {
      navigate('/');
    }
  };
  
  return (
    <Grid 
      container 
      sx={{ 
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.level1'
      }}
    >
      <Grid xs={11} sm={8} md={6} lg={4}>
        <Sheet 
          variant="outlined"
          sx={{ 
            p: 4,
            borderRadius: 'md',
            boxShadow: 'md'
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography level="h3" sx={{ mb: 1 }}>ValvX</Typography>
            <Typography level="body-md">Logga in på projektplattformen</Typography>
          </Box>
          
          {(error || formError) && (
            <Alert color="danger" sx={{ mb: 3 }}>
              {formError || error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>E-post</FormLabel>
              <Input
                type="email"
                placeholder="namn@exempel.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startDecorator={<EmailIcon />}
                required
              />
            </FormControl>
            
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Lösenord</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startDecorator={<KeyIcon />}
                required
              />
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              startDecorator={<LoginIcon />}
            >
              Logga in
            </Button>
          </form>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/forgot-password" level="body-sm">
              Glömt lösenord?
            </Link>
          </Box>
          
          <Divider sx={{ my: 3 }}>eller</Divider>
          
          <Button
            component={RouterLink}
            to="/register"
            variant="outlined"
            color="neutral"
            fullWidth
          >
            Skapa konto
          </Button>
        </Sheet>
      </Grid>
    </Grid>
  );
};

export default Login;