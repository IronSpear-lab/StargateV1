import React, { useState } from 'react';
import { Box, Typography, Card, Button, Grid, Slider, Stack } from '@mui/joy';

const CADViewerSection: React.FC = () => {
  // Skapa state för att kontrollera sektionsparametrar
  const [xSection, setXSection] = useState<number[]>([0, 100]);
  const [ySection, setYSection] = useState<number[]>([0, 100]);
  const [zSection, setZSection] = useState<number[]>([0, 100]);
  
  const handleXSectionChange = (_: Event, newValue: number | number[]) => {
    setXSection(newValue as number[]);
  };
  
  const handleYSectionChange = (_: Event, newValue: number | number[]) => {
    setYSection(newValue as number[]);
  };
  
  const handleZSectionChange = (_: Event, newValue: number | number[]) => {
    setZSection(newValue as number[]);
  };
  
  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="h2">CAD Sektionsvy</Typography>
      
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
            
            <Button variant="solid" color="primary">
              Sektion PÅ/AV
            </Button>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography level="body-sm">
              Styr sektionsvyn med reglagen nedan. Du kan definiera sektionsplan för X, Y och Z-axlarna.
              Varje reglage kontrollerar start- och slutpunkt för sektionsplanet.
            </Typography>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Vänster sida - Sektion-kontroller */}
        <Card sx={{ p: 2, width: 300 }}>
          <Stack spacing={3}>
            <Box>
              <Typography level="body-md" fontWeight="bold">X-Sektion</Typography>
              <Slider
                value={xSection}
                onChange={handleXSectionChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box>
              <Typography level="body-md" fontWeight="bold">Y-Sektion</Typography>
              <Slider
                value={ySection}
                onChange={handleYSectionChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box>
              <Typography level="body-md" fontWeight="bold">Z-Sektion</Typography>
              <Slider
                value={zSection}
                onChange={handleZSectionChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography level="body-md" fontWeight="bold">Vyer</Typography>
              <Button size="sm" color="primary">Framifrån</Button>
              <Button size="sm" color="primary">Ovanifrån</Button>
              <Button size="sm" color="primary">Från sidan</Button>
              <Button size="sm" color="primary">Isometrisk</Button>
            </Box>
          </Stack>
        </Card>
        
        {/* Höger sida - CAD-visare */}
        <Card sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography level="h3" color="neutral">
            Välj en CAD-fil för att börja
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default CADViewerSection;