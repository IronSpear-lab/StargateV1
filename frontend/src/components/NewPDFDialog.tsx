import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Sheet, 
  Modal, 
  ModalDialog,
  Tab,
  TabList,
  Tabs,
  Avatar
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import UploadIcon from '@mui/icons-material/Upload';
import SimpleIFramePDFViewer from './SimpleIFramePDFViewer';

interface PDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

const NewPDFDialog = ({ open, onClose, pdfUrl, filename }: PDFDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('detaljer');
  const [currentZoom, setCurrentZoom] = useState(100);
  
  // Enklare funktioner för zoom som vi kan använda senare
  const zoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 10, 200));
  };
  
  const zoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 10, 50));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        sx={{
          width: '90vw',
          height: '90vh',
          maxWidth: '1400px',
          maxHeight: '800px',
          p: 0,
          overflow: 'hidden',
          borderRadius: 'md',
          boxShadow: 'lg'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
          {/* Header */}
          <Sheet 
            variant="plain"
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              bgcolor: '#f5f5f5', 
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                variant="plain" 
                color="neutral" 
                onClick={onClose}
                sx={{ mr: 1 }}
              >
                <CloseIcon />
              </IconButton>
              <Typography level="title-sm" sx={{ fontWeight: 'bold', mr: 2 }}>{filename}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Kontrollknappar med samma stil som i designen */}
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  '&:hover': { bgcolor: '#3d8b40' },
                  borderRadius: 'sm',
                  minWidth: '45px',
                  width: '45px',
                  height: '35px',
                  px: 1
                }}
                onClick={zoomOut}
              >
                -
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1.5,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {currentZoom}%
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  '&:hover': { bgcolor: '#3d8b40' },
                  borderRadius: 'sm',
                  minWidth: '45px',
                  width: '45px',
                  height: '35px',
                  px: 1
                }}
                onClick={zoomIn}
              >
                +
              </Button>
              
              {/* Funktionsknappar */}
              <Button
                size="sm"
                variant="plain"
                startDecorator={<BookmarkBorderIcon />}
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  '&:hover': { bgcolor: '#3d8b40' },
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1.5,
                  fontSize: '0.875rem'
                }}
              >
                Versioner
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                startDecorator={<UploadIcon />}
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  '&:hover': { bgcolor: '#3d8b40' },
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1.5,
                  fontSize: '0.875rem'
                }}
              >
                Ny version
              </Button>
            </Box>
          </Sheet>
          
          {/* Main content */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* PDF Viewer med en grön vertikal linje på vänster sida */}
            <Box 
              sx={{ 
                flex: 1, 
                bgcolor: '#333',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#333',
                  overflow: 'auto',
                  position: 'relative'
                }}
              >
                {/* "Nuvarande version" badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 2,
                    bgcolor: '#6366f1',
                    color: 'white',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 'md',
                    fontWeight: 'bold'
                  }}
                >
                  Nuvarande version
                </Box>
                
                {/* Visa PDF:en med vår enkla iframe-baserade visare */}
                <SimpleIFramePDFViewer pdfUrl={pdfUrl} filename={filename} />
                
                {/* Grön sidram i vänsterkanten för designen */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '8px',
                    backgroundColor: '#4caf50'
                  }}
                />
              </Box>
            </Box>
            
            {/* Sidebar */}
            <Sheet 
              variant="outlined"
              sx={{
                width: 320,
                display: 'flex',
                flexDirection: 'column',
                borderTop: 'none',
                borderBottom: 'none',
                borderRight: 'none',
              }}
            >
              {/* Tabs */}
              <Tabs 
                value={activeTab}
                onChange={(_, value) => setActiveTab(value as string)}
              >
                <TabList sx={{ borderRadius: 0 }}>
                  <Tab value="detaljer">Detaljer</Tab>
                  <Tab value="historik">Historik</Tab>
                  <Tab value="kommentar">Kommentar</Tab>
                </TabList>
              </Tabs>
              
              {/* Tab content */}
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {activeTab === 'detaljer' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>PDF Anteckning</Typography>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Skapad av
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          size="sm" 
                          sx={{ bgcolor: 'primary.400' }}
                        />
                        <Box>
                          <Typography level="body-sm">user@example.com</Typography>
                          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                            2025-05-16
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Deadline
                      </Typography>
                      <Typography level="body-sm">22 maj 2025</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Granskningspaket
                      </Typography>
                      <Typography level="body-sm">K - Granskning BH Hus 3-4</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Typ
                      </Typography>
                      <Typography level="body-sm">Gransknings kommentar</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Aktivitet
                      </Typography>
                      <Button
                        variant="outlined"
                        color="neutral"
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        VERSIONER
                      </Button>
                    </Box>
                  </>
                )}
                
                {activeTab === 'historik' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Versionshistorik</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Ingen versionshistorik tillgänglig för detta dokument.
                    </Typography>
                  </>
                )}
                
                {activeTab === 'kommentar' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Kommentarer</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Inga kommentarer har lagts till än.
                    </Typography>
                  </>
                )}
              </Box>
            </Sheet>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default NewPDFDialog;