import React from 'react';
import { Box, Typography } from '@mui/joy';

const Wiki: React.FC = () => {
  return (
    <Box>
      <Typography level="h2" sx={{ mb: 3 }}>
        Wiki
      </Typography>
      <Typography>
        Här kommer projektets wiki att visas.
      </Typography>
    </Box>
  );
};

export default Wiki;