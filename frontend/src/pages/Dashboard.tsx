import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/joy';
import { 
  Assessment as ReportIcon,
  Alarm as TimeIcon,
  CheckCircleOutline as CompletedIcon,
  Assignment as TaskIcon 
} from '@mui/icons-material';
import { StatCard, ProjectCard, TaskList } from '../components/dashboard';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import { Project, Task } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    completedTasks: 0,
    pendingTasks: 0,
    totalHoursLogged: 0,
    projectsProgress: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Hämta projekt
        const projectsResponse = await projectService.getProjects();
        setProjects(projectsResponse.results.slice(0, 4)); // Visa endast 4 senaste
        
        // Hämta uppgifter för aktuell användare
        // Detta skulle normalt hämtas via ett API-anrop, men vi har inte den endpoint:n än
        setTasks([]);
        
        // Beräkna statistik
        // Detta skulle normalt hämtas via ett API-anrop för statistik
        setStats({
          completedTasks: 0,
          pendingTasks: 0,
          totalHoursLogged: 0,
          projectsProgress: 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Transformera uppgifter till TaskList-komponenten
  const mappedTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    projectName: projects.find(p => p.id === task.project)?.name || 'Okänt projekt'
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
      <Typography level="h2" sx={{ mb: 3 }}>
        Välkommen, {user?.first_name || user?.username || 'Användare'}!
      </Typography>
      
      {/* Statistikkort */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard 
            title="Slutförda uppgifter"
            value={stats.completedTasks}
            icon={<CompletedIcon />}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard 
            title="Väntande uppgifter"
            value={stats.pendingTasks}
            icon={<TaskIcon />}
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard 
            title="Loggade timmar"
            value={`${stats.totalHoursLogged}h`}
            icon={<TimeIcon />}
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard 
            title="Projektframsteg"
            value={`${stats.projectsProgress}%`}
            icon={<ReportIcon />}
            progress={stats.projectsProgress}
            color="neutral"
          />
        </Grid>
      </Grid>
      
      {/* Projekt och uppgifter */}
      <Grid container spacing={3}>
        {/* Projekt */}
        <Grid xs={12} md={8}>
          <Typography level="h3" sx={{ mb: 2 }}>
            Mina projekt
          </Typography>
          
          <Grid container spacing={2}>
            {projects.length > 0 ? (
              projects.map(project => (
                <Grid key={project.id} xs={12} sm={6}>
                  <ProjectCard 
                    id={project.id}
                    name={project.name}
                    description={project.description}
                    progress={75} // Detta skulle beräknas baserat på projektdata
                    dueDate={project.end_date}
                    memberCount={5} // Detta skulle hämtas från API
                    color="primary"
                  />
                </Grid>
              ))
            ) : (
              <Grid xs={12}>
                <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.surface', borderRadius: 'md' }}>
                  <Typography level="body-lg">
                    Du har inga aktiva projekt
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    Skapa ett nytt projekt för att komma igång.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
        
        {/* Uppgifter */}
        <Grid xs={12} md={4}>
          <Typography level="h3" sx={{ mb: 2 }}>
            Mina uppgifter
          </Typography>
          
          <TaskList 
            tasks={mappedTasks}
            title="Mina uppgifter"
            maxItems={5}
            onTaskClick={(id) => console.log(`Navigera till uppgift ${id}`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;