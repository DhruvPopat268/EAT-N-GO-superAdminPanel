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
  Switch
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import { IconCategory, IconPlus } from '@tabler/icons-react';
import axios from 'axios';



export default function SubcategoryManagement() {
  const theme = useTheme();
  const [subcategories, setSubcategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    restaurantId: '',
    image: null
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchSubcategories();
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`, { withCredentials: true });
      setRestaurants(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
    }
  };

  const fetchSubcategories = async () => {
    if (!selectedRestaurant) return;
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/subcategories?restaurantId=${selectedRestaurant}`);
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = () => {
    if (!selectedRestaurant) {
      alert('Please select a restaurant first');
      return;
    }
    setEditMode(false);
    setFormData({ name: '', category: '', restaurantId: selectedRestaurant, image: null });
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
    setDialogOpen(true);
  };

  const handleDeleteSubcategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/subcategories/${id}`);
        setSubcategories(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting subcategory:', error);
      }
    }
  };

  const handleStatusToggle = async (id) => {
    const subcategory = subcategories.find(item => item.id === id);
    const newStatus = subcategory.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/subcategories/${id}`, { ...subcategory, status: newStatus });
      setSubcategories(prev => prev.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating subcategory status:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/subcategories/${selectedSubcategory.id}`, formData);
        setSubcategories(prev => prev.map(item =>
          item.id === selectedSubcategory.id ? response.data : item
        ));
      } else {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/subcategories`, formData);
        setSubcategories(prev => [...prev, response.data]);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving subcategory:', error);
    }
  };

  const filteredSubcategories = subcategories.filter(item => {
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
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
                onChange={(e) => setSelectedRestaurant(e.target.value)}
              >
                <MenuItem value="">Select Restaurant</MenuItem>
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
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="veg">Veg</MenuItem>
                <MenuItem value="non-veg">Non-Veg</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
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
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Subcategory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
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
                    <Fade in timeout={1200 + index * 100} key={subcategory.id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>

                        <TableCell>
                          <Chip
                            label={subcategory.category}
                            color={getCategoryColor(subcategory.category)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={subcategory.status === 'active'}
                            onChange={() => handleStatusToggle(subcategory.id)}
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
                                onClick={() => handleDeleteSubcategory(subcategory.id)}
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
                <MenuItem value="veg">Veg</MenuItem>
                <MenuItem value="non-veg">Non-Veg</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                />
              </Button>
              {formData.image && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {formData.image.name}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.category || !formData.restaurantId}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}