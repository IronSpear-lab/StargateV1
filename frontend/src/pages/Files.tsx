import React from 'react';
import { Box, Typography } from '@mui/joy';

const Files: React.FC = () => {
  return (
    <Box>
      <Typography level="h2" sx={{ mb: 3 }}>
        Filer
      </Typography>
      <Typography>
        Här kommer en filhanterare att visas.
      </Typography>
    </Box>
  );
};

export default Files;