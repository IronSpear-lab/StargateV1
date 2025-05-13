import * as React from 'react';
import { 
  Sheet, 
  Typography, 
  Grid, 
  Box, 
  Button, 
  IconButton, 
  Chip 
} from '@mui/joy';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths,
  subMonths
} from 'date-fns';
import { sv } from 'date-fns/locale';

interface Event {
  id: number;
  title: string;
  date: Date;
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
}

interface MonthCalendarProps {
  events?: Event[];
  onEventClick?: (eventId: number) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ events = [], onEventClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Generate dates for the calendar
  const renderDays = () => {
    const dateFormat = 'EEEEEE';
    const days = [];
    
    let startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <Grid key={i} xs={1}>
          <Typography 
            level="body-sm" 
            textAlign="center" 
            sx={{ fontWeight: 'lg', py: 1 }}
          >
            {format(addDays(startDate, i), dateFormat, { locale: sv }).toUpperCase()}
          </Typography>
        </Grid>
      );
    }
    
    return days;
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        
        // Filter events for this day
        const dayEvents = events.filter(event => 
          isSameDay(new Date(event.date), currentDay)
        );
        
        days.push(
          <Grid key={day.toString()} xs={1}>
            <Box
              sx={{
                p: 0.5,
                height: '100px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isCurrentMonth ? 'background.surface' : 'background.level1',
                ...(isToday && {
                  borderColor: 'primary.outlinedBorder',
                  borderWidth: '2px',
                }),
                '&:hover': {
                  backgroundColor: 'background.level1',
                },
              }}
            >
              <Typography
                level="body-sm"
                sx={{
                  textAlign: 'center',
                  fontWeight: isToday ? 'lg' : 'md',
                  color: !isCurrentMonth ? 'text.tertiary' : 'text.primary',
                  backgroundColor: isToday ? 'primary.softBg' : 'transparent',
                  borderRadius: '4px',
                  py: 0.5,
                }}
              >
                {format(day, 'd')}
              </Typography>
              
              <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {dayEvents.map((event) => (
                  <Chip
                    key={event.id}
                    size="sm"
                    variant="soft"
                    color={event.color || 'primary'}
                    onClick={() => onEventClick && onEventClick(event.id)}
                    sx={{ 
                      cursor: onEventClick ? 'pointer' : 'default',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%'
                    }}
                  >
                    {event.title}
                  </Chip>
                ))}
              </Box>
            </Box>
          </Grid>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <Grid container spacing={0} key={day.toString()}>
          {days}
        </Grid>
      );
      
      days = [];
    }
    
    return rows;
  };
  
  return (
    <Sheet 
      variant="outlined"
      sx={{ 
        borderRadius: 'md',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography level="title-lg">
            {format(currentMonth, 'MMMM yyyy', { locale: sv })}
          </Typography>
          <Button 
            size="sm" 
            variant="soft" 
            color="neutral"
            startDecorator={<TodayIcon />}
            onClick={goToToday}
          >
            Idag
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton variant="soft" color="neutral" onClick={prevMonth}>
            <PrevIcon />
          </IconButton>
          <IconButton variant="soft" color="neutral" onClick={nextMonth}>
            <NextIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ p: 1, flex: 1, overflow: 'auto' }}>
        <Grid container spacing={0}>
          {renderDays()}
        </Grid>
        {renderCells()}
      </Box>
    </Sheet>
  );
};

export default MonthCalendar;