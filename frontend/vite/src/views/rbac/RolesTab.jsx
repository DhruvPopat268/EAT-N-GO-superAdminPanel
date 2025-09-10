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
  FormGroup,
  FormControlLabel,
  Checkbox,
  alpha,
  useTheme,
  Fade,
  Avatar
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSettings, IconUserShield } from '@tabler/icons-react';

const mockPermissions = [
  { id: 1, name: 'read', description: 'View and read data' },
  { id: 2, name: 'user_edit', description: 'Edit user information' },
  { id: 3, name: 'user_delete', description: 'Delete users' },
  { id: 4, name: 'restaurant_manage', description: 'Manage restaurants' },
  { id: 5, name: 'payment_approve', description: 'Approve payments' }
];

const mockRoles = [
  { 
    id: 1, 
    name: 'Admin', 
    description: 'Full system access', 
    permissions: [1, 2, 3, 4, 5],
    createdAt: '2024-01-15',
    userCount: 3
  },
  { 
    id: 2, 
    name: 'Manager', 
    description: 'Restaurant management access', 
    permissions: [1, 4],
    createdAt: '2024-01-16',
    userCount: 8
  },
  { 
    id: 3, 
    name: 'Viewer', 
    description: 'Read-only access', 
    permissions: [1],
    createdAt: '2024-01-16',
    userCount: 15
  }
];

export default function RolesTab() {
  const theme = useTheme();
  const [roles, setRoles] = useState(mockRoles);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

  const handleOpen = (role = null) => {
    setEditingRole(role);
    setFormData(role ? 
      { name: role.name, description: role.description, permissions: role.permissions } : 
      { name: '', description: '', permissions: [] }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSave = () => {
    if (editingRole) {
      setRoles(roles.map(r => 
        r.id === editingRole.id 
          ? { ...r, ...formData }
          : r
      ));
    } else {
      const newRole = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        userCount: 0
      };
      setRoles([...roles, newRole]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const getPermissionNames = (permissionIds) => {
    return mockPermissions
      .filter(p => permissionIds.includes(p.id))
      .map(p => p.name);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Roles Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create roles by combining permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconPlus size={20} />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Add Role
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Permissions</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Users</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role, index) => (
              <Fade in timeout={800 + index * 100} key={role.id}>
                <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <IconUserShield size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {role.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {getPermissionNames(role.permissions).map((permission) => (
                        <Chip 
                          key={permission}
                          label={permission} 
                          size="small"
                          color="primary" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${role.userCount} users`} 
                      color="success" 
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {role.createdAt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Role">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpen(role)}
                          sx={{ color: 'primary.main' }}
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Role">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(role.id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              placeholder="e.g., Admin, Manager, Viewer"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Describe this role's purpose"
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Select Permissions
              </Typography>
              <FormGroup>
                {mockPermissions.map((permission) => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Checkbox
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!formData.name || !formData.description || formData.permissions.length === 0}
          >
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}