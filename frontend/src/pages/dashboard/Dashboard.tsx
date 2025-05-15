import { Box, Typography, Grid, Card } from '@mui/joy';

const Dashboard = () => {
  return (
    <Box>
      <Typography level="h1" component="h1" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Project Summary */}
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Typography level="h3" component="div">
              Projekt
            </Typography>
            <Typography level="h2" component="div" sx={{ mt: 2 }}>
              8
            </Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>
              3 aktiva, 5 avslutade
            </Typography>
          </Card>
        </Grid>

        {/* Tasks Summary */}
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Typography level="h3" component="div">
              Uppgifter
            </Typography>
            <Typography level="h2" component="div" sx={{ mt: 2 }}>
              24
            </Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>
              12 pågående, 8 att göra, 4 klara
            </Typography>
          </Card>
        </Grid>

        {/* Team Summary */}
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Typography level="h3" component="div">
              Team
            </Typography>
            <Typography level="h2" component="div" sx={{ mt: 2 }}>
              6
            </Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>
              Medlemmar i projekt
            </Typography>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid xs={12}>
          <Card sx={{ mt: 2, p: 2 }}>
            <Typography level="h3" component="div" sx={{ mb: 2 }}>
              Senaste aktiviteter
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item} sx={{ 
                  p: 1.5, 
                  borderRadius: 'sm', 
                  bgcolor: 'background.level1',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Typography level="body-sm">
                    Uppgift uppdaterad: Design för mobil
                  </Typography>
                  <Typography level="body-xs">
                    För {item} timmar sedan
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;