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
  alpha,
  useTheme,
  Fade
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconKeyFilled } from '@tabler/icons-react';

const mockPermissions = [
  { id: 1, name: 'read', description: 'View and read data', createdAt: '2024-01-15' },
  { id: 2, name: 'user_edit', description: 'Edit user information', createdAt: '2024-01-15' },
  { id: 3, name: 'user_delete', description: 'Delete users', createdAt: '2024-01-15' },
  { id: 4, name: 'restaurant_manage', description: 'Manage restaurants', createdAt: '2024-01-16' },
  { id: 5, name: 'payment_approve', description: 'Approve payments', createdAt: '2024-01-16' }
];

export default function PermissionsTab() {
  const theme = useTheme();
  const [permissions, setPermissions] = useState(mockPermissions);
  const [open, setOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleOpen = (permission = null) => {
    setEditingPermission(permission);
    setFormData(permission ? { name: permission.name, description: permission.description } : { name: '', description: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPermission(null);
    setFormData({ name: '', description: '' });
  };

  const handleSave = () => {
    if (editingPermission) {
      setPermissions(permissions.map(p => 
        p.id === editingPermission.id 
          ? { ...p, ...formData }
          : p
      ));
    } else {
      const newPermission = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPermissions([...permissions, newPermission]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setPermissions(permissions.filter(p => p.id !== id));
  };

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
              <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((permission, index) => (
              <Fade in timeout={800 + index * 100} key={permission.id}>
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
                    <Typography variant="body2" color="text.secondary">
                      {permission.createdAt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Permission">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpen(permission)}
                          sx={{ color: 'primary.main' }}
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Permission">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(permission.id)}
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