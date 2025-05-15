import { Box, Typography } from '@mui/joy';

export default function VersionsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h3" sx={{ mb: 2 }}>Vault - Versions</Typography>
      <Typography>This page shows version history and change tracking for project files.</Typography>
    </Box>
  );
}