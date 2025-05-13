import React from 'react';
import { Box, Typography } from '@mui/joy';

const ProjectList: React.FC = () => {
  return (
    <Box>
      <Typography level="h2" sx={{ mb: 3 }}>
        Projektlista
      </Typography>
      <Typography>
        Här kommer en lista med projekt att visas.
      </Typography>
    </Box>
  );
};

export default ProjectList;