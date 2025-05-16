import { useState, useEffect } from 'react';
import { 
  Sheet, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent, 
  Typography, 
  Box, 
  Input, 
  IconButton, 
  Divider,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  CircularProgress
} from '@mui/joy';
import { Link, useLocation } from 'react-router-dom';
import directoryService, { DirectoryInput } from '../../services/directoryService';

// Interface för menyobjekt
// Används för att typa submenu-items i sidebar-navigationen
interface SubmenuItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
  hasAddButton?: boolean;
}

// Komponent för varje nod (fil/mapp) i filsystemet
interface FileSystemNodeProps {
  node: SidebarFileNode;
  level: number;
  filesystemNodes: SidebarFileNode[];
  openFolders: Record<string, boolean>;
  toggleFolder: (id: string) => void;
  handleAddNewFolder: (parentId: string | null) => void;
}

// Helt ny och förenklad komponent för filsystemet
const FileSystemNode = ({
  node,
  level,
  filesystemNodes,
  openFolders,
  toggleFolder,
  handleAddNewFolder
}: FileSystemNodeProps) => {
  const isFolder = node.type === 'folder';
  const isOpen = openFolders[node.id] || false;
  
  // Hitta alla barn till denna nod
  const children = filesystemNodes.filter(n => n.parent_id === node.id);
  
  return (
    <div style={{ position: 'relative', marginBottom: '4px', width: '100%' }}>
      {/* L-streck för hierarkin */}
      {level > 0 && (
        <div style={{
          position: 'absolute',
          left: `${level * 24 - 8}px`,
          top: 0,
          width: '10px',
          height: '20px',
          borderLeft: '1px solid #A0A0A0',
          borderBottom: '1px solid #A0A0A0',
          pointerEvents: 'none'
        }} />
      )}
      
      {/* Den faktiska raden med mappnamn som används för klick */}
      <div 
        style={{
          paddingLeft: `${level * 24 + 12}px`,
          paddingRight: '8px',
          paddingTop: '4px',
          paddingBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          cursor: isFolder ? 'pointer' : 'default',
          borderRadius: '4px',
          position: 'relative',
          transition: 'background-color 0.2s'
        }}
        className="folder-row"
        onClick={(e) => {
          e.stopPropagation();
          if (isFolder) toggleFolder(node.id);
        }}
        onMouseOver={(e) => {
          // Find the text element (sibling of icon) and apply hover only to it
          const textElement = e.currentTarget.querySelector('div:nth-child(2)');
          if (textElement) {
            (textElement as HTMLDivElement).style.borderBottom = '1px solid rgba(0, 0, 0, 0.2)';
          }
        }}
        onMouseOut={(e) => {
          // Remove hover effect when mouse leaves
          const textElement = e.currentTarget.querySelector('div:nth-child(2)');
          if (textElement) {
            (textElement as HTMLDivElement).style.borderBottom = 'none';
          }
        }}
      >
        {/* Mapp/filikon */}
        <div style={{
          width: '16px',
          height: '16px',
          marginRight: '10px',
          color: isFolder ? '#e3a008' : '#3182ce',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            {isFolder ? (
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            ) : (
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
            )}
          </svg>
        </div>
        
        {/* Namn */}
        <div style={{
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: '50px',
          maxWidth: '100px',
          width: 'auto',
          flexShrink: 0
        }}>
          {node.name}
        </div>
        
        {/* Plusknapp */}
        {isFolder && (
          <div 
            style={{
              opacity: 0.7,
              minWidth: '20px',
              width: '20px',
              height: '20px',
              padding: '2px',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddNewFolder(node.id);
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Barnmappar - notera att vi använder display: block och inte Box-komponenten */}
      {isFolder && isOpen && children.length > 0 && (
        <div style={{ display: 'block', width: '100%' }}>
          {children.map(child => (
            <FileSystemNode
              key={child.id}
              node={child}
              level={level + 1}
              filesystemNodes={filesystemNodes}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
              handleAddNewFolder={handleAddNewFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Interface för filer och mappar i sidomenyn
interface SidebarFileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null;
  children?: SidebarFileNode[];
  db_id?: number;  // ID från databasen
}

// Define top-level menu items
const mainMenuItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12-2a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2h-4zm0 14a2 2 0 002-2v-4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2h4z" />
      </svg>
    ),
    submenu: []
  },
  { 
    name: 'Project Leader Dashboard', 
    path: '/projectleader', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 13v-1h4v1H8zm0 3v-1h8v1H8zm-2.55-7h13.1c.3 0 .55.25.55.55 0 .24-.16.45-.4.53l-6.6 1.97c-.11.03-.22.03-.33 0l-6.6-1.97a.546.546 0 01-.17-1.03c.07-.03.14-.05.22-.05z"/><path d="M18.24 5H5.76C4.79 5 4 5.79 4 6.76v10.48c0 .97.79 1.76 1.76 1.76h12.48c.97 0 1.76-.79 1.76-1.76V6.76c0-.97-.79-1.76-1.76-1.76zm.26 12H5.5a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5h13a.5.5 0 01.5.5v11a.5.5 0 01-.5.5z"/>
      </svg>
    ),
    submenu: [],
    badge: 'New'
  },
  { 
    name: 'Tidsrapportering', 
    path: '/time', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
      </svg>
    ),
    submenu: []
  },
  { 
    name: 'Projektplanering', 
    path: '/planning', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm16.5 16.5v-15h-15v15h15zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2z"/>
      </svg>
    ),
    submenu: [
      { name: 'Kanban', path: '/planning/kanban' },
      { name: 'Gantt Chart', path: '/planning/gantt' },
      { name: 'Ekonomi & Tid', path: '/planning/economy' }
    ],
    collapsible: true
  },
  { 
    name: 'Kommunikation', 
    path: '/communication', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
      </svg>
    ),
    submenu: [
      { name: 'Meddelanden', path: '/communication/messages' }
    ],
    collapsible: true
  },
  { 
    name: '3D Viewer', 
    path: '/3dviewer', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 18.8l-5.9-3.4V8.6l5.9 3.4v6.8zm1-8.3L7.1 6.9l5.9-3.4 5.9 3.4-5.9 3.6zm6.9 4.9l-5.9 3.4v-6.8l5.9-3.4v6.8z"/>
      </svg>
    ),
    submenu: [
      { name: '3D Översikt', path: '/3dviewer/overview' },
      { name: 'Design', path: '/3dviewer/design' },
      { name: 'Byggarbetsplats', path: '/3dviewer/construction' }
    ],
    collapsible: true
  },
  { 
    name: 'Vault', 
    path: '/vault', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.42l.82-1zM5 19V8h14v11H5zm8-5.35V10.5h-2.5v3.15c-.66.25-1.15.97-1.15 1.85 0 1.1.9 2 2 2s2-.9 2-2c0-.88-.49-1.6-1.15-1.85z"/>
      </svg>
    ),
    submenu: [
      { name: 'Hem', path: '/vault/home' },
      { name: 'Kommentarer', path: '/vault/comments' },
      { name: 'Review Package', path: '/vault/review' },
      { name: 'Versionsset', path: '/vault/versions' },
      { name: 'Möten', path: '/vault/meetings' }
    ],
    collapsible: true
  }
];

// Define the logout option
const logoutItem = {
  name: 'Logga ut',
  path: '/logout',
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  )
};

const Sidebar = () => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    '/planning': true,    // Öppna dessa undermenyer som standard
    '/communication': true,
    '/3dviewer': true,
    '/vault': true
  });
  
  // Håll reda på öppna filer/mappar i filsystemet
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  
  // State för filsystemets noder från API
  const [filesystemNodes, setFilesystemNodes] = useState<SidebarFileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State för att hantera dialogrutan för att skapa nya mappar
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // Toggle submenu
  const toggleSubmenu = (path: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Växla mellan öppen/stängd mapp i filsystemet
  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Öppna en specifik mapp
  const openFolder = (folderId: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: true
    }));
    
    // Öppna också alla föräldramappar till denna mapp
    const openParentFolders = (nodeId: string) => {
      const node = filesystemNodes.find(n => n.id === nodeId);
      if (node && node.parent_id) {
        setOpenFolders(prev => ({
          ...prev,
          [node.parent_id!]: true
        }));
        openParentFolders(node.parent_id);
      }
    };
    
    const folder = filesystemNodes.find(n => n.id === folderId);
    if (folder && folder.parent_id) {
      openParentFolders(folder.parent_id);
    }
  };
  
  // Hantera klick på plustecknet för att skapa ny mapp
  const handleAddNewFolder = (parentId: string | null) => {
    setCurrentParentId(parentId);
    setNewFolderName('');
    setNewFolderDialogOpen(true);
  };
  
  // Ladda sidebarobjekt från API
  useEffect(() => {
    const loadSidebarItems = async () => {
      setIsLoading(true);
      try {
        const directoriesData = await directoryService.getSidebarDirectories();
        
        // Konvertera från API-format till SidebarFileNode-format
        const sidebarNodes: SidebarFileNode[] = directoriesData.map(dir => ({
          id: dir.id.toString(),  // Konvertera till string-format
          name: dir.name,
          type: dir.type as 'folder' | 'file',
          parent_id: dir.parent ? dir.parent.toString() : null,
          db_id: dir.id
        }));
        
        setFilesystemNodes(sidebarNodes);
      } catch (error) {
        console.error('Fel vid hämtning av mappar:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSidebarItems();
  }, []);
  
  // Skapa ny mapp via API
  const createNewFolder = async () => {
    if (newFolderName.trim() === '') return;
    
    // Kontrollera om det redan finns en mapp med samma namn på samma nivå
    const parentId = currentParentId || null;
    const siblingFolders = filesystemNodes.filter(node => node.parent_id === parentId);
    const nameExists = siblingFolders.some(folder => 
      folder.name.toLowerCase() === newFolderName.trim().toLowerCase()
    );
    
    if (nameExists) {
      alert('En mapp med detta namn finns redan. Vänligen välj ett annat namn.');
      return;
    }
    
    // Om parent_id finns, konvertera från string till number för API
    const parentDbId = currentParentId 
      ? filesystemNodes.find(n => n.id === currentParentId)?.db_id ?? null
      : null;
    
    try {
      // Skapa objekt för API-anrop
      const newDirData: DirectoryInput = {
        name: newFolderName.trim(),
        type: 'folder',
        is_sidebar_item: true,
        parent: parentDbId
      };
      
      // Skicka till API
      const createdDir = await directoryService.createDirectory(newDirData);
      
      if (createdDir) {
        // Konvertera från API-format och lägg till i state
        const newFolder: SidebarFileNode = {
          id: createdDir.id.toString(),
          name: createdDir.name,
          type: 'folder' as 'folder' | 'file',
          parent_id: createdDir.parent ? createdDir.parent.toString() : null,
          db_id: createdDir.id
        };
        
        // Uppdatera state
        setFilesystemNodes(prev => [...prev, newFolder]);
        
        // Automatiskt öppna den nya mappen och dess föräldrar
        openFolder(newFolder.id);
        
        // Automatiskt öppna föräldramappen också
        if (currentParentId) {
          openFolder(currentParentId);
        }
      }
    } catch (error: any) {
      console.error('Fel vid skapande av mapp:', error);
      
      // Visa API-felmeddelande om det finns
      if (error.response && error.response.data) {
        if (error.response.data.name) {
          alert(`Fel: ${error.response.data.name}`);
        } else if (typeof error.response.data === 'string') {
          alert(`Fel: ${error.response.data}`);
        } else {
          alert('Det gick inte att skapa mappen. Försök igen med ett annat namn.');
        }
      } else {
        alert('Det gick inte att skapa mappen. Vänligen försök igen.');
      }
    } finally {
      setNewFolderDialogOpen(false);
      setNewFolderName('');
    }
  };

  // Check if a menu item is active
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <Sheet
      sx={{
        width: 250,
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        position: 'relative',
        overflowX: 'visible',
        '& ul': { overflowX: 'visible !important' }, // Använd !important för att override andra stilar
        '& li': { overflowX: 'visible !important' }, // Samma för list items
      }}
    >
      {/* Header with Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: 56,
        }}
      >
        <Box 
          sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            bgcolor: 'primary.500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5,
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.59 7.41L18.17 11H6v2h12.17l-3.59 3.59L16 18l6-6-6-6-1.41 1.41z"/>
          </svg>
        </Box>
        <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
          ValvX
        </Typography>
        
        {/* Light/Dark mode toggle and collapse button */}
        <Box sx={{ ml: 'auto', display: 'flex' }}>
          <IconButton size="sm" variant="plain" color="neutral">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
            </svg>
          </IconButton>
          <IconButton size="sm" variant="plain" color="neutral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
            </svg>
          </IconButton>
        </Box>
      </Box>

      {/* Search input */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Input
          size="md"
          placeholder="Search"
          startDecorator={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity={0.5}>
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          }
          sx={{ 
            '--Input-radius': '6px',
            bgcolor: 'background.level1'
          }}
        />
      </Box>

      {/* Main navigation menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5 }}>
        <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
          {mainMenuItems.map((item) => (
            <Box key={item.path}>
              <ListItem
                sx={{ 
                  mb: 0.5,
                  ...(isActive(item.path) && {
                    bgcolor: 'primary.50',
                  })
                }}
              >
                <ListItemButton 
                  component={item.submenu.length > 0 ? 'div' : Link} 
                  {...(item.submenu.length === 0 ? { to: item.path } : { onClick: () => toggleSubmenu(item.path) })}
                  sx={{ 
                    py: 1,
                    color: isActive(item.path) ? 'primary.600' : 'neutral.600',
                    fontWeight: isActive(item.path) ? 500 : 400,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: isActive(item.path) ? 'primary.500' : 'neutral.500',
                      mr: 1.5,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <ListItemContent>
                    <Typography level="body-sm">
                      {item.name}
                      {item.badge && (
                        <Box
                          component="span"
                          sx={{
                            ml: 1,
                            px: 0.6,
                            py: 0.1,
                            fontSize: '10px',
                            borderRadius: '4px',
                            bgcolor: 'primary.50',
                            color: 'primary.600',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </Typography>
                  </ListItemContent>
                  {item.submenu.length > 0 && (
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      style={{ 
                        transform: openSubmenus[item.path] ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease-in-out',
                        opacity: 0.5
                      }}
                    >
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Render submenu if it exists and is open */}
              {item.submenu.length > 0 && openSubmenus[item.path] && (
                <List 
                  size="sm" 
                  sx={{ 
                    '--ListItem-radius': '6px',
                    pl: 3,
                    mt: -0.5,
                    mb: 0.5
                  }}
                >
                  {item.submenu.map((subitem: SubmenuItem) => (
                    <ListItem key={subitem.path} sx={{ mb: 0.5 }}>
                      <ListItemButton 
                        component={Link} 
                        to={subitem.path}
                        sx={{ 
                          py: 0.75,
                          pl: 1.5,
                          color: isActive(subitem.path) ? 'primary.600' : 'neutral.600',
                          ...(isActive(subitem.path) && {
                            bgcolor: 'primary.50',
                          })
                        }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            mr: 1.5,
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity={0.5}>
                            {subitem.name.includes('Kanban') && <path d="M4 11h6v8H4zm8-8h6v16h-6z"/>}
                            {subitem.name.includes('Gantt') && <path d="M4 11h6v2H4zm0 4h6v2H4zm0-8h6v2H4zm8 0h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8z"/>}
                            {subitem.name.includes('Ekonomi') && <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>}
                            {subitem.name.includes('Meddelanden') && <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>}
                            {subitem.name.includes('Översikt') && <path d="M16 15h-2V5h2v10zm-8 0H6V5h2v10zm12-7h-2v4h2V8zM8 8H6v4h2V8z"/>}
                            {subitem.name.includes('Design') && <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>}
                            {subitem.name.includes('Byggarbetsplats') && <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>}
                            {subitem.name.includes('Home') && <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>}
                            {subitem.name.includes('Comments') && <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>}
                            {subitem.name.includes('Review Package') && <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>}
                            {subitem.name.includes('Files') && <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>}
                            {subitem.name.includes('Versionsset') && <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>}
                            {subitem.name.includes('Meetings') && <path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 9h4V9h-4V6h-2v3H7v2h4v3h-4v2h4v3h2v-3h4v-2h-4v-3z"/>}
                          </svg>
                        </Box>
                        <ListItemContent>
                          <Typography level="body-sm">
                            {subitem.name}
                          </Typography>
                        </ListItemContent>
                        
                        {/* Add plus button for Files */}
                        {('hasAddButton' in subitem && Boolean(subitem.hasAddButton)) && (
                          <IconButton 
                            size="sm" 
                            variant="plain" 
                            color="neutral"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Öppna dialogen för att skapa en ny mapp
                              handleAddNewFolder(null);
                            }}
                            sx={{ ml: 'auto', opacity: 0.6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                          </IconButton>
                        )}
                      </ListItemButton>
                      

                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          ))}
          
          {/* Visa Filer-menyraden med dropdown-funktion */}
          {openSubmenus['/vault'] && (
            <Box sx={{ 
              ml: 2, 
              mt: 0.5, 
              mb: 1, 
              overflow: 'visible',
              position: 'relative'
            }}>
              <ListItem sx={{ 
                mb: 0.5, 
                overflow: 'visible',
                width: 'auto',
                minWidth: '100%'
              }}>
                <ListItemButton 
                  onClick={() => setOpenFolders(prev => ({...prev, 'files_root': !prev['files_root']}))}
                  component="div"
                  sx={{ 
                    py: 0.75,
                    pl: 1.5,
                    bgcolor: 'rgba(240, 245, 250, 0.7)',
                    color: 'neutral.700',
                    border: '1px solid rgba(240, 245, 250, 0.9)',
                    borderRadius: '6px'
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      mr: 1.5,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity={0.7}>
                      <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                    </svg>
                  </Box>
                  <ListItemContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      width: 'auto !important',
                      minWidth: '100%',
                      flexWrap: 'nowrap',
                      overflow: 'visible !important',
                      maxWidth: 'none !important',
                      whiteSpace: 'nowrap'
                    }}>
                      <Typography 
                        level="body-sm" 
                        fontWeight={500} 
                        sx={{ 
                          whiteSpace: 'nowrap',
                          width: '60px', // Samma bredd som för mappnamn
                          flexShrink: 0
                        }}
                      >
                        Filer
                      </Typography>
                      
                      {/* Inget mellanrum mellan text och plusknapp */}
                      <Box sx={{ 
                        width: '3px', 
                        height: '1px',
                        flexShrink: 0,
                        visibility: 'hidden' // Göm linjen helt
                      }} />
                    </Box>
                  </ListItemContent>
                  
                  <IconButton 
                    size="sm" 
                    variant="plain" 
                    color="neutral"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddNewFolder(null);
                    }}
                    sx={{ 
                      opacity: 0.8,
                      minWidth: '20px',
                      width: '20px',
                      height: '20px',
                      p: '2px'
                    }}
                    title="Skapa ny mapp"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </IconButton>
                </ListItemButton>
              </ListItem>
              
              {/* Visa filsystemet om Filer är expanderad */}
              {openFolders['files_root'] && (
                <Box 
                  className="file-system-container"
                  sx={{
                  maxHeight: '60vh',
                  width: '100%',
                  overflowY: 'auto',
                  overflowX: 'visible',
                  position: 'relative',
                  zIndex: 0,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                  },
                  '& > ul': { 
                    overflow: 'visible !important',
                    width: 'auto !important'
                  },
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                  }
                }}>
                  <List 
                    size="sm" 
                    sx={{ 
                      '--ListItem-radius': '4px',
                      pl: 1.5,
                      mt: 0.5,
                      mb: 0.5,
                      position: 'relative',
                      width: '100%',
                      overflow: 'visible !important',
                      '& > li': {
                        overflow: 'visible !important',
                        width: 'auto !important',
                        maxWidth: 'none !important'
                      }
                    }}
                >
                  {/* Visa laddningsindikator */}
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size="sm" />
                    </Box>
                  ) : (
                    <>
                      {/* Visa mappar på rotnivå */}
                      {filesystemNodes
                        .filter(node => node.parent_id === null)
                        .map(node => (
                          <FileSystemNode 
                            key={node.id} 
                            node={node} 
                            level={0}
                            filesystemNodes={filesystemNodes}
                            openFolders={openFolders}
                            toggleFolder={toggleFolder}
                            handleAddNewFolder={handleAddNewFolder}
                          />
                        ))
                      }
                      
                      {/* Om inga filer/mappar finns, visa en text */}
                      {!isLoading && filesystemNodes.filter(node => node.parent_id === null).length === 0 && (
                        <Typography 
                          level="body-xs" 
                          sx={{ 
                            pl: 2, 
                            py: 1, 
                            color: 'neutral.500', 
                            fontStyle: 'italic' 
                          }}
                        >
                          Inga filer eller mappar
                        </Typography>
                      )}
                    </>
                  )}
                </List>
              </Box>
              )}
            </Box>
          )}
        </List>
      </Box>

      {/* Footer with logout and user info */}
      <Box>
        <Divider />
        <List size="sm">
          <ListItem>
            <ListItemButton component={Link} to={logoutItem.path} sx={{ py: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'neutral.500',
                  mr: 1.5,
                }}
              >
                {logoutItem.icon}
              </Box>
              <ListItemContent>
                <Typography level="body-sm">{logoutItem.name}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>

        {/* User information */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'primary.100',
              color: 'primary.700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              mr: 1.5,
            }}
          >
            TE
          </Box>
          <Box>
            <Typography level="body-sm" fontWeight="bold">
              testproject
            </Typography>
            <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
              project_leader
            </Typography>
          </Box>
          <IconButton size="sm" variant="plain" color="neutral" sx={{ ml: 'auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </IconButton>
        </Box>
      </Box>
      
      {/* Modal för att skapa ny mapp */}
      <Modal open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <ModalDialog>
          <DialogTitle>
            {currentParentId 
              ? `Skapa ny mapp i ${filesystemNodes.find(n => n.id === currentParentId)?.name || 'mapp'}`
              : 'Skapa ny mapp på rotnivå'
            }
          </DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Namn på mappen</FormLabel>
              <Input 
                autoFocus 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim() !== '') {
                    createNewFolder();
                  }
                }}
                placeholder="Ange mappnamn"
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={() => setNewFolderDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={createNewFolder} disabled={newFolderName.trim() === ''}>Skapa</Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
};

export default Sidebar;