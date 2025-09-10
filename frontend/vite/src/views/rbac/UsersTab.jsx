import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Fade,
  Avatar,
  Badge
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconUser, IconMail, IconPhone } from '@tabler/icons-react';

const mockRoles = [
  { id: 1, name: 'Admin', color: 'error' },
  { id: 2, name: 'Manager', color: 'warning' },
  { id: 3, name: 'Viewer', color: 'info' }
];

const mockUsers = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com',
    phone: '+1234567890',
    roleId: 1,
    status: 'Active',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20'
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane@example.com',
    phone: '+1234567891',
    roleId: 2,
    status: 'Active',
    createdAt: '2024-01-16',
    lastLogin: '2024-01-19'
  },
  { 
    id: 3, 
    name: 'Bob Wilson', 
    email: 'bob@example.com',
    phone: '+1234567892',
    roleId: 3,
    status: 'Inactive',
    createdAt: '2024-01-17',
    lastLogin: '2024-01-18'
  }
];

export default function UsersTab() {
  const theme = useTheme();
  const [users, setUsers] = useState(mockUsers);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    roleId: '',
    status: 'Active'
  });

  const handleOpen = (user = null) => {
    setEditingUser(user);
    setFormData(user ? 
      { 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        roleId: user.roleId,
        status: user.status
      } : 
      { name: '', email: '', phone: '', roleId: '', status: 'Active' }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', roleId: '', status: 'Active' });
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never'
      };
      setUsers([...users, newUser]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const getRoleName = (roleId) => {
    const role = mockRoles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  const getRoleColor = (roleId) => {
    const role = mockRoles.find(r => r.id === roleId);
    return role ? role.color : 'default';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign roles to users and manage access
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconPlus size={20} />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Add User
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <Fade in timeout={800 + index * 100} key={user.id}>
                <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        badgeContent={user.status === 'Active' ? '●' : '○'}
                        color={user.status === 'Active' ? 'success' : 'error'}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            minWidth: '8px',
                            height: '8px',
                            right: 2,
                            top: 2
                          }
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          {getInitials(user.name)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {user.createdAt}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconMail size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconPhone size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary">
                          {user.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getRoleName(user.roleId)} 
                      color={getRoleColor(user.roleId)}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status} 
                      color={user.status === 'Active' ? 'success' : 'error'}
                      variant="filled"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.lastLogin}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpen(user)}
                          sx={{ color: 'primary.main' }}
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(user.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                label="Role"
              >
                {mockRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!formData.name || !formData.email || !formData.roleId}
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}