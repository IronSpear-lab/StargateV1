import * as React from 'react';
import { 
  Box, 
  IconButton, 
  Input, 
  Typography, 
  Avatar, 
  Dropdown, 
  Menu, 
  MenuButton, 
  MenuItem, 
  Divider,
  Sheet,
  Badge
} from '@mui/joy';
import { 
  Search as SearchIcon, 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon, 
  Mail as MailIcon,
  ExpandMore as ExpandMoreIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon
} from '@mui/icons-material';

interface HeaderProps {
  onSidebarToggle: () => void;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  userName = 'Användare',
  userAvatar,
  onLogout,
  onProfileClick,
  onSettingsClick
}) => {
  return (
    <Sheet
      variant="solid"
      color="primary"
      invertedColors
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        zIndex: 1000,
        position: 'sticky',
        top: 0,
        width: '100%',
      }}
    >
      {/* Left side - Logo and menu toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          variant="soft"
          onClick={onSidebarToggle}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography level="title-lg" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
          ValvX
        </Typography>
      </Box>
      
      {/* Center - Search */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: { xs: 'none', md: 'flex' }, 
          justifyContent: 'center',
          mx: 2
        }}
      >
        <Input
          size="sm"
          variant="outlined"
          placeholder="Sök..."
          startDecorator={<SearchIcon />}
          sx={{
            width: '100%',
            maxWidth: 500,
          }}
        />
      </Box>
      
      {/* Right side - User menu and notifications */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton variant="soft" size="sm">
          <Badge badgeContent={3} color="danger">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <IconButton variant="soft" size="sm">
          <Badge badgeContent={5} color="danger">
            <MailIcon />
          </Badge>
        </IconButton>
        
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'plain' } }}
            sx={{ 
              display: 'flex', 
              gap: 1.5, 
              alignItems: 'center', 
              px: 1,
              '&:hover': {
                bgcolor: 'primary.700'
              }
            }}
          >
            <Avatar
              size="sm"
              src={userAvatar}
              alt={userName}
            >
              {!userAvatar && userName.substring(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography level="body-sm" textColor="inherit">
                {userName}
              </Typography>
            </Box>
            <ExpandMoreIcon sx={{ fontSize: 20 }} />
          </MenuButton>
          <Menu 
            placement="bottom-end"
            sx={{ 
              minWidth: 180,
              zIndex: 1500
            }}
          >
            <MenuItem onClick={onProfileClick}>
              <ProfileIcon />
              Min profil
            </MenuItem>
            <MenuItem onClick={onSettingsClick}>
              <SettingsIcon />
              Inställningar
            </MenuItem>
            <Divider />
            <MenuItem color="danger" onClick={onLogout}>
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