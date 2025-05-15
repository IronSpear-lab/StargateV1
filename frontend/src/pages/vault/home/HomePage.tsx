import { Box, Typography } from '@mui/joy';

export default function HomePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h3" sx={{ mb: 2 }}>Vault - Home</Typography>
      <Typography>Welcome to the Vault homepage. This is where you can access all your project information.</Typography>
    </Box>
  );
}