import * as React from 'react';
import { Box, useColorScheme, CssBaseline } from '@mui/joy';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { mode, setMode } = useColorScheme();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleColorMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      <Sidebar 
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={[
          { id: 1, name: 'Projekt Alpha', unreadCount: 3 },
          { id: 2, name: 'Marknadsföringskampanj' },
          { id: 3, name: 'Backend Utveckling' },
        ]}
        onProjectClick={(id) => console.log(`Navigera till projekt ${id}`)}
        onCreateProject={() => console.log('Öppna modal för att skapa nytt projekt')}
      />
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%',
          flexGrow: 1,
        }}
      >
        <Header 
          onSidebarToggle={handleSidebarToggle}
          userName="Marcus Larsson"
          userAvatar=""
          onLogout={() => console.log('Logga ut')}
          onProfileClick={() => console.log('Navigera till profil')}
          onSettingsClick={() => console.log('Öppna inställningar')}
        />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            backgroundColor: 'background.level1',
            width: '100%',
            overflow: 'auto'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;