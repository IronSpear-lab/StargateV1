import { useState } from 'react';
import { Box, Grid, Typography, Breadcrumbs, Link, Divider } from '@mui/joy';
import FileBrowser from '../../../components/files/FileBrowser';
import FileView from '../../../components/files/FileView';
import { FileNode } from '../../../types/files';
import { v4 as uuidv4 } from 'uuid';

// Exempeldata för att demonstrera filsystemet
const generateInitialFiles = (): FileNode[] => {
  const now = new Date();
  
  // Skapa root-mappen
  const root: FileNode = {
    id: 'root',
    name: 'Root',
    type: 'folder',
    parent_id: null,
    path: '/',
    created_at: now,
    updated_at: now
  };
  
  // Skapa några huvudmappar
  const documents: FileNode = {
    id: uuidv4(),
    name: 'Documents',
    type: 'folder',
    parent_id: 'root',
    path: '/Documents',
    created_at: now,
    updated_at: now
  };
  
  const images: FileNode = {
    id: uuidv4(),
    name: 'Images',
    type: 'folder',
    parent_id: 'root',
    path: '/Images',
    created_at: now,
    updated_at: now
  };
  
  const projectPlans: FileNode = {
    id: uuidv4(),
    name: 'Project Plans',
    type: 'folder',
    parent_id: documents.id,
    path: '/Documents/Project Plans',
    created_at: now,
    updated_at: now
  };
  
  // Skapa några filer
  const files: FileNode[] = [
    {
      id: uuidv4(),
      name: 'Requirements.pdf',
      type: 'file',
      parent_id: projectPlans.id,
      path: '/Documents/Project Plans/Requirements.pdf',
      created_at: now,
      updated_at: now,
      size: 1024 * 1024 * 2.5, // 2.5 MB
      file_type: 'pdf',
      url: '/files/requirements.pdf'
    },
    {
      id: uuidv4(),
      name: 'Schedule.xlsx',
      type: 'file',
      parent_id: projectPlans.id,
      path: '/Documents/Project Plans/Schedule.xlsx',
      created_at: now,
      updated_at: now,
      size: 1024 * 512, // 512 KB
      file_type: 'xlsx',
      url: '/files/schedule.xlsx'
    },
    {
      id: uuidv4(),
      name: 'Project Overview.docx',
      type: 'file',
      parent_id: documents.id,
      path: '/Documents/Project Overview.docx',
      created_at: now,
      updated_at: now,
      size: 1024 * 1024 * 1.2, // 1.2 MB
      file_type: 'docx',
      url: '/files/project_overview.docx'
    },
    {
      id: uuidv4(),
      name: 'Logo.png',
      type: 'file',
      parent_id: images.id,
      path: '/Images/Logo.png',
      created_at: now,
      updated_at: now,
      size: 1024 * 256, // 256 KB
      file_type: 'png',
      url: '/files/logo.png'
    }
  ];
  
  return [root, documents, images, projectPlans, ...files];
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileNode[]>(generateInitialFiles());
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>(['Root']);
  
  // Hantera val av fil
  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    
    // Uppdatera brödsmulor baserat på den valda filens sökväg
    const pathParts = file.path.split('/').filter(Boolean);
    
    if (pathParts.length === 0) {
      setCurrentPath(['Root']);
    } else {
      setCurrentPath(['Root', ...pathParts]);
    }
  };
  
  // Hantera ändringar i filer (t.ex. nya mappar)
  const handleFilesChange = (newFiles: FileNode[]) => {
    setFiles(newFiles);
  };
  
  // Hantera klick på brödsmulor
  const handleBreadcrumbClick = (index: number) => {
    // Om användaren klickar på en brödsmula, navigera till den mappen
    if (index === 0) {
      // Root
      const rootFolder = files.find(f => f.id === 'root');
      if (rootFolder) {
        handleFileSelect(rootFolder);
      }
    } else {
      // Bygg sökvägen baserat på den klickade nivån
      const path = '/' + currentPath.slice(1, index + 1).join('/');
      
      // Hitta mappen på den sökvägen
      const folder = files.find(f => f.path === path && f.type === 'folder');
      
      if (folder) {
        handleFileSelect(folder);
      }
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      {/* Sidhuvud */}
      <Box sx={{ mb: 3 }}>
        <Typography level="h3" sx={{ mb: 1 }}>Files</Typography>
        
        {/* Brödsmulor */}
        <Breadcrumbs size="sm" sx={{ px: 0 }}>
          {currentPath.map((part, index) => (
            <Link
              key={index}
              color={index === currentPath.length - 1 ? 'primary' : 'neutral'}
              fontWeight={index === currentPath.length - 1 ? 'bold' : 'normal'}
              onClick={() => handleBreadcrumbClick(index)}
              sx={{ cursor: 'pointer' }}
            >
              {part}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Huvudinnehåll */}
      <Grid container spacing={3} sx={{ height: 'calc(100% - 100px)' }}>
        {/* Filutforskare (vänster) */}
        <Grid xs={12} md={4} lg={3} sx={{ height: '100%' }}>
          <FileBrowser 
            files={files}
            onFileSelect={handleFileSelect}
            onFilesChange={handleFilesChange}
          />
        </Grid>
        
        {/* Filvisning (höger) */}
        <Grid xs={12} md={8} lg={9} sx={{ height: '100%' }}>
          <FileView selectedFile={selectedFile} />
        </Grid>
      </Grid>
    </Box>
  );
}