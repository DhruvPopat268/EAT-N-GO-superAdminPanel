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
  FormGroup,
  FormControlLabel,
  Checkbox,
  alpha,
  useTheme,
  Fade,
  Avatar,
  Switch
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSettings, IconUserShield } from '@tabler/icons-react';
import BlackSpinner from 'ui-component/BlackSpinner';

export default function RolesTab() {
  const theme = useTheme();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

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

  const handleSave = async () => {
    try {
      if (editingRole) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/roles/${editingRole._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setRoles(roles.map(r =>
            r._id === editingRole._id ? result.data : r
          ));
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setRoles([result.data, ...roles]);
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/roles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setRoles(roles.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Error deleting role:', error);
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
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role, index) => (
              <Fade in timeout={800 + index * 100} key={role._id}>
                <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'white', width: 40, height: 40 }}>
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
                      {role.permissions?.map((permission) => (
                        <Chip
                          key={permission._id}
                          label={permission.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={`${role.userCount || 0} users`}
                      color={role.userCount > 0 ? "success" : "default"}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={role.isActive}
                      onChange={async (e) => {
                        try {
                          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/roles/${role._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ ...role, isActive: e.target.checked })
                          });
                          const result = await response.json();
                          if (result.success) {
                            setRoles(roles.map(r =>
                              r._id === role._id ? result.data : r
                            ));
                          }
                        } catch (error) {
                          console.error('Error updating role status:', error);
                        }
                      }}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(role.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Role" arrow>
                        <IconButton
                          onClick={() => handleOpen(role)}
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
                      <Tooltip title="Delete Role" arrow>
                        <IconButton
                          onClick={() => handleDelete(role._id)}
                          disabled={role.isSystem}
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

      {roles.length === 0 && (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <IconUserShield size={80} color={theme.palette.text.disabled} style={{ opacity: 0.5, marginBottom: 24 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
            No roles found
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Create your first role to manage user permissions
          </Typography>
        </Box>
      )}

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
                {permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <FormControlLabel
                      key={permission._id}
                      control={
                        <Checkbox
                          checked={formData.permissions.includes(permission._id)}
                          onChange={() => handlePermissionChange(permission._id)}
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
                  ))
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      No permissions found. Add first!
                    </Typography>
                  </Box>
                )}
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