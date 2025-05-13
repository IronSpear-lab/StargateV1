import React from 'react';
import { Box, Typography } from '@mui/joy';
import { useParams } from 'react-router-dom';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Typography level="h2" sx={{ mb: 3 }}>
        Projektdetaljer
      </Typography>
      <Typography>
        Visar detaljer för projekt med ID: {id}
      </Typography>
    </Box>
  );
};

export default ProjectDetails;