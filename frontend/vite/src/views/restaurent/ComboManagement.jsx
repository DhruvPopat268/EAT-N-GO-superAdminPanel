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
  Snackbar,
  Alert,
  CircularProgress,
  Autocomplete,
  Grid
} from '@mui/material';
import { Edit, Delete, CloudUpload, Add, Remove } from '@mui/icons-material';
import { IconPackage, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useToast } from '../../utils/toast.jsx';

export default function ComboManagement() {
  const theme = useTheme();
  const toast = useToast();
  const [combos, setCombos] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [],
    price: 0,
    restaurantId: '',
    image: null
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchCombos();
    }
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

  const fetchCombos = async () => {
    if (!selectedRestaurant) return;
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin`, {
        restaurantId: selectedRestaurant
      }, { withCredentials: true });
      setCombos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching combos:', error);
      toast.error('Failed to load combos');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (restaurantId) => {
    if (!restaurantId) return;
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/byRestaurant`, {
        restaurantId
      }, { withCredentials: true });
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    }
  };

  const fetchAttributes = async (restaurantId) => {
    if (!restaurantId) return;
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/get`, {
        restaurantId
      }, { withCredentials: true });
      setAttributes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast.error('Failed to load attributes');
    }
  };

  const handleRestaurantChangeInDialog = async (restaurantId) => {
    setFormData(prev => ({ ...prev, restaurantId }));
    if (restaurantId) {
      await fetchItems(restaurantId);
      await fetchAttributes(restaurantId);
    } else {
      setItems([]);
      setAttributes([]);
    }
  };



  const handleAddCombo = () => {
    setEditMode(false);
    setFormData({
      name: '',
      description: '',
      items: [],
      price: 0,
      restaurantId: selectedRestaurant,
      image: null
    });
    setSelectedItems([]);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const handleEditCombo = (combo) => {
    setEditMode(true);
    setSelectedCombo(combo);
    setFormData({
      name: combo.name,
      description: combo.description,
      items: combo.items || [],
      price: combo.price,
      restaurantId: combo.restaurantId || selectedRestaurant,
      image: null
    });
    setSelectedItems(combo.items?.map(item => ({
      ...item,
      selectedAttribute: item.attributes?.[0] || null
    })) || []);
    setImagePreview(combo.images?.[0]);
    setDialogOpen(true);
  };

  const handleDeleteCombo = async (id) => {
    if (window.confirm('Are you sure you want to delete this combo?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/delete`, {
          data: { comboId: id, restaurantId: selectedRestaurant },
          withCredentials: true
        });
        setCombos(prev => prev.filter(item => item._id !== id));
        toast.success('Combo deleted successfully');
      } catch (error) {
        console.error('Error deleting combo:', error);
        toast.error('Failed to delete combo');
      }
    }
  };

  const handleStatusToggle = async (id) => {
    const combo = combos.find(item => item._id === id);
    const newStatus = !combo.isAvailable;
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/status`, {
        comboId: id,
        isAvailable: newStatus,
        restaurantId: selectedRestaurant
      }, { withCredentials: true });
      setCombos(prev => prev.map(item =>
        item._id === id ? { ...item, isAvailable: newStatus } : item
      ));
      toast.success(`Combo ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating combo status:', error);
      toast.error('Failed to update status');
    }
  };

  const addItemToCombo = (item) => {
    const existingItem = formData.items.find(i => i.itemId === item._id);
    if (existingItem) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(i =>
          i.itemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { itemId: item._id, quantity: 1, name: item.name }]
      }));
    }
  };

  const removeItemFromCombo = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.itemId !== itemId)
    }));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItemFromCombo(itemId);
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.itemId === itemId ? { ...i, quantity } : i
      )
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);


      formDataToSend.append('price', formData.price);
      formDataToSend.append('restaurantId', formData.restaurantId);
      formDataToSend.append('items', JSON.stringify(formData.items));

      if (formData.image) {
        formDataToSend.append('images', formData.image);
      }

      if (editMode) {
        formDataToSend.append('comboId', selectedCombo._id);
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/update`, formDataToSend, { withCredentials: true });
        setCombos(prev => prev.map(item =>
          item._id === selectedCombo._id ? response.data.data : item
        ));
        toast.success('Combo updated successfully');
      } else {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/add`, formDataToSend, { withCredentials: true });
        setCombos(prev => [...prev, response.data.data]);
        toast.success('Combo created successfully');
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving combo:', error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} combo`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCombos = combos.filter(item => {
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    const statusMatch = statusFilter === 'all' || (statusFilter === 'Available' ? item.isAvailable : !item.isAvailable);
    return categoryMatch && statusMatch;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Veg': return 'success';
      case 'Non-Veg': return 'error';
      case 'Mixed': return 'warning';
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
                Combo Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={handleAddCombo}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add Combo
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage combo offers for your restaurant menu
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
                onChange={(e) => setStatusFilter(e.target.value)}
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
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Combo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCombos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconPackage size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No combos found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Combo" to create your first combo
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCombos.map((combo, index) => (
                    <Fade in timeout={1200 + index * 100} key={combo._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={combo.images?.[0]}
                              sx={{
                                bgcolor: 'primary.main',
                                width: 50,
                                height: 50,
                                borderRadius: 2
                              }}
                            >
                              <IconPackage size={24} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {combo.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {combo.description}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={combo.category}
                            color={getCategoryColor(combo.category)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {combo.items?.length || 0} items
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                            ₹{combo.price}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={combo.isAvailable}
                            onChange={() => handleStatusToggle(combo._id)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditCombo(combo)}
                                sx={{ color: 'primary.main' }}
                              >
                                <Edit size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteCombo(combo._id)}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Combo' : 'Add New Combo'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={formData.restaurantId}
                label="Restaurant"
                onChange={(e) => handleRestaurantChangeInDialog(e.target.value)}
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
              label="Combo Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
<Autocomplete
              multiple
              options={items}
              getOptionLabel={(option) => option.name}
              value={selectedItems.map(si => items.find(i => i._id === si.itemId)).filter(Boolean)}
              onChange={(event, newValue) => {
                const newSelectedItems = newValue.map(item => {
                  const existing = selectedItems.find(si => si.itemId === item._id);
                  return existing || {
                    itemId: item._id,
                    name: item.name,
                    quantity: 1,
                    selectedAttribute: null
                  };
                });
                setSelectedItems(newSelectedItems);
                setFormData(prev => ({
                  ...prev,
                  items: newSelectedItems.map(si => ({
                    itemId: si.itemId,
                    quantity: si.quantity,
                    attributes: si.selectedAttribute ? [{ attribute: si.selectedAttribute }] : []
                  }))
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Items"
                  placeholder="Choose items for combo"
                />
              )}
            />
     
            
            {selectedItems.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Selected Items Configuration:</Typography>
                <Grid container spacing={2}>
                  {selectedItems.map((item, index) => (
                    <Grid item xs={12} md={6} key={item.itemId}>
                      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>{item.name}</Typography>
                        <Stack spacing={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Attribute</InputLabel>
                            <Select
                              value={item.selectedAttribute || ''}
                              label="Attribute"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 200,
                                    width: 250,
                                  },
                                },
                              }}
                              onChange={(e) => {
                                const newSelectedItems = [...selectedItems];
                                newSelectedItems[index].selectedAttribute = e.target.value;
                                setSelectedItems(newSelectedItems);
                                setFormData(prev => ({
                                  ...prev,
                                  items: newSelectedItems.map(si => ({
                                    itemId: si.itemId,
                                    quantity: si.quantity,
                                    attributes: si.selectedAttribute ? [{ attribute: si.selectedAttribute }] : []
                                  }))
                                }));
                              }}
                            >
                              <MenuItem value="">No Attribute</MenuItem>
                              {attributes.map(attr => (
                                <MenuItem key={attr._id} value={attr._id}>{attr.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>Quantity:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                              <IconButton size="small" onClick={() => {
                                const newSelectedItems = [...selectedItems];
                                if (newSelectedItems[index].quantity === 1) {
                                  // Remove item completely when quantity reaches 0
                                  newSelectedItems.splice(index, 1);
                                } else {
                                  newSelectedItems[index].quantity--;
                                }
                                setSelectedItems(newSelectedItems);
                                setFormData(prev => ({
                                  ...prev,
                                  items: newSelectedItems.map(si => ({
                                    itemId: si.itemId,
                                    quantity: si.quantity,
                                    attributes: si.selectedAttribute ? [{ attribute: si.selectedAttribute }] : []
                                  }))
                                }));
                              }}>
                                <Remove />
                              </IconButton>
                              <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</Typography>
                              <IconButton size="small" onClick={() => {
                                const newSelectedItems = [...selectedItems];
                                newSelectedItems[index].quantity++;
                                setSelectedItems(newSelectedItems);
                                setFormData(prev => ({
                                  ...prev,
                                  items: newSelectedItems.map(si => ({
                                    itemId: si.itemId,
                                    quantity: si.quantity,
                                    attributes: si.selectedAttribute ? [{ attribute: si.selectedAttribute }] : []
                                  }))
                                }));
                              }}>
                                <Add />
                              </IconButton>
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

                        <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            />

                   <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
            disabled={!formData.name || !formData.restaurantId || submitting}
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