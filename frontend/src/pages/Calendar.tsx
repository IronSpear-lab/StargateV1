import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Button, Modal, ModalDialog, CircularProgress } from '@mui/joy';
import { Add as AddIcon } from '@mui/icons-material';
import { MonthCalendar, EventList } from '../components/calendar';
import { CalendarEvent } from '../types';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Anrop till API för att hämta kalenderhändelser skulle ske här
        // För tillfället använder vi tomma data
        setEvents([]);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const handleEventClick = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setOpen(true);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h2">Kalender</Typography>
        <Button 
          startDecorator={<AddIcon />}
          onClick={handleCreateEvent}
        >
          Lägg till händelse
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Månadskalender */}
        <Grid xs={12} lg={8}>
          <MonthCalendar 
            events={events}
            onEventClick={handleEventClick}
          />
        </Grid>
        
        {/* Kommande händelser */}
        <Grid xs={12} lg={4}>
          <EventList 
            events={events}
            title="Kommande händelser"
            onEventClick={handleEventClick}
          />
        </Grid>
      </Grid>
      
      {/* Modal för att visa/redigera händelse */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog 
          aria-labelledby="event-dialog-title"
          sx={{ maxWidth: 500 }}
        >
          <Typography id="event-dialog-title" level="h4">
            {selectedEvent ? 'Visa händelse' : 'Skapa ny händelse'}
          </Typography>
          
          {/* Här skulle ett formulär för att skapa/redigera händelser visas */}
          <Box sx={{ mt: 2 }}>
            {selectedEvent ? (
              <Box>
                <Typography level="title-md">{selectedEvent.title}</Typography>
                <Typography level="body-md">
                  Datum: {selectedEvent.date.toLocaleDateString()}
                </Typography>
                <Typography level="body-md">
                  Typ: {selectedEvent.type}
                </Typography>
                {selectedEvent.location && (
                  <Typography level="body-md">
                    Plats: {selectedEvent.location}
                  </Typography>
                )}
                {selectedEvent.projectName && (
                  <Typography level="body-md">
                    Projekt: {selectedEvent.projectName}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography level="body-md">
                Här skulle ett formulär för att skapa händelser visas.
              </Typography>
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Calendar;