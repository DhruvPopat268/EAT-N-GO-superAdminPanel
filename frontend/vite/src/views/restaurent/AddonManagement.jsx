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
  Chip,
  Switch,
  Autocomplete,
  InputAdornment,
  TablePagination,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Delete, CloudUpload, Add, Remove } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { IconPackage, IconPlus, IconSearch, IconFilterOff } from '@tabler/icons-react';
import axios from 'axios';
import { useToast } from '../../utils/toast.jsx';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import ConfirmDialog from '../../utils/ConfirmDialog.jsx';

const mockCategories = [
  { id: 'Veg', name: 'Veg' },
  { id: 'Non-Veg', name: 'Non-Veg' },
  { id: 'Mixed', name: 'Mixed' }
];

export default function AddonManagement() {
  const theme = useTheme();
  const toast = useToast();
  const [addons, setAddons] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    restaurant: null,
    category: null,
    subcategory: null,
    image: null,
    attributes: [{ attribute: null, price: '' }],
    isAvailable: true
  });
  const [formSubcategories, setFormSubcategories] = useState([]);
  const [formAttributes, setFormAttributes] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);

  useEffect(() => {
    fetchRestaurants();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchAddons();
    fetchSubcategories();
    fetchFilterCategories();
  }, [selectedRestaurant, page, rowsPerPage, debouncedSearchTerm, categoryFilter, subcategoryFilter, statusFilter]);

  const fetchFilterCategories = async () => {
    if (selectedRestaurant === 'all') {
      setFilterCategories(['veg', 'non-veg', 'mixed']);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/usefullDetails`, {
        restaurantId: selectedRestaurant
      }, { withCredentials: true });
      if (response.data.success) {
        const categories = response.data.data.foodCategory || [];
        setFilterCategories(categories.map(cat => cat.toLowerCase()));
      }
    } catch (error) {
      console.error('Error fetching filter categories:', error);
      setFilterCategories([]);
    }
  };

  // Update form attributes and subcategory when data is loaded during edit mode
  useEffect(() => {
    if (editMode && selectedAddon && formAttributes.length > 0) {
      setFormData(prev => ({
        ...prev,
        attributes: selectedAddon.attributes.map(attr => ({
          attribute: formAttributes.find(a => a._id === attr.attribute._id) || null,
          price: attr.price
        }))
      }));
    }
  }, [formAttributes, editMode, selectedAddon]);

  // Update subcategory when formSubcategories are loaded during edit mode
  useEffect(() => {
    if (editMode && selectedAddon && formSubcategories.length > 0) {
      setFormData(prev => ({
        ...prev,
        subcategory: formSubcategories.find(s => s._id === selectedAddon.subcategory._id) || null
      }));
    }
  }, [formSubcategories, editMode, selectedAddon]);

  // Update category when availableCategories are loaded during edit mode
  useEffect(() => {
    if (editMode && selectedAddon && availableCategories.length > 0) {
      setFormData(prev => ({
        ...prev,
        category: availableCategories.find(c => c.id === selectedAddon.category) || null
      }));
    }
  }, [availableCategories, editMode, selectedAddon]);

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
    try {
      let response;
      if (selectedRestaurant === 'all') {
        response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/all`, { withCredentials: true });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/get`, {
          restaurantId: selectedRestaurant
        }, { withCredentials: true });
      }
      setSubcategories(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const fetchAddons = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedRestaurant === 'all') {
        let url = `${import.meta.env.VITE_BACKEND_URL}/api/addon-items/admin/all?page=${page + 1}&limit=${rowsPerPage}`;
        if (debouncedSearchTerm) url += `&addonName=${encodeURIComponent(debouncedSearchTerm)}`;
        if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;
        if (subcategoryFilter !== 'all') url += `&subcategory=${encodeURIComponent(subcategoryFilter)}`;
        if (statusFilter !== 'all') url += `&isAvailable=${statusFilter === 'active'}`;
        response = await axios.get(url, { withCredentials: true });
      } else {
        const payload = {
          restaurantId: selectedRestaurant,
          page: page + 1,
          limit: rowsPerPage,
          addonName: debouncedSearchTerm || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          subcategory: subcategoryFilter !== 'all' ? subcategoryFilter : undefined,
          isAvailable: statusFilter !== 'all' ? (statusFilter === 'active') : undefined
        };
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/addon-items/admin/list`, payload, { withCredentials: true });
      }
      if (response.data.success) {
        setAddons(response.data.data);
        setTotalCount(response.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
      toast.error('Failed to load addons');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { attribute: null, price: '' }]
    });
  };

  const handleRemoveAttribute = (index) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index)
    });
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = formData.attributes.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr
    );
    setFormData({ ...formData, attributes: updatedAttributes });
  };

  const fetchFormSubcategories = async (restaurantId) => {
    try {
      if (!restaurantId) {
        setFormSubcategories([]);
        return;
      }
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/get`, {
        restaurantId
      }, { withCredentials: true });
      setFormSubcategories(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching form subcategories:', error);
      setFormSubcategories([]);
    }
  };

  const fetchFormAttributes = async (restaurantId) => {
    try {
      if (!restaurantId) {
        setFormAttributes([]);
        return;
      }
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/get`, {
        restaurantId
      }, { withCredentials: true });
      setFormAttributes(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching form attributes:', error);
      setFormAttributes([]);
    }
  };

  const fetchRestaurantCategories = async (restaurantId) => {
    if (!restaurantId) {
      setAvailableCategories([]);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/usefullDetails`, {
        restaurantId
      }, { withCredentials: true });
      if (response.data.success) {
        const categories = response.data.data.foodCategory || [];
        setAvailableCategories(categories.map(cat => ({ id: cat, name: cat })));
      }
    } catch (error) {
      console.error('Error fetching restaurant categories:', error);
      setAvailableCategories([]);
    }
  };

  const handleAddAddon = () => {
    setEditMode(false);
    setFormData({
      name: '',
      restaurant: null,
      category: null,
      subcategory: null,
      image: null,
      attributes: [{ attribute: null, price: '' }],
      isAvailable: true
    });
    setFormSubcategories([]);
    setFormAttributes([]);
    setAvailableCategories([]);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const handleEditAddon = (addon) => {
    console.log('Editing addon:', addon);
    setEditMode(true);
    setSelectedAddon(addon);
    const selectedRestaurantObj = restaurants.find(r => r.restaurantId === addon.restaurantId);
    
    setFormData({
      name: addon.name,
      restaurant: selectedRestaurantObj,
      category: null, // Will be updated when availableCategories loads
      subcategory: null, // Will be updated by useEffect when formSubcategories loads
      image: null,
      attributes: [{ attribute: null, price: '' }], // Will be updated by useEffect
      isAvailable: addon.isAvailable
    });
    
    fetchFormSubcategories(addon.restaurantId);
    fetchFormAttributes(addon.restaurantId);
    fetchRestaurantCategories(addon.restaurantId);
    setImagePreview(addon.image);
    setDialogOpen(true);
  };

  const handleDeleteAddon = (addon) => {
    setAddonToDelete(addon);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/addon-items/admin/delete`, {
        data: { id: addonToDelete._id, restaurantId: addonToDelete.restaurantId },
        withCredentials: true
      });
      if (response.data.success) {
        setAddons(prev => prev.filter(item => item._id !== addonToDelete._id));
        toast.success('Addon deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting addon:', error);
      toast.error('Failed to delete addon');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setAddonToDelete(null);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const addon = addons.find(item => item._id === id);
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/addon-items/admin/status`, {
        id,
        isAvailable: newStatus,
        restaurantId: addon.restaurantId
      }, { withCredentials: true });
      if (response.data.success) {
        setAddons(prev => prev.map(item =>
          item._id === id ? { ...item, isAvailable: newStatus } : item
        ));
        toast.success(`Addon ${newStatus ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formDataToSend = new FormData();

      const addonData = {
        name: formData.name,
        category: formData.category?.id,
        subcategory: formData.subcategory?._id,
        restaurantId: formData.restaurant?.restaurantId,
        attributes: formData.attributes.map(attr => ({
          attribute: attr.attribute?._id,
          price: parseInt(attr.price)
        })),
        isAvailable: formData.isAvailable
      };

      if (editMode) {
        addonData.id = selectedAddon._id;
      }

      formDataToSend.append('data', JSON.stringify(addonData));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (editMode) {
        response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/addon-items/admin/update`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/addon-items/admin`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      }

      if (response.data.success) {
        if (editMode) {
          fetchAddons(); // Refresh the addon list after edit
          toast.success('Addon updated successfully');
        } else {
          setAddons(prev => [...prev, response.data.data]);
          toast.success('Addon created successfully');
        }
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving addon:', error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} addon`);
    } finally {
      setLoading(false);
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
    setSubcategoryFilter('all');
    setStatusFilter('all');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || selectedRestaurant !== 'all' || categoryFilter !== 'all' || subcategoryFilter !== 'all' || statusFilter !== 'all';

  const filteredSubcategories = formSubcategories
  .filter(sub =>
    sub.category === availableCategories.find(c => c.id === formData.category?.id)?.name
  );

  const availableSubcategories = subcategories.filter(sub =>
    categoryFilter === 'all' || sub.category === categoryFilter
  );

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
              <IconPackage size={32} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Addon Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={handleAddAddon}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add Addon
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage menu item addons with multiple attributes and pricing
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={900}>
        <Card sx={{ mb: 3, p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search by addon name..."
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
                    setSubcategoryFilter('all');
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
                    setSubcategoryFilter('all');
                    setPage(0);
                    setTimeout(() => setFilterLoading(false), 300);
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {filterCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'veg' ? 'Veg' : category === 'non-veg' ? 'Non-Veg' : 'Mixed'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={subcategoryFilter}
                  label="Subcategory"
                  onChange={(e) => {
                    setFilterLoading(true);
                    setSubcategoryFilter(e.target.value);
                    setPage(0);
                    setTimeout(() => setFilterLoading(false), 300);
                  }}
                >
                  <MenuItem value="all">All Subcategories</MenuItem>
                  {availableSubcategories.map(sub => (
                    <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>
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
                    setPage(0);
                    setTimeout(() => setFilterLoading(false), 300);
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Available</MenuItem>
                  <MenuItem value="inactive">Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Card>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', background: 'white' }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Addon</TableCell>
                  {selectedRestaurant === 'all' && (
                    <TableCell sx={{ fontWeight: 700 }}>Restaurant</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subcategory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Attributes</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Prices</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 9 : 8} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading addons..." />
                    </TableCell>
                  </TableRow>
                ) : filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 9 : 8} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading addons..." />
                    </TableCell>
                  </TableRow>
                ) : addons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 9 : 8} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconPackage size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No addons found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Addon" to create your first addon
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  addons.map((addon, index) => (
                    <Fade in timeout={1200 + index * 100} key={addon._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>#{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={addon.image}
                              sx={{
                                bgcolor: 'primary.main',
                                width: 50,
                                height: 50,
                                borderRadius: 2
                              }}
                            >
                              <IconPackage size={24} />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {addon.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        {selectedRestaurant === 'all' && (
                          <TableCell>
                            <Typography variant="body2">
                              {addon.restaurantName || 'Unknown Restaurant'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip
                            label={addon.category}
                            color={getCategoryColor(addon.category.toLowerCase())}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={addon.subcategory?.name || 'N/A'}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {addon.attributes?.map((attr, i) => (
                              <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                                {attr.attribute?.name || 'N/A'}
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {addon.attributes?.map((attr, i) => (
                              <Typography key={i} variant="body2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                                ₹{attr.price}
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={addon.isAvailable}
                              onChange={() => handleStatusToggle(addon._id, addon.isAvailable)}
                              size="small"
                            />
                            <Chip
                              label={addon.isAvailable ? 'Available' : 'Unavailable'}
                              color={addon.isAvailable ? 'success' : 'error'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Addon" arrow>
                              <IconButton
                                onClick={() => handleEditAddon(addon)}
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
                                <Edit sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Addon" arrow>
                              <IconButton
                                onClick={() => handleDeleteAddon(addon)}
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
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {editMode ? 'Edit Addon' : 'Add New Addon'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              fullWidth
              options={restaurants}
              getOptionLabel={(option) => option.name}
              value={formData.restaurant}
              onChange={(event, newValue) => {
                setFormData({ ...formData, restaurant: newValue, category: null, subcategory: null });
                fetchFormSubcategories(newValue?.restaurantId);
                fetchFormAttributes(newValue?.restaurantId);
                fetchRestaurantCategories(newValue?.restaurantId);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Restaurant" />
              )}
            />

            <TextField
              fullWidth
              label="Addon Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter addon name"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={availableCategories}
                getOptionLabel={(option) => option.name}
                value={formData.category}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, category: newValue, subcategory: null });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Category" />
                )}
                disabled={!formData.restaurant || availableCategories.length === 0}
              />
              <Autocomplete
                sx={{ flex: 1 }}
                options={filteredSubcategories}
                getOptionLabel={(option) => option.name}
                value={formData.subcategory}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, subcategory: newValue });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Subcategory" />
                )}
                disabled={!formData.category}
              />
            </Box>



            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Attributes & Pricing
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddAttribute}
                  size="small"
                  variant="outlined"
                >
                  Add Attribute
                </Button>
              </Box>

              {formData.attributes.map((attr, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Autocomplete
                    sx={{ flex: 1 }}
                    options={formAttributes}
                    getOptionLabel={(option) => option.name}
                    value={attr.attribute}
                    onChange={(event, newValue) => {
                      handleAttributeChange(index, 'attribute', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Attribute" size="small" />
                    )}
                  />
                  <TextField
                    sx={{ flex: 1 }}
                    label="Price"
                    type="number"
                    size="small"
                    value={attr.price}
                    onChange={(e) => handleAttributeChange(index, 'price', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                  {formData.attributes.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveAttribute(index)}
                      color="error"
                      size="small"
                    >
                      <Remove />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            <Box>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 2 }}>
                Addon Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{
                  borderStyle: 'dashed',
                  py: 2,
                  textTransform: 'none',
                  width: '100%'
                }}
              >
                {formData.image ? formData.image.name : 'Upload Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData({ ...formData, image: file });
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
                  
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Status:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    size="small"
                  />
                  <Chip
                    label={formData.isAvailable ? 'Available' : 'Unavailable'}
                    color={formData.isAvailable ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
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
            disabled={loading || !formData.name || !formData.restaurant || !formData.category || !formData.subcategory ||
              formData.attributes.some(attr => !attr.attribute || !attr.price)}
            sx={{ borderRadius: 2, px: 3 }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Addon"
        message="Are you sure you want to delete the addon"
        itemName={addonToDelete?.name}
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