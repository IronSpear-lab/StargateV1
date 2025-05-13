import * as React from 'react';
import { 
  Sheet, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemDecorator, 
  ListItemContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListSubheader
} from '@mui/joy';
import {
  Dashboard as DashboardIcon,
  EventNote as CalendarIcon,
  Forum as MessageBoardIcon,
  Group as TeamIcon,
  FolderShared as FilesIcon,
  Task as TasksIcon,
  Article as WikiIcon,
  ChevronRight as RightIcon,
  ExpandMore as ExpandIcon,
  ChevronLeft as CollapseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  unreadCount?: number;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  projects?: Project[];
  onProjectClick?: (projectId: number) => void;
  onCreateProject?: () => void;
  width?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  projects = [],
  onProjectClick,
  onCreateProject,
  width = 280
}) => {
  const location = useLocation();
  const [expandedProjects, setExpandedProjects] = React.useState(true);
  
  // Core navigation items
  const navigationItems: NavigationGroup[] = [
    {
      label: 'Navigering',
      items: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { label: 'Kalender', icon: <CalendarIcon />, path: '/calendar' },
        { label: 'Anslagstavla', icon: <MessageBoardIcon />, path: '/messageboard', badge: 3 },
        { label: 'Team', icon: <TeamIcon />, path: '/team' }
      ]
    },
    {
      label: 'Verktyg',
      items: [
        { label: 'Uppgifter', icon: <TasksIcon />, path: '/tasks', badge: 5 },
        { label: 'Filer', icon: <FilesIcon />, path: '/files' },
        { label: 'Wiki', icon: <WikiIcon />, path: '/wiki' }
      ]
    }
  ];
  
  const isSelected = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <Sheet
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        top: 0,
        left: 0,
        height: '100vh',
        width: { xs: width, md: open ? width : 0 },
        zIndex: { xs: 1200, md: 1100 },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'md',
        transition: 'width 0.3s ease',
        transform: { xs: open ? 'translateX(0)' : `translateX(-${width}px)`, md: 'none' },
      }}
    >
      {/* Sidebar Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          height: 64, // Match header height
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
          ValvX
        </Typography>
        <IconButton 
          size="sm" 
          variant="plain" 
          color="neutral" 
          onClick={onClose}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <CollapseIcon />
        </IconButton>
      </Box>
      
      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        {navigationItems.map((group, groupIndex) => (
          <Box key={groupIndex} sx={{ mb: 3 }}>
            <ListSubheader sx={{ 
              fontWeight: 'lg', 
              letterSpacing: '0.1em',
              fontSize: '0.75rem'
            }}>
              {group.label}
            </ListSubheader>
            
            <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
              {group.items.map((item, itemIndex) => (
                <ListItem key={itemIndex}>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    selected={isSelected(item.path)}
                  >
                    <ListItemDecorator>{item.icon}</ListItemDecorator>
                    <ListItemContent>{item.label}</ListItemContent>
                    {item.badge && (
                      <Badge badgeContent={item.badge} color="primary" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        {/* Projects section */}
        <Accordion 
          expanded={expandedProjects}
          onChange={() => setExpandedProjects(!expandedProjects)}
          sx={{ 
            border: 'none', 
            boxShadow: 'none',
            '&:hover': { bgcolor: 'transparent' }
          }}
        >
          <AccordionSummary
            indicator={<ExpandIcon />}
            sx={{ 
              px: 2, 
              fontWeight: 'lg', 
              letterSpacing: '0.1em',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'text.secondary'
            }}
          >
            Projekt
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
              {projects.map((project) => (
                <ListItem key={project.id}>
                  <ListItemButton
                    onClick={() => onProjectClick && onProjectClick(project.id)}
                  >
                    <ListItemDecorator>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'primary.500',
                        }}
                      />
                    </ListItemDecorator>
                    <ListItemContent>{project.name}</ListItemContent>
                    {project.unreadCount && (
                      <Badge badgeContent={project.unreadCount} color="primary" />
                    )}
                    <RightIcon fontSize="small" sx={{ opacity: 0.5, ml: 1 }} />
                  </ListItemButton>
                </ListItem>
              ))}
              
              <ListItem>
                <ListItemButton
                  onClick={onCreateProject}
                  sx={{ 
                    color: 'primary.600',
                    '&:hover': { bgcolor: 'primary.100' }
                  }}
                >
                  <ListItemDecorator>
                    <AddIcon />
                  </ListItemDecorator>
                  <ListItemContent>Nytt projekt</ListItemContent>
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
      
      {/* Footer */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography level="body-xs" textAlign="center" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} ValvX Platform
        </Typography>
      </Box>
    </Sheet>
  );
};

export default Sidebar;