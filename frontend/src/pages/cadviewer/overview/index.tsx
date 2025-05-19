import React, { useState } from 'react';
import { Box, Typography, Card, Button, Grid, Chip } from '@mui/joy';
import FreeCadViewer from './FreeCadViewer';

const CADViewerOverview: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'demo' | 'file' | 'none'>('none');
  const [filePath, setFilePath] = useState<string | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setSelectedFile(files[0]);
    setFilePath(URL.createObjectURL(files[0]));
    setViewMode('file');
  };
  
  const handleShowDemo = () => {
    setSelectedFile(null);
    setFilePath(null);
    setViewMode('demo');
  };
  
  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="h2">CAD Översikt - FreeCAD Viewer</Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box component="label" htmlFor="upload-cad">
              <Button component="span">
                Ladda upp CAD-fil
              </Button>
              <input
                id="upload-cad"
                type="file"
                accept=".dwg,.dxf,.dgn,.fcstd,.stp,.step,.iges,.igs,.stl,.obj"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>
            
            <Button 
              variant="soft" 
              color="primary"
              onClick={handleShowDemo}
            >
              Visa FreeCAD demo
            </Button>
            
            <Button
              variant="soft"
              color="success"
              onClick={() => window.open('/sectionbox-viewer', '_blank')}
            >
              Öppna sektionsvy
            </Button>
            
            {selectedFile && (
              <Chip color="primary" sx={{ ml: 'auto' }}>
                {selectedFile.name}
              </Chip>
            )}
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography level="body-sm">
              FreeCAD Viewer kan visa olika CAD-format inklusive FCSTD, STEP, IGES, STL, OBJ och mer.
              Visaren har stöd för 3D-navigation där du kan rotera, zooma och panorera med musen.
              Ladda upp en CAD-fil eller testa demovisningen för att komma igång.
            </Typography>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        {viewMode === 'none' ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            gap: 2
          }}>
            <Typography level="h3" color="neutral">
              Välj en CAD-fil eller visa demo
            </Typography>
            <Typography level="body-md" color="neutral">
              Stöd för FreeCAD, STEP, IGES, STL och andra format
            </Typography>
          </Box>
        ) : (
          <FreeCadViewer 
            filePath={filePath || undefined} 
            demoMode={viewMode === 'demo'} 
          />
        )}
      </Card>
    </Box>
  );
};

export default CADViewerOverview;