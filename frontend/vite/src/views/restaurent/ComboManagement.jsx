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
import { Edit, Delete, CloudUpload, Add, Remove, Visibility } from '@mui/icons-material';
import { IconPackage, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useToast } from '../../utils/toast.jsx';
import ConfirmDialog from '../../utils/ConfirmDialog.jsx';
import BlackSpinner from '../../ui-component/BlackSpinner.jsx';
import BlueSpinner from '../../ui-component/BlueSpinner.jsx';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';

export default function ComboManagement() {
  const theme = useTheme();
  const toast = useToast();
  const [combos, setCombos] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
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
  const [itemAttributes, setItemAttributes] = useState({}); // Store attributes for each item
  const [imagePreview, setImagePreview] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewCombo, setViewCombo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchCombos(); // Fetch all combos on initial load
  }, []);

  useEffect(() => {
    fetchCombos();
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
    setLoading(true);
    try {
      let response;
      if (selectedRestaurant === 'all') {
        response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/all`, { withCredentials: true });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin`, {
          restaurantId: selectedRestaurant
        }, { withCredentials: true });
      }
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

  const fetchItemAttributes = async (itemId, restaurantId) => {
    if (!itemId || !restaurantId) return [];
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/combos/item-attributes`, {
        itemId,
        restaurantId
      }, { withCredentials: true });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching item attributes:', error);
      return [];
    }
  };

  const handleRestaurantChangeInDialog = async (restaurantId) => {
    setFormData(prev => ({ ...prev, restaurantId }));
    if (restaurantId) {
      await fetchItems(restaurantId);
    } else {
      setItems([]);
    }
    setSelectedItems([]);
    setItemAttributes({});
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

  const handleViewCombo = (combo) => {
    setViewCombo(combo);
    setViewDialogOpen(true);
  };

  const handleEditCombo = async (combo) => {
    console.log('Editing combo:', combo);
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
    
    // Load items for the restaurant if not already loaded
    if (items.length === 0) {
      await fetchItems(combo.restaurantId || selectedRestaurant);
    }
    
    // Fetch attributes for all items in the combo
    const newItemAttributes = {};
    const selectedItemsData = [];
    
    for (const item of combo.items || []) {
      const itemId = typeof item.itemId === 'string' ? item.itemId : item.itemId?._id;
      const attrs = await fetchItemAttributes(itemId, combo.restaurantId || selectedRestaurant);
      newItemAttributes[itemId] = attrs;
      
      // Handle different attribute formats
      let attributeId = null;
      if (item.attribute) {
        if (typeof item.attribute === 'string') {
          attributeId = item.attribute;
        } else if (item.attribute._id) {
          attributeId = item.attribute._id;
        }
      }
      
      selectedItemsData.push({
        itemId: itemId,
        name: item.itemId?.name || 'Unknown Item',
        quantity: item.quantity,
        selectedAttribute: attributeId
      });
    }
    
    setItemAttributes(newItemAttributes);
    setSelectedItems(selectedItemsData);
    setImagePreview(combo.image);
    setDialogOpen(true);
  };

  const handleDeleteCombo = (combo) => {
    setComboToDelete(combo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/delete`, {
        data: { comboId: comboToDelete._id, restaurantId: comboToDelete.restaurantId },
        withCredentials: true
      });
      setCombos(prev => prev.filter(item => item._id !== comboToDelete._id));
      toast.success('Combo deleted successfully');
    } catch (error) {
      console.error('Error deleting combo:', error);
      toast.error('Failed to delete combo');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setComboToDelete(null);
    }
  };

  const handleStatusToggle = async (id) => {
    const combo = combos.find(item => item._id === id);
    const newStatus = !combo.isAvailable;
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/status`, {
        comboId: id,
        isAvailable: newStatus,
        restaurantId: combo.restaurantId
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
    // Validation: Check minimum 2 items
    if (formData.items.length < 2) {
      toast.error('To create combo, minimum add 2 items');
      return;
    }
    
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        restaurantId: formData.restaurantId,
        items: formData.items
      };
      
      formDataToSend.append('data', JSON.stringify(dataToSend));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editMode) {
        dataToSend.comboId = selectedCombo._id;
        formDataToSend.set('data', JSON.stringify(dataToSend));
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/update`, formDataToSend, { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCombos(prev => prev.map(item =>
          item._id === selectedCombo._id ? response.data.data : item
        ));
        toast.success('Combo updated successfully');
      } else {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/add`, formDataToSend, { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
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
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Combo</TableCell>
                  {selectedRestaurant === 'all' && (
                    <TableCell sx={{ fontWeight: 700 }}>Restaurant</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 8 : 7} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading combos..." />
                    </TableCell>
                  </TableRow>
                ) : filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 8 : 7} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading combos..." />
                    </TableCell>
                  </TableRow>
                ) : filteredCombos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant === 'all' ? 8 : 7} sx={{ textAlign: 'center', py: 8 }}>
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
                        <TableCell>#{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={combo.image}
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
                        {selectedRestaurant === 'all' && (
                          <TableCell>
                            <Typography variant="body2">
                              {combo.restaurantName || 'Unknown Restaurant'}
                            </Typography>
                          </TableCell>
                        )}
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
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => handleViewCombo(combo)}
                                sx={{ color: 'info.main' }}
                              >
                                <Visibility size={18} />
                              </IconButton>
                            </Tooltip>
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
                                onClick={() => handleDeleteCombo(combo)}
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
              onChange={async (event, newValue) => {
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
                
                // Fetch attributes for new items
                const newItemAttributes = { ...itemAttributes };
                for (const item of newValue) {
                  if (!newItemAttributes[item._id]) {
                    const attrs = await fetchItemAttributes(item._id, formData.restaurantId);
                    newItemAttributes[item._id] = attrs;
                  }
                }
                setItemAttributes(newItemAttributes);
                
                setFormData(prev => ({
                  ...prev,
                  items: newSelectedItems.map(si => ({
                    itemId: si.itemId,
                    quantity: si.quantity,
                    attribute: si.selectedAttribute || null
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
                                    attribute: si.selectedAttribute || null
                                  }))
                                }));
                              }}
                            >
                              {(itemAttributes[item.itemId] || []).length === 0 && (
                                <MenuItem value="">No Attribute</MenuItem>
                              )}
                              {(itemAttributes[item.itemId] || []).map(attr => (
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
                                    attribute: si.selectedAttribute || null
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
                                    attribute: si.selectedAttribute || null
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>View Combo Details</DialogTitle>
        <DialogContent>
          {viewCombo && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {viewCombo.image && (
                  <Avatar
                    src={viewCombo.image}
                    sx={{ width: 80, height: 80, borderRadius: 2 }}
                  />
                )}
                <Box>
                  <Typography variant="h5" fontWeight="bold">{viewCombo.name}</Typography>
                  <Typography variant="body1" color="text.secondary">{viewCombo.description}</Typography>
                  {selectedRestaurant === 'all' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Restaurant Name: {viewCombo.restaurantName || 'Unknown Restaurant'}
                    </Typography>
                  )}
                  <Chip
                    label={viewCombo.category}
                    color={getCategoryColor(viewCombo.category)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Items in Combo:</Typography>
                <Grid container spacing={2}>
                  {viewCombo.items?.map((item, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{item.itemId?.name}</Typography>
                        <Typography variant="body2">Quantity: {item.quantity}</Typography>
                        {item.attribute && (
                          <Typography variant="body2">Attribute: {item.attribute?.name}</Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  Total Price: ₹{viewCombo.price}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Combo"
        message="Are you sure you want to delete the combo"
        itemName={comboToDelete?.name}
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