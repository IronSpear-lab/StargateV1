import { Box, Typography } from '@mui/joy';

export default function MeetingsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h3" sx={{ mb: 2 }}>Vault - Meetings</Typography>
      <Typography>This page contains meeting schedules, agendas, and minutes.</Typography>
    </Box>
  );
}