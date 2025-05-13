import * as React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/joy';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
  progress?: number;
  trend?: number;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  progress,
  trend,
  subtitle
}) => {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm" color="neutral">
            {title}
          </Typography>
          <Box 
            sx={{ 
              p: 0.5, 
              borderRadius: '50%', 
              bgcolor: `${color}.softBg`,
              color: `${color}.solidColor` 
            }}
          >
            {icon}
          </Box>
        </Box>
        
        <Typography level="h3" fontWeight="lg">
          {value}
        </Typography>
        
        {subtitle && (
          <Typography level="body-xs" color="neutral">
            {subtitle}
          </Typography>
        )}
        
        {typeof progress === 'number' && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress 
              determinate 
              value={progress} 
              color={color} 
              sx={{ borderRadius: 10 }}
            />
          </Box>
        )}
        
        {typeof trend === 'number' && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1,
              color: trend >= 0 ? 'success.500' : 'danger.500'
            }}
          >
            <Typography level="body-sm">
              {trend >= 0 ? '+' : ''}{trend}%
            </Typography>
            <Typography level="body-xs" color="neutral" sx={{ ml: 1 }}>
              sedan föregående period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;