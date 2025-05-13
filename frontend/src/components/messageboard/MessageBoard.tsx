import * as React from 'react';
import { 
  Sheet, 
  Typography, 
  Box, 
  Button, 
  Tabs, 
  TabList, 
  Tab,
  Input,
  Select,
  Option
} from '@mui/joy';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon
} from '@mui/icons-material';
import MessageCard from './MessageCard';

type MessageCategory = 'announcement' | 'discussion' | 'question' | 'all';

interface Message {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  projectName?: string;
  category?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  attachments?: Array<{
    id: number;
    name: string;
    type: string;
    size: number;
  }>;
  comments?: Array<{
    id: number;
    author: {
      id: number;
      name: string;
      avatar?: string;
    };
    content: string;
    createdAt: Date;
  }>;
}

interface MessageBoardProps {
  messages: Message[];
  title?: string;
  showCategory?: boolean;
  showProject?: boolean;
  currentProject?: number;
  onCreateMessage?: () => void;
  onMessageLike?: (messageId: number) => void;
  onMessageComment?: (messageId: number) => void;
  onMessageClick?: (messageId: number) => void;
}

export const MessageBoard: React.FC<MessageBoardProps> = ({
  messages,
  title = 'Anslagstavla',
  showCategory = true,
  showProject = true,
  currentProject,
  onCreateMessage,
  onMessageLike,
  onMessageComment,
  onMessageClick
}) => {
  const [activeTab, setActiveTab] = React.useState<MessageCategory>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedMessage, setExpandedMessage] = React.useState<number | null>(null);
  
  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: string | number | null) => {
    if (newValue) {
      setActiveTab(newValue as MessageCategory);
    }
  };
  
  const filterMessages = () => {
    let filtered = [...messages];
    
    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(msg => msg.category?.toLowerCase() === activeTab);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(query) || 
        msg.content.toLowerCase().includes(query) ||
        msg.author.name.toLowerCase().includes(query)
      );
    }
    
    // Filter by project if needed
    if (currentProject) {
      filtered = filtered.filter(msg => msg.projectName === currentProject.toString());
    }
    
    return filtered;
  };
  
  const filteredMessages = filterMessages();
  
  return (
    <Sheet 
      variant="outlined" 
      sx={{ 
        borderRadius: 'md',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
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
        <Typography level="title-lg">{title}</Typography>
        <Button 
          size="sm" 
          startDecorator={<AddIcon />}
          onClick={onCreateMessage}
        >
          Skapa inlägg
        </Button>
      </Box>
      
      {/* Filters */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { md: 'center' }, 
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Input
          size="sm"
          placeholder="Sök inlägg..."
          startDecorator={<SearchIcon />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1,
            alignItems: 'center', 
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            flex: 1
          }}
        >
          {showProject && (
            <Select 
              size="sm" 
              placeholder="Alla projekt" 
              startDecorator={<FilterIcon />}
              sx={{ minWidth: 180 }}
            >
              <Option value="all">Alla projekt</Option>
              <Option value="1">Projekt 1</Option>
              <Option value="2">Projekt 2</Option>
            </Select>
          )}
          
          <Select 
            size="sm" 
            placeholder="Sortera efter" 
            sx={{ minWidth: 150 }}
          >
            <Option value="recent">Senaste först</Option>
            <Option value="oldest">Äldsta först</Option>
            <Option value="comments">Flest kommentarer</Option>
            <Option value="likes">Flest gillningar</Option>
          </Select>
        </Box>
      </Box>
      
      {/* Categories */}
      {showCategory && (
        <Box sx={{ px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Kategorier"
            sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <TabList>
              <Tab value="all">Alla</Tab>
              <Tab value="announcement">Meddelanden</Tab>
              <Tab value="discussion">Diskussioner</Tab>
              <Tab value="question">Frågor</Tab>
            </TabList>
          </Tabs>
        </Box>
      )}
      
      {/* Message list */}
      <Box 
        sx={{ 
          p: 2, 
          flex: 1,
          overflow: 'auto'
        }}
      >
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <MessageCard
              key={message.id}
              id={message.id}
              title={message.title}
              content={message.content}
              author={message.author}
              createdAt={message.createdAt}
              projectName={showProject ? message.projectName : undefined}
              category={message.category}
              likesCount={message.likesCount}
              commentsCount={message.commentsCount}
              isLiked={message.isLiked}
              attachments={message.attachments}
              comments={message.comments}
              showComments={expandedMessage === message.id}
              onLikeClick={(id) => onMessageLike && onMessageLike(id)}
              onCommentClick={(id) => {
                setExpandedMessage(expandedMessage === id ? null : id);
                onMessageComment && onMessageComment(id);
              }}
              onViewAllComments={(id) => onMessageClick && onMessageClick(id)}
            />
          ))
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '200px',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography level="body-lg" textAlign="center">
              Inga inlägg att visa
            </Typography>
            <Typography level="body-sm" color="neutral" textAlign="center">
              {searchQuery ? 'Inga inlägg matchar din sökning.' : 'Skapa ett inlägg för att komma igång.'}
            </Typography>
          </Box>
        )}
      </Box>
    </Sheet>
  );
};

export default MessageBoard;