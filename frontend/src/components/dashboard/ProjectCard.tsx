import * as React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  LinearProgress, 
  AspectRatio,
  CardOverflow 
} from '@mui/joy';
import { 
  AccessTime as TimeIcon,
  Person as PersonIcon 
} from '@mui/icons-material';

interface ProjectCardProps {
  id: number;
  name: string;
  description: string;
  progress: number;
  dueDate?: string;
  memberCount: number;
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
  imageSrc?: string;
  onClick?: (id: number) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  progress,
  dueDate,
  memberCount,
  color = 'primary',
  imageSrc,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Card
      variant="outlined"
      onClick={handleClick}
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'md',
        },
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {imageSrc && (
        <CardOverflow>
          <AspectRatio ratio="2">
            <img
              src={imageSrc}
              alt={name}
              style={{ objectFit: 'cover' }}
            />
          </AspectRatio>
        </CardOverflow>
      )}
      <CardContent>
        <Typography level="title-md">{name}</Typography>
        <Typography level="body-sm" sx={{ mt: 0.5, mb: 2, minHeight: '2.5em' }}>
          {description.length > 100 ? `${description.substring(0, 97)}...` : description}
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Typography level="body-xs" sx={{ mb: 0.5 }}>
            Framsteg: {progress}%
          </Typography>
          <LinearProgress 
            determinate 
            value={progress} 
            color={color} 
            thickness={8}
            sx={{ borderRadius: 10 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {dueDate && (
            <Chip
              size="sm" 
              variant="soft" 
              color={color}
              startDecorator={<TimeIcon />}
            >
              {dueDate}
            </Chip>
          )}
          <Chip
            size="sm" 
            variant="soft" 
            color="neutral"
            startDecorator={<PersonIcon />}
          >
            {memberCount}
          </Chip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;