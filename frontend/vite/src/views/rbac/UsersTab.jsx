import React, { useState, useEffect } from 'react';
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
  Badge,
  Switch
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconUser, IconMail, IconPhone, IconEye, IconEyeOff } from '@tabler/icons-react';
import BlackSpinner from 'ui-component/BlackSpinner';

export default function UsersTab() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    mobile: '',
    password: '',
    role: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/roles`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setRoles(result.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleOpen = (user = null) => {
    setEditingUser(user);
    setFormData(user ? 
      { 
        name: user.name, 
        email: user.email, 
        mobile: user.mobile || '',
        password: '',
        role: user.role?._id || '',
        isActive: user.isActive
      } : 
      { name: '', email: '', mobile: '', password: '', role: '', isActive: true }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', mobile: '', password: '', role: '', isActive: true });
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setUsers(users.map(u => 
            u._id === editingUser._id ? result.data : u
          ));
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setUsers([result.data, ...users]);
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setUsers(users.filter(u => u._id !== id));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <BlackSpinner />;
  }

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
              <Fade in timeout={800 + index * 100} key={user._id}>
                <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          
                        <Avatar sx={{ bgcolor: 'white', width: 40, height: 40 }}>
                          {getInitials(user.name)}
                        </Avatar>
                      
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
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
                        <Typography variant="body2">{user.mobile || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role?.name || 'No Role'} 
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isActive}
                      onChange={async (e) => {
                        try {
                          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ ...user, isActive: e.target.checked })
                          });
                          const result = await response.json();
                          if (result.success) {
                            setUsers(users.map(u => 
                              u._id === user._id ? result.data : u
                            ));
                          }
                        } catch (error) {
                          console.error('Error updating user status:', error);
                        }
                      }}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit User" arrow>
                        <IconButton
                          onClick={() => handleOpen(user)}
                          sx={{ 
                            color: 'secondary.main',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'secondary.main',
                              color: 'white',
                              transform: 'scale(1.08)'
                            }
                          }}
                        >
                          <IconEdit sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User" arrow>
                        <IconButton
                          onClick={() => handleDelete(user._id)}
                          sx={{ 
                            color: 'error.main',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'error.main',
                              color: 'white',
                              transform: 'scale(1.08)'
                            }
                          }}
                        >
                          <IconTrash sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {users.length === 0 && (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <IconUser size={80} color={theme.palette.text.disabled} style={{ opacity: 0.5, marginBottom: 24 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
            No users found
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Add your first user to start managing access
          </Typography>
        </Box>
      )}

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
              label="Mobile Number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              fullWidth
            />
            {!editingUser && (
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ mr: 1 }}
                    >
                      {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </IconButton>
                  )
                }}
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <MenuItem key={role._id} value={role._id}>
                      {role.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    No roles found. Add first!
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                label="Status"
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.email || !formData.mobile || !formData.role || (!editingUser && !formData.password)}
          >
            {saving ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid',
                    borderColor: 'white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
                {editingUser ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              editingUser ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}