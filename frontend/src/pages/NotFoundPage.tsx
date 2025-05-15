import { Box, Typography, Button } from '@mui/joy';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 2,
      }}
    >
      <Typography level="h1" component="h1" sx={{ mb: 2, fontSize: '3rem' }}>
        404
      </Typography>
      <Typography level="h3" component="div" sx={{ mb: 4 }}>
        Sidan kunde inte hittas
      </Typography>
      <Typography level="body-md" sx={{ mb: 4 }}>
        Sidan du letar efter finns inte eller har flyttats.
      </Typography>
      <Button component={Link} to="/" size="lg">
        Gå till startsidan
      </Button>
    </Box>
  );
};

export default NotFoundPage;