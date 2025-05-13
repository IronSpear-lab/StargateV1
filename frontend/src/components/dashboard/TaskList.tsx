import * as React from 'react';
import { 
  List, 
  ListItem, 
  ListItemContent, 
  ListItemDecorator, 
  Typography, 
  Chip, 
  Sheet, 
  Box,
  IconButton
} from '@mui/joy';
import {
  ArrowForward as ArrowIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as TodoIcon,
  MoreHoriz as InProgressIcon,
  RateReview as ReviewIcon
} from '@mui/icons-material';

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectName: string;
}

interface TaskListProps {
  tasks: Task[];
  title?: string;
  maxItems?: number;
  onTaskClick?: (taskId: number) => void;
}

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return <TodoIcon color="disabled" />;
    case 'in_progress':
      return <InProgressIcon color="primary" />;
    case 'review':
      return <ReviewIcon color="warning" />;
    case 'done':
      return <CompletedIcon color="success" />;
    default:
      return <TodoIcon />;
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return 'neutral';
    case 'in_progress':
      return 'primary';
    case 'review':
      return 'warning';
    case 'done':
      return 'success';
    default:
      return 'neutral';
  }
};

const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return 'Att göra';
    case 'in_progress':
      return 'Pågående';
    case 'review':
      return 'Granskning';
    case 'done':
      return 'Klar';
    default:
      return 'Okänd';
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'low':
      return 'neutral';
    case 'medium':
      return 'warning';
    case 'high':
      return 'danger';
    default:
      return 'neutral';
  }
};

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks,
  title = 'Mina uppgifter',
  maxItems = 5,
  onTaskClick
}) => {
  const displayedTasks = tasks.slice(0, maxItems);
  
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
          {tasks.length} {tasks.length === 1 ? 'uppgift' : 'uppgifter'}
        </Typography>
      </Box>
      
      <List size="sm" sx={{ overflow: 'auto', flex: 1 }}>
        {displayedTasks.length > 0 ? (
          displayedTasks.map((task) => (
            <ListItem 
              key={task.id}
              endAction={
                <IconButton 
                  variant="plain" 
                  color="neutral" 
                  size="sm"
                  onClick={() => onTaskClick && onTaskClick(task.id)}
                >
                  <ArrowIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemDecorator>
                {getStatusIcon(task.status)}
              </ListItemDecorator>
              <ListItemContent>
                <Typography level="body-sm">{task.title}</Typography>
                <Typography level="body-xs" color="neutral">
                  {task.projectName}
                  {task.dueDate && ` • Förfaller: ${task.dueDate}`}
                </Typography>
              </ListItemContent>
              <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                <Chip
                  size="sm"
                  variant="soft"
                  color={getStatusColor(task.status)}
                >
                  {getStatusText(task.status)}
                </Chip>
                <Chip
                  size="sm"
                  variant="soft"
                  color={getPriorityColor(task.priority)}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Chip>
              </Box>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemContent>
              <Typography level="body-sm" color="neutral" sx={{ textAlign: 'center', py: 2 }}>
                Inga uppgifter att visa
              </Typography>
            </ListItemContent>
          </ListItem>
        )}
      </List>
      
      {tasks.length > maxItems && (
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'center', 
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography 
            level="body-sm" 
            color="primary" 
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => {}}
          >
            Visa alla {tasks.length} uppgifter
          </Typography>
        </Box>
      )}
    </Sheet>
  );
};

export default TaskList;