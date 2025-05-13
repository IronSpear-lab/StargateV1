import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Sheet, 
  Grid, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Avatar, 
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Card,
  CardContent,
  Alert
} from '@mui/joy';
import { 
  Save as SaveIcon,
  Key as KeyIcon,
  Lock as SecurityIcon,
  Notifications as NotificationsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, updateUser, error } = useAuth();
  const [activeTab, setActiveTab] = useState<string | number>(0);
  
  // Profil form state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profile_pic || '');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Lösenord form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: string | number | null) => {
    if (newValue !== null) {
      setActiveTab(newValue);
    }
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);
    
    try {
      const success = await updateUser({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber
      });
      
      if (success) {
        setUpdateSuccess(true);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Lösenorden matchar inte');
      return;
    }
    
    // Här skulle API-anrop för lösenordsuppdatering ske
    // För tillfället simulerar vi bara
    setPasswordSuccess(true);
  };
  
  return (
    <Box>
      <Typography level="h2" sx={{ mb: 3 }}>
        Min profil
      </Typography>
      
      <Grid container spacing={3}>
        {/* Vänster panel - Avatar och info */}
        <Grid xs={12} md={4}>
          <Sheet 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 'md',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar
              src={profileImageUrl}
              alt={`${firstName} ${lastName}`}
              sx={{ width: 120, height: 120 }}
            >
              {firstName.charAt(0)}{lastName.charAt(0)}
            </Avatar>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography level="title-lg">
                {firstName} {lastName}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {user?.username}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1, width: '100%' }} />
            
            <Box sx={{ width: '100%' }}>
              <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon fontSize="small" /> {email}
              </Typography>
              {phoneNumber && (
                <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" /> {phoneNumber}
                </Typography>
              )}
            </Box>
          </Sheet>
        </Grid>
        
        {/* Höger panel - Tabs med inställningar */}
        <Grid xs={12} md={8}>
          <Card>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Profile settings"
            >
              <TabList>
                <Tab>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    Profiluppgifter
                  </Box>
                </Tab>
                <Tab>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <KeyIcon fontSize="small" />
                    Lösenord
                  </Box>
                </Tab>
                <Tab>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon fontSize="small" />
                    Säkerhet
                  </Box>
                </Tab>
                <Tab>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon fontSize="small" />
                    Notifikationer
                  </Box>
                </Tab>
              </TabList>
              
              <CardContent>
                <TabPanel value={0}>
                  {updateSuccess && (
                    <Alert color="success" sx={{ mb: 2 }}>
                      Profilen har uppdaterats
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert color="danger" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <form onSubmit={handleProfileUpdate}>
                    <Grid container spacing={2}>
                      <Grid xs={12} sm={6}>
                        <FormControl>
                          <FormLabel>Förnamn</FormLabel>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <FormControl>
                          <FormLabel>Efternamn</FormLabel>
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12}>
                        <FormControl>
                          <FormLabel>E-post</FormLabel>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12}>
                        <FormControl>
                          <FormLabel>Telefonnummer</FormLabel>
                          <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12}>
                        <FormControl>
                          <FormLabel>Profilbild URL</FormLabel>
                          <Input
                            value={profileImageUrl}
                            onChange={(e) => setProfileImageUrl(e.target.value)}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12}>
                        <Button
                          type="submit"
                          startDecorator={<SaveIcon />}
                          loading={updating}
                          sx={{ mt: 2 }}
                        >
                          Spara ändringar
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </TabPanel>
                
                <TabPanel value={1}>
                  {passwordSuccess && (
                    <Alert color="success" sx={{ mb: 2 }}>
                      Lösenordet har uppdaterats
                    </Alert>
                  )}
                  
                  {passwordError && (
                    <Alert color="danger" sx={{ mb: 2 }}>
                      {passwordError}
                    </Alert>
                  )}
                  
                  <form onSubmit={handlePasswordUpdate}>
                    <FormControl sx={{ mb: 2 }}>
                      <FormLabel>Nuvarande lösenord</FormLabel>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </FormControl>
                    
                    <FormControl sx={{ mb: 2 }}>
                      <FormLabel>Nytt lösenord</FormLabel>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </FormControl>
                    
                    <FormControl sx={{ mb: 2 }}>
                      <FormLabel>Bekräfta nytt lösenord</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </FormControl>
                    
                    <Button
                      type="submit"
                      startDecorator={<SaveIcon />}
                    >
                      Uppdatera lösenord
                    </Button>
                  </form>
                </TabPanel>
                
                <TabPanel value={2}>
                  <Typography level="h3" sx={{ mb: 2 }}>
                    Säkerhetsinställningar
                  </Typography>
                  
                  <Typography level="body-md">
                    Här kommer säkerhetsinställningar som tvåfaktorsautentisering att visas.
                  </Typography>
                </TabPanel>
                
                <TabPanel value={3}>
                  <Typography level="h3" sx={{ mb: 2 }}>
                    Notifikationsinställningar
                  </Typography>
                  
                  <Typography level="body-md">
                    Här kommer notifikationsinställningar att visas.
                  </Typography>
                </TabPanel>
              </CardContent>
            </Tabs>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;