import { useState, useEffect } from 'react';
import { 
  Box, 
  Sheet, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent, 
  IconButton, 
  Typography,
  Menu,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Input
} from '@mui/joy';
import { FileNode, FileTreeNode } from '../../types/files';
import { 
  buildFileTree, 
  createFolder, 
  toggleFolderExpanded
} from '../../utils/fileSystemUtils';

interface FileBrowserProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  onFilesChange?: (files: FileNode[]) => void;
}

export default function FileBrowser({ 
  files, 
  onFileSelect, 
  onFilesChange 
}: FileBrowserProps) {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [menuTargetId, setMenuTargetId] = useState<string | null>(null);
  const [contextMenuIsFolder, setContextMenuIsFolder] = useState<boolean>(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // Bygg filträdet när filer ändras
  useEffect(() => {
    const tree = buildFileTree(files);
    setFileTree(tree);
  }, [files]);

  // Hantera klick på en fil
  const handleFileClick = (file: FileNode) => {
    setSelectedNodeId(file.id);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Hantera expandering/ihopfällning av mappar
  const handleFolderToggle = (folderId: string) => {
    const updatedTree = toggleFolderExpanded(fileTree, folderId);
    setFileTree(updatedTree);
  };

  // Visa kontextmenyn
  const handleContextMenu = (
    event: React.MouseEvent, 
    nodeId: string,
    nodeIsFolder: boolean
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({ top: event.clientY, left: event.clientX });
    setMenuTargetId(nodeId);
    // Spara även om det är en mapp eller fil för att kunna anpassa kontextmenyn
    setContextMenuIsFolder(nodeIsFolder);
  };

  // Stäng kontextmenyn
  const handleCloseMenu = () => {
    setMenuPosition(null);
    setMenuTargetId(null);
    setContextMenuIsFolder(false);
  };

  // Öppna dialogrutan för att skapa en ny mapp
  const handleNewFolderClick = (parentId: string | null) => {
    setCurrentParentId(parentId);
    setNewFolderName('');
    setNewFolderDialogOpen(true);
    handleCloseMenu();
  };

  // Skapa en ny mapp
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = createFolder(currentParentId, newFolderName, files);
    
    if (onFilesChange) {
      onFilesChange([...files, newFolder]);
    }
    
    setNewFolderDialogOpen(false);
  };

  // Rekursiv funktion för att rita upp filer och mappar
  const renderNode = (node: FileTreeNode) => {
    const isFolder = node.type === 'folder';
    const isExpanded = node.isExpanded;

    return (
      <Box key={node.id} sx={{ ml: node.level * 1.5 }}>
        <ListItem 
          sx={{ 
            my: 0.5, 
            bgcolor: selectedNodeId === node.id ? 'primary.50' : 'transparent',
            borderRadius: 'sm',
            p: 0
          }}
        >
          <ListItemButton
            onClick={() => isFolder ? handleFolderToggle(node.id) : handleFileClick(node)}
            onContextMenu={(e) => handleContextMenu(e, node.id, isFolder)}
            sx={{ py: 0.5, px: 1 }}
          >
            <Box
              sx={{ 
                width: 24, 
                height: 24, 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
                color: isFolder ? 'primary.500' : 'neutral.500'
              }}
            >
              {/* Ikoner för fil/mapp */}
              {isFolder ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  {isExpanded ? (
                    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
                  ) : (
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                  )}
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                </svg>
              )}
            </Box>
            <ListItemContent>
              <Typography level="body-sm">{node.name}</Typography>
            </ListItemContent>
            
            {/* Plus-knapp för mappar */}
            {isFolder && (
              <IconButton 
                size="sm" 
                variant="plain" 
                color="neutral"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNewFolderClick(node.id);
                }}
                sx={{ opacity: 0.6, ml: 'auto' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>

        {/* Render children if folder is expanded */}
        {isFolder && isExpanded && (
          <Box>
            {node.children.map(childNode => renderNode(childNode))}
            
            {/* Render files inside the folder */}
            {node.files.map(file => (
              <Box key={file.id} sx={{ ml: (node.level + 1) * 1.5 }}>
                <ListItem 
                  sx={{ 
                    my: 0.5, 
                    bgcolor: selectedNodeId === file.id ? 'primary.50' : 'transparent',
                    borderRadius: 'sm',
                    p: 0
                  }}
                >
                  <ListItemButton
                    onClick={() => handleFileClick(file)}
                    onContextMenu={(e) => handleContextMenu(e, file.id, false)}
                    sx={{ py: 0.5, px: 1 }}
                  >
                    <Box
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1,
                        color: 'neutral.500'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                      </svg>
                    </Box>
                    <ListItemContent>
                      <Typography level="body-sm">{file.name}</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Sheet 
        sx={{ 
          height: '100%', 
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'divider',
          p: 1
        }}
      >
        {/* Sidhuvud med ny mapp-knapp */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            mb: 1
          }}
        >
          <Typography level="title-sm">File Explorer</Typography>
          <IconButton 
            size="sm" 
            variant="outlined" 
            color="neutral"
            onClick={() => handleNewFolderClick(null)}
            title="New folder"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"/>
            </svg>
          </IconButton>
        </Box>

        {/* Filträd */}
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100% - 50px)' }}>
          <List size="sm">
            {fileTree.map(node => renderNode(node))}
          </List>
        </Box>

        {/* Kontextmeny */}
        {menuPosition && (
          <Menu
            open={Boolean(menuPosition)}
            onClose={handleCloseMenu}
            placement="bottom-start"
            sx={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {contextMenuIsFolder && (
              <MenuItem onClick={() => handleNewFolderClick(menuTargetId)}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </Box>
                New Folder
              </MenuItem>
            )}
            <MenuItem>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </Box>
              Rename
            </MenuItem>
            <MenuItem sx={{ color: 'danger.500' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5, color: 'inherit' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </Box>
              Delete
            </MenuItem>
          </Menu>
        )}

        {/* Dialog för att skapa ny mapp */}
        <Modal open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
          <ModalDialog>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogContent>
              <FormControl>
                <FormLabel>Folder Name</FormLabel>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button variant="plain" color="neutral" onClick={() => setNewFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>Create</Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </Sheet>
    </Box>
  );
}