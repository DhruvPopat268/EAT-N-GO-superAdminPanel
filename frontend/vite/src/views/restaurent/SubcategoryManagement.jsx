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
  Avatar,
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
  Grid,
  Chip,
  Switch,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import { IconCategory, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useToast } from '../../utils/toast.jsx';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';



export default function SubcategoryManagement() {
  const theme = useTheme();
  const toast = useToast();
  const [subcategories, setSubcategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    restaurantId: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchSubcategories();
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

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedRestaurant === 'all') {
        response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/all`, { withCredentials: true });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/get`, {
          restaurantId: selectedRestaurant
        }, { withCredentials: true });
      }
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = () => {
    if (selectedRestaurant === 'all') {
      toast.warning('Please select a specific restaurant to add subcategories');
      return;
    }
    setEditMode(false);
    setFormData({ name: '', category: '', restaurantId: selectedRestaurant, image: null });
    setImagePreview(null);
    setDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setEditMode(true);
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      category: subcategory.category,
      restaurantId: subcategory.restaurantId || selectedRestaurant,
      image: null
    });
    setImagePreview(subcategory.image);
    setDialogOpen(true);
  };

  const handleDeleteSubcategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/delete`, {
          data: { id, restaurantId: selectedRestaurant }
        }, { withCredentials: true });
        setSubcategories(prev => prev.filter(item => item._id !== id));
        toast.success('Subcategory deleted successfully');
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        toast.error('Failed to delete subcategory');
      }
    }
  };

  const handleStatusToggle = async (id) => {
    const subcategory = subcategories.find(item => item._id === id);
    const newStatus = !subcategory.isAvailable;
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/status`, {
        id,
        isAvailable: newStatus,
        restaurantId: selectedRestaurant
      }, { withCredentials: true });
      setSubcategories(prev => prev.map(item =>
        item._id === id ? { ...item, isAvailable: newStatus } : item
      ));
      toast.success(`Subcategory ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating subcategory status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('restaurantId', formData.restaurantId);

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editMode) {
        formDataToSend.append('id', selectedSubcategory._id);
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/update`, formDataToSend, { withCredentials: true });
        setSubcategories(prev => prev.map(item =>
          item._id === selectedSubcategory._id ? response.data.data : item
        ));
        toast.success('Subcategory updated successfully');
      } else {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin`, formDataToSend, { withCredentials: true });
        setSubcategories(prev => [...prev, response.data.data]);
        toast.success('Subcategory created successfully');
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} subcategory`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubcategories = subcategories.filter(item => {
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    const statusMatch = statusFilter === 'all' || (statusFilter === 'Available' ? item.isAvailable : !item.isAvailable);
    return categoryMatch && statusMatch;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'veg': return 'success';
      case 'non-veg': return 'error';
      case 'mixed': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCategory size={32} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Subcategory Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={handleAddSubcategory}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add Subcategory
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage food subcategories for your restaurant menu
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
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => {
                  setFilterLoading(true);
                  setCategoryFilter(e.target.value);
                  setTimeout(() => setFilterLoading(false), 300);
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Veg">Veg</MenuItem>
                <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                <MenuItem value="Mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setFilterLoading(true);
                  setStatusFilter(e.target.value);
                  setTimeout(() => setFilterLoading(false), 300);
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Unavailable">Unavailable</MenuItem>
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
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Id</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Subcategory</TableCell>
                  {selectedRestaurant === 'all' && (
                    <TableCell sx={{ fontWeight: 700 }}>Restaurant</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 7 : 6} sx={{ textAlign: 'center', py: 8 }}>
                      <BlackSpinner />
                    </TableCell>
                  </TableRow>
                ) : filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 7 : 6} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading subcategories..." />
                    </TableCell>
                  </TableRow>
                ) : filteredSubcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 7 : 6} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconCategory size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No subcategories found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Subcategory" to create your first subcategory
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubcategories.map((subcategory, index) => (
                    <Fade in timeout={1200 + index * 100} key={subcategory._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={subcategory.image}
                              sx={{
                                bgcolor: 'primary.main',
                                width: 50,
                                height: 50,
                                borderRadius: 2
                              }}
                            >
                              <IconCategory size={24} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {subcategory.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {selectedRestaurant === 'all' && (
                          <TableCell>
                            <Typography variant="body2">
                              {subcategory.restaurantName || 'Unknown Restaurant'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip
                            label={subcategory.category}
                            color={getCategoryColor(subcategory.category.toLowerCase())}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={subcategory.isAvailable}
                            onChange={() => handleStatusToggle(subcategory._id)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(subcategory.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditSubcategory(subcategory)}
                                sx={{ color: 'primary.main' }}
                              >
                                <Edit size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteSubcategory(subcategory._id)}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Subcategory' : 'Add New Subcategory'}
        </DialogTitle>
        <DialogContent>
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
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="Veg">Veg</MenuItem>
                <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                <MenuItem value="Mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Subcategory Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 2 }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData(prev => ({ ...prev, image: file }));
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setImagePreview(e.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formData.image?.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.category || !formData.restaurantId || submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
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