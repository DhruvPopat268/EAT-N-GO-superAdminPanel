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
  alpha,
  useTheme,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconKeyFilled } from '@tabler/icons-react';
import BlackSpinner from 'ui-component/BlackSpinner';

export default function PermissionsTab() {
  const theme = useTheme();
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/permissions`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setPermissions(result.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (permission = null) => {
    setEditingPermission(permission);
    setFormData(permission ? 
      { name: permission.name, description: permission.description } : 
      { name: '', description: '' }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPermission(null);
    setFormData({ name: '', description: '' });
  };

  const handleSave = async () => {
    try {
      if (editingPermission) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/permissions/${editingPermission._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setPermissions(permissions.map(p => 
            p._id === editingPermission._id ? result.data : p
          ));
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setPermissions([result.data, ...permissions]);
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/permissions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setPermissions(permissions.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  if (loading) {
    return <BlackSpinner />;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Permissions Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage system permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconPlus size={20} />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Add Permission
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Permission Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((permission, index) => (
              <Fade in timeout={800 + index * 100} key={permission._id}>
                <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconKeyFilled size={18} color={theme.palette.primary.main} />
                      <Chip 
                        label={permission.name} 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{permission.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={permission.isActive}
                      onChange={async (e) => {
                        try {
                          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/permissions/${permission._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ ...permission, isActive: e.target.checked })
                          });
                          const result = await response.json();
                          if (result.success) {
                            setPermissions(permissions.map(p => 
                              p._id === permission._id ? result.data : p
                            ));
                          }
                        } catch (error) {
                          console.error('Error updating permission status:', error);
                        }
                      }}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(permission.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Permission" arrow>
                        <IconButton
                          onClick={() => handleOpen(permission)}
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
                      <Tooltip title="Delete Permission" arrow>
                        <IconButton
                          onClick={() => handleDelete(permission._id)}
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

      {permissions.length === 0 && (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <IconKeyFilled size={80} color={theme.palette.text.disabled} style={{ opacity: 0.5, marginBottom: 24 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
            No permissions found
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Create your first permission to get started
          </Typography>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPermission ? 'Edit Permission' : 'Add New Permission'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Permission Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              placeholder="e.g., user_edit, read, delete"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe what this permission allows"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!formData.name || !formData.description}
          >
            {editingPermission ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}