import * as React from 'react';
import { Box, Sheet } from '@mui/joy';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Header onMenuToggle={toggleSidebar} />
      <Box 
        sx={{ 
          display: 'flex', 
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        {sidebarOpen && <Sidebar />}
        <Sheet 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflow: 'auto',
            bgcolor: 'background.surface'
          }}
        >
          {children}
        </Sheet>
      </Box>
    </Box>
  );
};

export default Layout;