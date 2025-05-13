import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, ModalDialog, CircularProgress } from '@mui/joy';
import { Add as AddIcon } from '@mui/icons-material';
import { MessageBoard as MessageBoardComponent } from '../components/messageboard';
import { Message } from '../types';

const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // Anrop till API för att hämta meddelanden skulle ske här
        // För tillfället använder vi tomma data
        setMessages([]);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  const handleMessageClick = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setSelectedMessage(message);
      setOpen(true);
    }
  };

  const handleCreateMessage = () => {
    setSelectedMessage(null);
    setOpen(true);
  };

  const handleMessageLike = (messageId: number) => {
    // API-anrop för att gilla/ogilla ett meddelande skulle ske här
    console.log(`Like message ${messageId}`);
  };

  const handleMessageComment = (messageId: number) => {
    // Expandera/kollapsa kommentarer för ett meddelande
    console.log(`Toggle comments for message ${messageId}`);
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
        <Typography level="h2">Anslagstavla</Typography>
        <Button 
          startDecorator={<AddIcon />}
          onClick={handleCreateMessage}
        >
          Skapa inlägg
        </Button>
      </Box>
      
      <MessageBoardComponent 
        messages={messages}
        title="Anslagstavla"
        showCategory={true}
        showProject={true}
        onCreateMessage={handleCreateMessage}
        onMessageLike={handleMessageLike}
        onMessageComment={handleMessageComment}
        onMessageClick={handleMessageClick}
      />
      
      {/* Modal för att visa/redigera meddelande */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog 
          aria-labelledby="message-dialog-title"
          sx={{ maxWidth: 700 }}
        >
          <Typography id="message-dialog-title" level="h4">
            {selectedMessage ? 'Visa inlägg' : 'Skapa nytt inlägg'}
          </Typography>
          
          {/* Här skulle ett formulär för att skapa/redigera meddelanden visas */}
          <Box sx={{ mt: 2 }}>
            {selectedMessage ? (
              <Box>
                <Typography level="title-md">{selectedMessage.title}</Typography>
                <Typography level="body-sm" sx={{ mb: 2 }}>
                  Av: {selectedMessage.author.name} | {new Date(selectedMessage.createdAt).toLocaleString()}
                </Typography>
                <Typography level="body-md" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedMessage.content}
                </Typography>
              </Box>
            ) : (
              <Typography level="body-md">
                Här skulle ett formulär för att skapa inlägg visas.
              </Typography>
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default MessageBoard;