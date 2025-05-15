import * as React from 'react';
import { Box, Sheet } from '@mui/joy';
import Header from './Header';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh'
    }}>
      {/* Huvudinnehåll med sidebar och content */}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden'
      }}>
        <Sidebar />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Toppmeny - ovanför huvudinnehållet */}
          <TopMenu />
          
          {/* Huvudinnehåll */}
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              overflow: 'auto',
              bgcolor: '#f9fafb', // Ljusgrå bakgrund
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;