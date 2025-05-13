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
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Key as KeyIcon, 
  AppRegistration as RegisterIcon 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, isLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validera formulär
    if (!username || !email || !password || !password2) {
      setFormError('Vänligen fyll i alla obligatoriska fält');
      return;
    }
    
    if (password !== password2) {
      setFormError('Lösenorden matchar inte');
      return;
    }
    
    // Försök registrera
    const success = await register({
      username,
      email,
      password,
      password2,
      first_name: firstName,
      last_name: lastName
    });
    
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
            <Typography level="body-md">Skapa ett nytt konto</Typography>
          </Box>
          
          {(error || formError) && (
            <Alert color="danger" sx={{ mb: 3 }}>
              {formError || error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Användarnamn *</FormLabel>
              <Input
                placeholder="användarnamn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                startDecorator={<PersonIcon />}
                required
              />
            </FormControl>
            
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>E-post *</FormLabel>
              <Input
                type="email"
                placeholder="namn@exempel.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startDecorator={<EmailIcon />}
                required
              />
            </FormControl>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Förnamn</FormLabel>
                  <Input
                    placeholder="Förnamn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Efternamn</FormLabel>
                  <Input
                    placeholder="Efternamn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Lösenord *</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startDecorator={<KeyIcon />}
                required
              />
            </FormControl>
            
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Bekräfta lösenord *</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                startDecorator={<KeyIcon />}
                required
              />
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              startDecorator={<RegisterIcon />}
            >
              Registrera
            </Button>
          </form>
          
          <Divider sx={{ my: 3 }}>eller</Divider>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography level="body-sm">
              Har du redan ett konto?{' '}
              <Link component={RouterLink} to="/login">
                Logga in
              </Link>
            </Typography>
          </Box>
        </Sheet>
      </Grid>
    </Grid>
  );
};

export default Register;