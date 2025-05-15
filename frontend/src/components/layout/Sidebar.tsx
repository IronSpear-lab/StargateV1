import * as React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent, 
  ListItemDecorator, 
  Sheet 
} from '@mui/joy';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Description as WikiIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  ViewInAr as ViewInArIcon,
  Work as WorkspaceIcon
} from '@mui/icons-material';

// Menu items for the sidebar
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Anslagstavla', icon: <MessageIcon />, path: '/notice-board' },
  { text: 'Kalender', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'Workspace', icon: <WorkspaceIcon />, path: '/workspace' },
  { text: 'Projektplanering', icon: <AssignmentIcon />, path: '/project-planning' },
  { text: 'Tidsrapportering', icon: <AssignmentIcon />, path: '/time-reporting' },
  { text: 'Vault', icon: <FolderIcon />, path: '/vault' },
  { text: 'Wiki', icon: <WikiIcon />, path: '/wiki' },
  { text: 'Meddelanden', icon: <MessageIcon />, path: '/messages' },
  { text: '3D Viewer', icon: <ViewInArIcon />, path: '/3d-viewer' },
];

interface SidebarProps {
  width?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({ width = 240 }) => {
  const location = useLocation();
  
  return (
    <Sheet
      sx={{
        width,
        height: '100%',
        borderRight: '1px solid',
        borderColor: 'divider',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <List size="lg" sx={{ gap: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemDecorator>{item.icon}</ListItemDecorator>
              <ListItemContent>{item.text}</ListItemContent>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Sheet>
  );
};

export default Sidebar;