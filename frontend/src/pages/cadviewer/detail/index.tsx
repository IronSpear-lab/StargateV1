import React, { useState } from 'react';
import { Box, Typography, Card, Button, Grid, Tabs, TabList, Tab, TabPanel, Sheet } from '@mui/joy';

const CADViewerDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="h2">CAD Detaljvy</Typography>
      
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
            
            <Button 
              variant="soft" 
              color="primary"
              onClick={() => window.open('/sectionbox-viewer', '_blank')}
            >
              Öppna i Sektionsvy
            </Button>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography level="body-sm">
              Detaljvyn visar mer information om CAD-filen så som lager, komponenter och mått.
              Använd flikarna nedanför för att växla mellan olika informationsvyer.
            </Typography>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
        {/* Vänster sida - CAD-visare */}
        <Card sx={{ flexGrow: 3, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography level="h3" color="neutral">
            Välj en CAD-fil för att börja
          </Typography>
        </Card>
        
        {/* Höger sida - Detaljinformation */}
        <Card sx={{ width: '350px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, value) => setActiveTab(value as number)}
            sx={{ borderRadius: 0 }}
          >
            <TabList>
              <Tab>Lager</Tab>
              <Tab>Info</Tab>
              <Tab>Mått</Tab>
            </TabList>
            
            <TabPanel value={0} sx={{ p: 2, height: 'calc(100vh - 220px)', overflow: 'auto' }}>
              <Typography level="body-sm" color="neutral">
                Lagerinformation visas här när en CAD-fil laddas in.
              </Typography>
              
              <Sheet variant="soft" sx={{ p: 2, mt: 2, borderRadius: 'sm' }}>
                <Typography level="body-sm" fontWeight="bold">Lager exempel:</Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>0 (Standard)</li>
                  <li>Väggar</li>
                  <li>Fönster</li>
                  <li>Dörrar</li>
                  <li>Möbler</li>
                  <li>El</li>
                  <li>VVS</li>
                </Box>
              </Sheet>
            </TabPanel>
            
            <TabPanel value={1} sx={{ p: 2, height: 'calc(100vh - 220px)', overflow: 'auto' }}>
              <Typography level="body-sm" color="neutral">
                Filinformation visas här när en CAD-fil laddas in.
              </Typography>
              
              <Sheet variant="soft" sx={{ p: 2, mt: 2, borderRadius: 'sm' }}>
                <Typography level="body-md" fontWeight="bold">Filinformation</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                  <Typography level="body-sm">Filtyp:</Typography>
                  <Typography level="body-sm">DWG</Typography>
                  
                  <Typography level="body-sm">Version:</Typography>
                  <Typography level="body-sm">AutoCAD 2021</Typography>
                  
                  <Typography level="body-sm">Skapad:</Typography>
                  <Typography level="body-sm">2024-05-15</Typography>
                  
                  <Typography level="body-sm">Senast ändrad:</Typography>
                  <Typography level="body-sm">2024-05-19</Typography>
                  
                  <Typography level="body-sm">Antal objekt:</Typography>
                  <Typography level="body-sm">1,245</Typography>
                </Box>
              </Sheet>
            </TabPanel>
            
            <TabPanel value={2} sx={{ p: 2, height: 'calc(100vh - 220px)', overflow: 'auto' }}>
              <Typography level="body-sm" color="neutral">
                Måttinformation visas här när en CAD-fil laddas in.
              </Typography>
              
              <Sheet variant="soft" sx={{ p: 2, mt: 2, borderRadius: 'sm' }}>
                <Typography level="body-md" fontWeight="bold">Mått</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                  <Typography level="body-sm">Bredd:</Typography>
                  <Typography level="body-sm">24.5m</Typography>
                  
                  <Typography level="body-sm">Längd:</Typography>
                  <Typography level="body-sm">36.2m</Typography>
                  
                  <Typography level="body-sm">Höjd:</Typography>
                  <Typography level="body-sm">3.2m</Typography>
                  
                  <Typography level="body-sm">Area:</Typography>
                  <Typography level="body-sm">886.9m²</Typography>
                  
                  <Typography level="body-sm">Volym:</Typography>
                  <Typography level="body-sm">2,838.1m³</Typography>
                </Box>
              </Sheet>
            </TabPanel>
          </Tabs>
        </Card>
      </Box>
    </Box>
  );
};

export default CADViewerDetail;