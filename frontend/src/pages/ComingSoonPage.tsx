import React from 'react';
import { Box, Typography, Card } from '@mui/joy';

interface ComingSoonPageProps {
  title: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h2" sx={{ mb: 3 }}>{title}</Typography>
      
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography level="h3" sx={{ mb: 2 }}>Kommer snart</Typography>
        <Typography>
          Vi arbetar på denna funktion och den kommer att lanseras inom kort.
        </Typography>
      </Card>
    </Box>
  );
};

export default ComingSoonPage;