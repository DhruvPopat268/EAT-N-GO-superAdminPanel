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
  CircularProgress,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import { IconCategory, IconPlus, IconSearch, IconFilterOff } from '@tabler/icons-react';
import axios from 'axios';
import { useToast } from '../../utils/toast.jsx';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import ConfirmDialog from '../../utils/ConfirmDialog.jsx';



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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    restaurantId: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchSubcategories();
    fetchFilterCategories();
  }, [selectedRestaurant, page, rowsPerPage, debouncedSearchTerm]);

  const fetchFilterCategories = async () => {
    if (selectedRestaurant === 'all') {
      setFilterCategories(['Veg', 'Non-Veg', 'Mixed']);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/usefullDetails`, {
        restaurantId: selectedRestaurant
      }, { withCredentials: true });
      if (response.data.success) {
        setFilterCategories(response.data.data.foodCategory || []);
      }
    } catch (error) {
      console.error('Error fetching filter categories:', error);
      setFilterCategories([]);
    }
  };

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
        let url = `${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/all?page=${page + 1}&limit=${rowsPerPage}`;
        if (debouncedSearchTerm) {
          url += `&subcategoryName=${encodeURIComponent(debouncedSearchTerm)}`;
        }
        response = await axios.get(url, { withCredentials: true });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/get`, {
          restaurantId: selectedRestaurant,
          page: page + 1,
          limit: rowsPerPage,
          subcategoryName: debouncedSearchTerm || undefined
        }, { withCredentials: true });
      }
      setSubcategories(response.data.data || []);
      setTotalCount(response.data.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantCategories = async (restaurantId) => {
    if (!restaurantId || restaurantId === 'all') {
      setAvailableCategories([]);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/usefullDetails`, {
        restaurantId
      }, { withCredentials: true });
      if (response.data.success) {
        setAvailableCategories(response.data.data.foodCategory || []);
      }
    } catch (error) {
      console.error('Error fetching restaurant categories:', error);
      setAvailableCategories([]);
    }
  };

  const handleAddSubcategory = () => {
    setEditMode(false);
    setFormData({ name: '', category: '', restaurantId: selectedRestaurant, image: null });
    setImagePreview(null);
    if (selectedRestaurant !== 'all') {
      fetchRestaurantCategories(selectedRestaurant);
    }
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
    fetchRestaurantCategories(subcategory.restaurantId || selectedRestaurant);
    setDialogOpen(true);
  };

  const handleDeleteSubcategory = (subcategory) => {
    setSubcategoryToDelete(subcategory);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/delete`, {
        data: { id: subcategoryToDelete._id, restaurantId: subcategoryToDelete.restaurantId || selectedRestaurant } , withCredentials: true
      });
      setSubcategories(prev => prev.filter(item => item._id !== subcategoryToDelete._id));
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSubcategoryToDelete(null);
    }
  };

  const handleStatusToggle = async (id) => {
    const subcategory = subcategories.find(item => item._id === id);
    const newStatus = !subcategory.isAvailable;
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/status`, {
        id,
        isAvailable: newStatus,
        restaurantId: subcategory.restaurantId
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRestaurant('all');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || selectedRestaurant !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all';

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
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search by subcategory name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IconFilterOff size={18} />}
                  onClick={handleClearFilters}
                  sx={{ minWidth: 120 }}
                >
                  Clear
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Restaurant</InputLabel>
                <Select
                  value={selectedRestaurant}
                  label="Restaurant"
                  onChange={(e) => {
                    setFilterLoading(true);
                    setSelectedRestaurant(e.target.value);
                    setCategoryFilter('all');
                    setPage(0);
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
                  {filterCategories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
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
            </Box>
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
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>#</TableCell>
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
                      <ThemeSpinner message="Loading subcategories..." />
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
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
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
                                onClick={() => handleDeleteSubcategory(subcategory)}
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

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
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
                onChange={(e) => {
                  const restaurantId = e.target.value;
                  setFormData(prev => ({ ...prev, restaurantId, category: '' }));
                  fetchRestaurantCategories(restaurantId);
                }}
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
                disabled={!formData.restaurantId || availableCategories.length === 0}
              >
                {availableCategories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Subcategory"
        message="Are you sure you want to delete the subcategory"
        itemName={subcategoryToDelete?.name}
        loading={deleting}
      />

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