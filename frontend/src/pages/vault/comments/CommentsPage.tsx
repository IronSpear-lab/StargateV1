import { Box, Typography } from '@mui/joy';

export default function CommentsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h3" sx={{ mb: 2 }}>Vault - Comments</Typography>
      <Typography>This page displays project comments and discussions.</Typography>
    </Box>
  );
}