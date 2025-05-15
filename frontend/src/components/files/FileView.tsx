import { useState } from 'react';
import { 
  Box, 
  Sheet, 
  Typography, 
  Button,
  Grid,
  Card,
  AspectRatio,
  Stack
} from '@mui/joy';
import { FileNode } from '../../types/files';

interface FileViewProps {
  selectedFile: FileNode | null;
}

export default function FileView({ selectedFile }: FileViewProps) {
  const [viewType, setViewType] = useState<'details' | 'preview'>('details');
  
  if (!selectedFile) {
    return (
      <Sheet
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'divider',
          p: 4,
          color: 'neutral.500'
        }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity={0.3}>
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        <Typography level="body-lg" sx={{ mt: 2 }}>
          Select a file to view details
        </Typography>
      </Sheet>
    );
  }

  // Funktion för att formatera datum
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Funktion för att formatera filstorlek
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Bestäm filtyp-ikon baserat på filtyp
  const getFileIcon = () => {
    const fileType = selectedFile.file_type?.toLowerCase() || '';
    
    // Dokumentfiler
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileType)) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#4361EE">
          <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
      );
    }
    
    // Bildfiler
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileType)) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#4361EE">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      );
    }
    
    // Default-ikon
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="#4361EE">
        <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
      </svg>
    );
  };

  return (
    <Sheet
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'divider',
        p: 0,
        overflow: 'hidden'
      }}
    >
      {/* Fil-header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.surface'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getFileIcon()}
          <Box sx={{ ml: 2 }}>
            <Typography level="title-lg">{selectedFile.name}</Typography>
            <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
              {selectedFile.path}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            color="primary"
            startDecorator={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            }
            sx={{ mr: 1 }}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            }
          >
            Share
          </Button>
        </Box>
      </Box>

      {/* Navigationsknapp för detaljer/förhandsvisning */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.level1'
        }}
      >
        <Button
          variant={viewType === 'details' ? 'soft' : 'plain'} 
          color={viewType === 'details' ? 'primary' : 'neutral'}
          onClick={() => setViewType('details')}
          sx={{ 
            borderRadius: 0,
            flex: 1,
            py: 1
          }}
        >
          Details
        </Button>
        <Button
          variant={viewType === 'preview' ? 'soft' : 'plain'} 
          color={viewType === 'preview' ? 'primary' : 'neutral'}
          onClick={() => setViewType('preview')}
          sx={{ 
            borderRadius: 0,
            flex: 1,
            py: 1
          }}
        >
          Preview
        </Button>
      </Box>

      {/* Innehållssektion */}
      <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
        {viewType === 'details' ? (
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Typography level="title-sm" sx={{ mb: 1 }}>File Information</Typography>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <Typography level="body-xs" color="neutral">File Name</Typography>
                    <Typography level="body-sm">{selectedFile.name}</Typography>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Typography level="body-xs" color="neutral">File Type</Typography>
                    <Typography level="body-sm">{selectedFile.file_type || 'Unknown'}</Typography>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Typography level="body-xs" color="neutral">File Size</Typography>
                    <Typography level="body-sm">{formatFileSize(selectedFile.size)}</Typography>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Typography level="body-xs" color="neutral">Created</Typography>
                    <Typography level="body-sm">{formatDate(selectedFile.created_at)}</Typography>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Typography level="body-xs" color="neutral">Last Modified</Typography>
                    <Typography level="body-sm">{formatDate(selectedFile.updated_at)}</Typography>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Typography level="body-xs" color="neutral">Path</Typography>
                    <Typography level="body-sm">{selectedFile.path}</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid xs={12} sx={{ mt: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>Related Information</Typography>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity={0.7} style={{ marginRight: 8 }}>
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    <Typography level="body-sm">2 versions of this file</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity={0.7} style={{ marginRight: 8 }}>
                      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    <Typography level="body-sm">3 comments</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 2
            }}
          >
            <Card 
              variant="outlined" 
              sx={{ 
                width: '100%', 
                maxWidth: 500, 
                mx: 'auto', 
                boxShadow: 'md'
              }}
            >
              <Typography level="body-xs" textAlign="center">
                Preview not available
              </Typography>
              <AspectRatio ratio="4/3" sx={{ mt: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.level2'
                  }}
                >
                  {getFileIcon()}
                  <Typography level="body-sm" sx={{ mt: 2 }}>
                    {selectedFile.name}
                  </Typography>
                </Box>
              </AspectRatio>
            </Card>
          </Box>
        )}
      </Box>
    </Sheet>
  );
}