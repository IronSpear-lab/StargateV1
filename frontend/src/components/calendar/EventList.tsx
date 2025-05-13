import * as React from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent, 
  ListItemDecorator,
  Typography, 
  Sheet, 
  Box,
  Chip
} from '@mui/joy';
import {
  EventNote as EventIcon,
  Event as MeetingIcon,
  Article as TaskIcon,
  CalendarMonth as DateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

type EventType = 'meeting' | 'task' | 'deadline';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: EventType;
  projectName?: string;
  location?: string;
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
}

interface EventListProps {
  events: CalendarEvent[];
  title?: string;
  onEventClick?: (eventId: number) => void;
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'meeting':
      return <MeetingIcon />;
    case 'task':
      return <TaskIcon />;
    case 'deadline':
      return <DateIcon />;
    default:
      return <EventIcon />;
  }
};

const getEventColor = (type: EventType, colorOverride?: string) => {
  if (colorOverride) return colorOverride;
  
  switch (type) {
    case 'meeting':
      return 'primary';
    case 'task':
      return 'success';
    case 'deadline':
      return 'warning';
    default:
      return 'neutral';
  }
};

const getEventTypeLabel = (type: EventType) => {
  switch (type) {
    case 'meeting':
      return 'Möte';
    case 'task':
      return 'Uppgift';
    case 'deadline':
      return 'Deadline';
    default:
      return 'Händelse';
  }
};

export const EventList: React.FC<EventListProps> = ({ 
  events,
  title = 'Kommande händelser',
  onEventClick
}) => {
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
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
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography level="title-md">{title}</Typography>
        <Typography level="body-sm" color="neutral">
          {sortedEvents.length} {sortedEvents.length === 1 ? 'händelse' : 'händelser'}
        </Typography>
      </Box>
      
      <List size="sm" sx={{ overflow: 'auto', flex: 1 }}>
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <ListItem key={event.id}>
              <ListItemButton onClick={() => onEventClick && onEventClick(event.id)}>
                <ListItemDecorator 
                  sx={{ 
                    color: `${getEventColor(event.type, event.color as any)}.solidColor` 
                  }}
                >
                  {getEventIcon(event.type)}
                </ListItemDecorator>
                <ListItemContent>
                  <Typography level="body-sm">{event.title}</Typography>
                  <Typography level="body-xs" color="neutral">
                    {format(new Date(event.date), 'PPP', { locale: sv })}
                    {event.projectName && ` • ${event.projectName}`}
                    {event.location && ` • ${event.location}`}
                  </Typography>
                </ListItemContent>
                <Chip
                  size="sm"
                  variant="soft"
                  color={getEventColor(event.type, event.color as any) as any}
                >
                  {getEventTypeLabel(event.type)}
                </Chip>
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemContent>
              <Typography level="body-sm" color="neutral" sx={{ textAlign: 'center', py: 2 }}>
                Inga händelser att visa
              </Typography>
            </ListItemContent>
          </ListItem>
        )}
      </List>
    </Sheet>
  );
};

export default EventList;