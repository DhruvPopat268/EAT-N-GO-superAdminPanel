import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  alpha,
  useTheme,
  Fade,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { IconAdjustments, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useToast } from '../../utils/toast.jsx';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';



export default function AttributesManagement() {
  const theme = useTheme();
  const toast = useToast();
  const [attributes, setAttributes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', restaurantId: '' });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchAttributes();
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`, { withCredentials: true });
      setRestaurants(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
      setRestaurants([]);
    }
  };

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedRestaurant === 'all') {
        response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/all`, { withCredentials: true });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/get`, {
          restaurantId: selectedRestaurant
        }, { withCredentials: true });
      }
      setAttributes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = () => {
    if (selectedRestaurant === 'all') {
      toast.warning('Please select a specific restaurant to add attributes');
      return;
    }
    setEditMode(false);
    setFormData({ name: '', restaurantId: selectedRestaurant });
    setDialogOpen(true);
  };

  const handleEditAttribute = (attribute) => {
    setEditMode(true);
    setSelectedAttribute(attribute);
    setFormData({ 
      name: attribute.name, 
      restaurantId: attribute.restaurantId || selectedRestaurant 
    });
    setDialogOpen(true);
  };

  const handleDeleteAttribute = async (id) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/delete`, {
          data: { id, restaurantId: selectedRestaurant }
        }, { withCredentials: true });
        setAttributes(prev => prev.filter(item => item._id !== id));
        toast.success('Attribute deleted successfully');
      } catch (error) {
        console.error('Error deleting attribute:', error);
        toast.error('Failed to delete attribute');
      }
    }
  };

  const handleStatusToggle = async (id) => {
    const attribute = attributes.find(item => item._id === id);
    const newStatus = !attribute.isAvailable;
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/status`, {
        id,
        isAvailable: newStatus,
        restaurantId: selectedRestaurant
      }, { withCredentials: true });
      setAttributes(prev => prev.map(item =>
        item._id === id ? { ...item, isAvailable: newStatus } : item
      ));
      toast.success(`Attribute ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating attribute status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editMode) {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/update`, {
          id: selectedAttribute._id,
          ...formData
        }, { withCredentials: true });
        setAttributes(prev => prev.map(item =>
          item._id === selectedAttribute._id ? response.data.data : item
        ));
        toast.success('Attribute updated successfully');
      } else {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin`, formData, { withCredentials: true });
        setAttributes(prev => [...prev, response.data.data]);
        toast.success('Attribute created successfully');
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving attribute:', error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} attribute`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconAdjustments size={32} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Attributes Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={handleAddAttribute}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add Attributes
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage menu item attributes for your restaurant
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={900}>
        <Card sx={{ mb: 3, p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={selectedRestaurant}
                label="Restaurant"
                onChange={(e) => {
                  setFilterLoading(true);
                  setSelectedRestaurant(e.target.value);
                  setTimeout(() => setFilterLoading(false), 300);
                }}
              >
                <MenuItem value="all">All Restaurants</MenuItem>
                {Array.isArray(restaurants) && restaurants.map((restaurant) => (
                  <MenuItem key={restaurant.restaurantId} value={restaurant.restaurantId}>
                    {restaurant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Card>
      </Fade>

      <Fade in timeout={1000}>
        <Card 
          sx={{ 
            borderRadius: 3, 
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
            background: 'white'
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>id</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Attribute Name</TableCell>
                  {selectedRestaurant === 'all' && (
                    <TableCell sx={{ fontWeight: 700 }}>Restaurant</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 6 : 5} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading attributes..." />
                    </TableCell>
                  </TableRow>
                ) : filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 6 : 5} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading attributes..." />
                    </TableCell>
                  </TableRow>
                ) : attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 6 : 5} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconAdjustments size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No attributes found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Attributes" to create your first attribute
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attribute, index) => (
                    <Fade in timeout={1200 + index * 100} key={attribute._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>#{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {attribute.name}
                          </Typography>
                        </TableCell>
                        {selectedRestaurant === 'all' && (
                          <TableCell>
                            <Typography variant="body2">
                              {attribute.restaurantName || 'Unknown Restaurant'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Switch
                            checked={attribute.isAvailable}
                            onChange={() => handleStatusToggle(attribute._id)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(attribute.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditAttribute(attribute)}
                                sx={{ color: 'primary.main' }}
                              >
                                <Edit size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteAttribute(attribute._id)}
                                sx={{ color: 'error.main' }}
                              >
                                <Delete size={18} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            width: 400,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {editMode ? 'Edit Attribute' : 'Add New Attribute'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={formData.restaurantId}
                label="Restaurant"
                onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                disabled={editMode}
              >
                {Array.isArray(restaurants) && restaurants.map((restaurant) => (
                  <MenuItem key={restaurant.restaurantId} value={restaurant.restaurantId}>
                    {restaurant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Attribute Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter attribute name"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.restaurantId || submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {submitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {toast.toasts.map((toastItem) => (
        <Snackbar
          key={toastItem.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 2 }}
        >
          <Alert
            severity={toastItem.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 300,
              fontWeight: 500
            }}
          >
            {toastItem.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}