import * as React from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Sheet, 
  Avatar, 
  Menu, 
  MenuItem, 
  Dropdown, 
  MenuButton,
  Divider
} from '@mui/joy';
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'ValvX Projektplattform', 
  onMenuToggle,
  showMenuButton = true
}) => {
  return (
    <Sheet
      sx={{
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showMenuButton && (
          <IconButton color="neutral" onClick={onMenuToggle}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography level="title-lg">{title}</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton variant="plain" color="neutral" size="sm">
          <NotificationsIcon />
        </IconButton>
        
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
          >
            <Avatar size="sm" src="" alt="User" />
          </MenuButton>
          <Menu placement="bottom-end">
            <MenuItem>
              <AccountCircleIcon />
              Min profil
            </MenuItem>
            <MenuItem>
              <SettingsIcon />
              Inställningar
            </MenuItem>
            <Divider />
            <MenuItem color="danger">
              <LogoutIcon />
              Logga ut
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Sheet>
  );
};

export default Header;