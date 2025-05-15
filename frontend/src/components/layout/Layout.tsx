import { Outlet } from 'react-router-dom';
import { Box } from '@mui/joy';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
          bgcolor: '#f9fafb', // Ljusgrå bakgrund som i bilden
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;