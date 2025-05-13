import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, ModalDialog, CircularProgress, Grid, Tabs, TabList, Tab } from '@mui/joy';
import { Add as AddIcon } from '@mui/icons-material';
import { TaskList } from '../components/dashboard';
import { Task, TaskStatus } from '../types';
import projectService from '../services/projectService';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // Anrop till API för att hämta uppgifter
        // setTasks(response.results);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  const handleTaskClick = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setOpen(true);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: string | number | null) => {
    if (newValue) {
      setActiveTab(newValue as TaskStatus | 'all');
    }
  };

  // Filtera uppgifter baserat på vald flik
  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === activeTab);

  // Transformera uppgifter till TaskList-komponenten
  const mappedTasks = filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    projectName: 'Projekt' // Detta skulle ersättas med faktiskt projektnamn
  }));

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
        <Typography level="h2">Uppgifter</Typography>
        <Button 
          startDecorator={<AddIcon />}
          onClick={handleCreateTask}
        >
          Skapa uppgift
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Uppgiftsstatus"
        >
          <TabList>
            <Tab value="all">Alla</Tab>
            <Tab value="todo">Att göra</Tab>
            <Tab value="in_progress">Pågående</Tab>
            <Tab value="review">Granskning</Tab>
            <Tab value="done">Klart</Tab>
          </TabList>
        </Tabs>
      </Box>
      
      <Grid container spacing={2}>
        <Grid xs={12}>
          <TaskList 
            tasks={mappedTasks}
            title="Mina uppgifter"
            onTaskClick={handleTaskClick}
          />
        </Grid>
      </Grid>
      
      {/* Modal för att visa/redigera uppgift */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog 
          aria-labelledby="task-dialog-title"
          sx={{ maxWidth: 500 }}
        >
          <Typography id="task-dialog-title" level="h4">
            {selectedTask ? 'Visa uppgift' : 'Skapa ny uppgift'}
          </Typography>
          
          {/* Här skulle ett formulär för att skapa/redigera uppgifter visas */}
          <Box sx={{ mt: 2 }}>
            {selectedTask ? (
              <Box>
                <Typography level="title-md">{selectedTask.title}</Typography>
                <Typography level="body-md">
                  Beskrivning: {selectedTask.description}
                </Typography>
                <Typography level="body-md">
                  Status: {selectedTask.status}
                </Typography>
                <Typography level="body-md">
                  Prioritet: {selectedTask.priority}
                </Typography>
                {selectedTask.due_date && (
                  <Typography level="body-md">
                    Förfallodatum: {selectedTask.due_date}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography level="body-md">
                Här skulle ett formulär för att skapa uppgifter visas.
              </Typography>
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Tasks;