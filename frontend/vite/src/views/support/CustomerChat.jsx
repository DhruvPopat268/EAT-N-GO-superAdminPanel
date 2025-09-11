import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Paper,
  Badge,
  Divider,
  useTheme,
  Fade,
  Grid
} from '@mui/material';
import { Send, Search } from '@mui/icons-material';
import { IconMessageCircle, IconHeadphones } from '@tabler/icons-react';

// Mock chat data
const mockChats = [
  {
    id: 1,
    customerName: 'John Doe',
    lastMessage: 'My order is delayed, can you help?',
    timestamp: '2 min ago',
    unreadCount: 2,
    avatar: 'JD',
    isOnline: true
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    lastMessage: 'Thank you for the quick response!',
    timestamp: '5 min ago',
    unreadCount: 0,
    avatar: 'JS',
    isOnline: false
  },
  {
    id: 3,
    customerName: 'Bob Wilson',
    lastMessage: 'I need a refund for my order',
    timestamp: '10 min ago',
    unreadCount: 1,
    avatar: 'BW',
    isOnline: true
  },
  {
    id: 4,
    customerName: 'Alice Brown',
    lastMessage: 'The food was amazing!',
    timestamp: '1 hour ago',
    unreadCount: 0,
    avatar: 'AB',
    isOnline: false
  }
];

const mockMessages = {
  1: [
    { id: 1, text: 'Hello, I placed an order 2 hours ago', sender: 'customer', timestamp: '2:30 PM' },
    { id: 2, text: 'My order number is #ORD001', sender: 'customer', timestamp: '2:31 PM' },
    { id: 3, text: 'Hi John! Let me check your order status for you.', sender: 'admin', timestamp: '2:32 PM' },
    { id: 4, text: 'Your order is being prepared and will be delivered in 15 minutes.', sender: 'admin', timestamp: '2:33 PM' },
    { id: 5, text: 'My order is delayed, can you help?', sender: 'customer', timestamp: '2:35 PM' }
  ],
  2: [
    { id: 1, text: 'Hi, I had an issue with my previous order', sender: 'customer', timestamp: '1:00 PM' },
    { id: 2, text: 'Hello Jane! What was the issue?', sender: 'admin', timestamp: '1:01 PM' },
    { id: 3, text: 'The delivery was late but the food was great', sender: 'customer', timestamp: '1:02 PM' },
    { id: 4, text: 'I apologize for the delay. We\'ll ensure better service next time.', sender: 'admin', timestamp: '1:03 PM' },
    { id: 5, text: 'Thank you for the quick response!', sender: 'customer', timestamp: '1:05 PM' }
  ]
};

export default function CustomerChat() {
  const theme = useTheme();
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const filteredChats = mockChats.filter(chat =>
    chat.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: 'admin',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMessage]
      }));
      
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconHeadphones size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Customer Chat Support
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Chat with customers and provide real-time support
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Grid container spacing={3} sx={{ height: '70vh' }}>
          {/* Chat List */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Box>
              <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {filteredChats.map((chat) => (
                  <ListItem
                    key={chat.id}
                    button
                    selected={selectedChat === chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    sx={{
                      borderBottom: '1px solid #f0f0f0',
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.light + '20'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="success"
                        variant="dot"
                        invisible={!chat.isOnline}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {chat.avatar}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="500">
                            {chat.customerName}
                          </Typography>
                          {chat.unreadCount > 0 && (
                            <Badge badgeContent={chat.unreadCount} color="error" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {chat.lastMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {chat.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Chat Messages */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {mockChats.find(c => c.id === selectedChat)?.avatar}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="500">
                    {mockChats.find(c => c.id === selectedChat)?.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mockChats.find(c => c.id === selectedChat)?.isOnline ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages[selectedChat]?.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: msg.sender === 'admin' ? 'primary.main' : 'grey.100',
                        color: msg.sender === 'admin' ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7
                        }}
                      >
                        {msg.timestamp}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Fade>
    </Box>
  );
}