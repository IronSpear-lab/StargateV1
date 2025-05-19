import React from 'react';
import { Box, Typography, Card, Button, Grid } from '@mui/joy';

const CADViewerOverview: React.FC = () => {
  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="h2">CAD Översikt</Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2, display: 'flex', gap: 2 }}>
            <Box component="label" htmlFor="upload-cad">
              <Button component="span">
                Ladda upp CAD-fil
              </Button>
              <input
                id="upload-cad"
                type="file"
                accept=".dwg,.dxf,.dgn"
                style={{ display: 'none' }}
              />
            </Box>
            
            <Button variant="soft" color="primary">
              Visa exempel
            </Button>
            
            <Button
              variant="soft"
              color="success"
              onClick={() => window.open('/sectionbox-viewer', '_blank')}
            >
              Öppna sektionsvy
            </Button>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography level="body-sm">
              Denna CAD-visare kan visa DWG, DXF och DGN filer. Ladda upp en CAD-fil eller använd exempelmodellen.
              Du kan navigera genom att klicka och dra, zooma med scrollhjulet och aktivera sektionsvy för att se specifika delar.
            </Typography>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography level="h3" color="neutral">
          Välj en CAD-fil för att börja
        </Typography>
      </Card>
    </Box>
  );
};

export default CADViewerOverview;