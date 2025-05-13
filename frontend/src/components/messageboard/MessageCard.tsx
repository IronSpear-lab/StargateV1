import * as React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Chip, 
  Button,
  IconButton,
  Sheet
} from '@mui/joy';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import {
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  AttachFile as AttachmentIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

interface Attachment {
  id: number;
  name: string;
  type: string;
  size: number;
}

interface Comment {
  id: number;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
}

interface MessageCardProps {
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
  attachments?: Attachment[];
  comments?: Comment[];
  showComments?: boolean;
  onLikeClick?: (messageId: number) => void;
  onCommentClick?: (messageId: number) => void;
  onViewAllComments?: (messageId: number) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  id,
  title,
  content,
  author,
  createdAt,
  projectName,
  category,
  likesCount,
  commentsCount,
  isLiked = false,
  attachments = [],
  comments = [],
  showComments = false,
  onLikeClick,
  onCommentClick,
  onViewAllComments
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <Card 
      variant="outlined"
      sx={{ 
        mb: 2, 
        overflow: 'visible',
        borderRadius: 'md'
      }}
    >
      <CardContent>
        {/* Card header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              src={author.avatar}
              alt={author.name}
            >
              {!author.avatar && author.name.substring(0, 1).toUpperCase()}
            </Avatar>
            
            <Box>
              <Typography level="title-sm">
                {author.name}
              </Typography>
              <Typography level="body-xs" color="neutral">
                {format(new Date(createdAt), 'PPpp', { locale: sv })}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {category && (
              <Chip size="sm" variant="soft" color="neutral">
                {category}
              </Chip>
            )}
            {projectName && (
              <Chip size="sm" variant="soft" color="primary">
                {projectName}
              </Chip>
            )}
            <IconButton size="sm" variant="plain" color="neutral">
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Message content */}
        <Typography level="title-md" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography level="body-md" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          {content}
        </Typography>
        
        {/* Attachments */}
        {attachments.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography level="body-sm" fontWeight="lg" sx={{ mb: 1 }}>
              Bilagor ({attachments.length})
            </Typography>
            <Sheet 
              variant="outlined" 
              sx={{ 
                p: 1, 
                borderRadius: 'md',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              {attachments.map((attachment) => (
                <Box 
                  key={attachment.id}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 'sm',
                    '&:hover': { bgcolor: 'background.level1' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachmentIcon fontSize="small" />
                    <Typography level="body-sm">
                      {attachment.name}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" color="neutral">
                    {formatFileSize(attachment.size)}
                  </Typography>
                </Box>
              ))}
            </Sheet>
          </Box>
        )}
        
        {/* Actions */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 1.5
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="sm"
              variant={isLiked ? 'soft' : 'plain'}
              color={isLiked ? 'primary' : 'neutral'}
              startDecorator={<LikeIcon />}
              onClick={() => onLikeClick && onLikeClick(id)}
            >
              {likesCount} Gilla
            </Button>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              startDecorator={<CommentIcon />}
              onClick={() => onCommentClick && onCommentClick(id)}
            >
              {commentsCount} Kommentarer
            </Button>
          </Box>
        </Box>
        
        {/* Comments */}
        {showComments && comments.length > 0 && (
          <Box 
            sx={{ 
              mt: 2, 
              pl: 2, 
              borderLeft: '2px solid',
              borderColor: 'divider'
            }}
          >
            {comments.slice(0, 3).map((comment) => (
              <Box 
                key={comment.id} 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  gap: 1.5
                }}
              >
                <Avatar 
                  size="sm"
                  src={comment.author.avatar}
                  alt={comment.author.name}
                >
                  {!comment.author.avatar && comment.author.name.substring(0, 1).toUpperCase()}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 1,
                      alignItems: 'baseline'
                    }}
                  >
                    <Typography level="body-sm" fontWeight="lg">
                      {comment.author.name}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      {format(new Date(comment.createdAt), 'PPp', { locale: sv })}
                    </Typography>
                  </Box>
                  <Typography level="body-sm">
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {comments.length > 3 && (
              <Button 
                size="sm" 
                variant="plain" 
                color="neutral"
                onClick={() => onViewAllComments && onViewAllComments(id)}
                sx={{ ml: 5 }}
              >
                Visa alla {comments.length} kommentarer
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageCard;