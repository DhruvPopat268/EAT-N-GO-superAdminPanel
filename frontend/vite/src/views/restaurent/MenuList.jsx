import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Fade,
  InputAdornment,
  Autocomplete,
  IconButton,
  Tooltip,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import { Edit, Delete, Visibility, CloudUpload } from '@mui/icons-material';
import { IconBuildingStore, IconSearch, IconChefHat } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import ConfirmDialog from '../../utils/ConfirmDialog.jsx';
import { Snackbar, Alert } from '@mui/material';
import { useToast } from '../../utils/toast.jsx';



const categoryOptions = [
  { id: 'all', name: 'All Categories' },
  { id: 'Veg', name: 'Veg' },
  { id: 'Non-Veg', name: 'Non-Veg' },
  { id: 'Mixed', name: 'Mixed' }
];




export default function MenuList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ restaurantId: 'all', name: 'All Restaurants' });
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
  const [selectedSubcategory, setSelectedSubcategory] = useState({ id: 'all', name: 'All Subcategories', category: 'all' });
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);

  React.useEffect(() => {
    fetchRestaurantNames();
  }, []);

  React.useEffect(() => {
    fetchMenuItems();
    fetchSubcategories();
  }, [selectedRestaurant]);

  const fetchRestaurantNames = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setRestaurants(result.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant names:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      let response;
      if (selectedRestaurant?.restaurantId === 'all') {
        response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/all`, {
          credentials: 'include'
        });
      } else if (selectedRestaurant?.restaurantId) {
        response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ restaurantId: selectedRestaurant.restaurantId })
        });
      } else {
        setSubcategories([]);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setSubcategories([{ id: 'all', name: 'All Subcategories', category: 'all' }, ...result.data.map(sub => ({ id: sub._id, name: sub.name, category: sub.category }))]);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([{ id: 'all', name: 'All Subcategories', category: 'all' }]);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedRestaurant?.restaurantId === 'all') {
        response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/all`, {
          credentials: 'include'
        });
      } else if (selectedRestaurant?.restaurantId) {
        response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/byRestaurant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ restaurantId: selectedRestaurant.restaurantId })
        });
      } else {
        setMenuItems([]);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setMenuItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (itemId) => {
    const item = menuItems.find(item => item._id === itemId);
    const newStatus = !item.isAvailable;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          itemId: itemId,
          restaurantId: item.restaurantId,
          isAvailable: newStatus
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(prevItems => 
          prevItems.map(item => 
            item._id === itemId 
              ? { ...item, isAvailable: newStatus }
              : item
          )
        );
        toast.success(`Item ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePopularToggle = async (itemId) => {
    const item = menuItems.find(item => item._id === itemId);
    const newPopularStatus = !item.isPopular;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          itemId: itemId,
          restaurantId: item.restaurantId,
          isPopular: newPopularStatus
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(prevItems => 
          prevItems.map(item => 
            item._id === itemId 
              ? { ...item, isPopular: newPopularStatus }
              : item
          )
        );
        toast.success(`Item ${newPopularStatus ? 'marked as popular' : 'unmarked as popular'} successfully!`);
      } else {
        toast.error(result.message || 'Failed to update popular status');
      }
    } catch (error) {
      console.error('Error updating popular status:', error);
      toast.error('Failed to update popular status');
    }
  };

  const handleViewItem = (item) => {
    // Navigate to item detail page
    navigate(`/restaurant/item-detail/${item.restaurantId}/${item._id}`);
  };

  const handleEditItem = (item) => {
    // Navigate to add item page with item data for editing
    navigate('/restaurant/add-menu-item', { 
      state: { 
        editMode: true, 
        itemData: item,
        restaurantId: item.restaurantId
      } 
    });
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            itemId: itemToDelete._id, 
            restaurantId: itemToDelete.restaurantId 
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setMenuItems(prevItems => 
            prevItems.filter(item => item._id !== itemToDelete._id)
          );
          toast.success('Menu item deleted successfully!');
        } else {
          toast.error(result.message || 'Failed to delete menu item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete menu item');
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSaveEdit = () => {
    setMenuItems(prevItems => {
      const updatedItems = { ...prevItems };
      Object.keys(updatedItems).forEach(restaurantId => {
        updatedItems[restaurantId] = updatedItems[restaurantId].map(item => 
          item.id === selectedItem.id 
            ? { 
                ...item, 
                name: editFormData.name,
                description: editFormData.description,
                price: editFormData.price,
                attributeValue: editFormData.attributeValue,
                attributeUnit: editFormData.attributeUnit,
                category: editFormData.category?.id,
                subcategory: editFormData.subcategory?.id
              }
            : item
        );
      });
      return updatedItems;
    });
    setEditDialogOpen(false);
  };

  const getFilteredItems = () => {
    let items = menuItems || [];
    
    // Filter by category
    if (selectedCategory?.id !== 'all') {
      items = items.filter(item => item.category?.toLowerCase() === selectedCategory.id.toLowerCase());
    }
    
    // Filter by subcategory
    if (selectedSubcategory?.id !== 'all') {
      items = items.filter(item => item.subcategory?.name?.toLowerCase() === selectedSubcategory.name?.toLowerCase());
    }
    
    // Filter by status
    if (selectedStatus !== 'All Status') {
      const statusValue = selectedStatus === 'active';
      items = items.filter(item => item.isAvailable === statusValue);
    }
    
    // Filter by search term
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };

  const filteredItems = getFilteredItems();

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconChefHat size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Menu List
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            View and manage restaurant menu items
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card 
          sx={{ 
            borderRadius: 3, 
            border: '1px solid #e0e0e0', 
            overflow: 'hidden',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              <Autocomplete
                sx={{ minWidth: 250 }}
                options={[{ restaurantId: 'all', name: 'All Restaurants' }, ...restaurants]}
                getOptionLabel={(option) => option.name}
                value={selectedRestaurant}
                onChange={(event, newValue) => {
                  setFilterLoading(true);
                  setSelectedRestaurant(newValue || { restaurantId: 'all', name: 'All Restaurants' });
                  setSelectedSubcategory({ id: 'all', name: 'All Subcategories', category: 'all' });
                  setTimeout(() => setFilterLoading(false), 300);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Restaurant"
                    placeholder="Search restaurants..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconBuildingStore size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {selectedRestaurant && (
                <>
                  <Autocomplete
                    sx={{ minWidth: 180 }}
                    options={categoryOptions}
                    getOptionLabel={(option) => option.name}
                    value={selectedCategory}
                    onChange={(event, newValue) => {
                      setFilterLoading(true);
                      setSelectedCategory(newValue || categoryOptions[0]);
                      setSelectedSubcategory({ id: 'all', name: 'All Subcategories', category: 'all' });
                      setTimeout(() => setFilterLoading(false), 300);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        placeholder="Select category..."
                      />
                    )}
                  />

                  <Autocomplete
                    sx={{ minWidth: 200 }}
                    options={subcategories.filter(sub => 
                      selectedCategory?.id === 'all' || sub.category === selectedCategory?.id
                    )}
                    getOptionLabel={(option) => option.name}
                    value={selectedSubcategory}
                    onChange={(event, newValue) => {
                      setFilterLoading(true);
                      setSelectedSubcategory(newValue || { id: 'all', name: 'All Subcategories', category: 'all' });
                      setTimeout(() => setFilterLoading(false), 300);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subcategory"
                        placeholder="Select subcategory..."
                      />
                    )}
                  />

                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      label="Status"
                      onChange={(e) => {
                        setFilterLoading(true);
                        setSelectedStatus(e.target.value);
                        setTimeout(() => setFilterLoading(false), 300);
                      }}
                    >
                      <MenuItem value="All Status">All Status</MenuItem>
                      <MenuItem value="active">Available</MenuItem>
                      <MenuItem value="inactive">Unavailable</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
            </Stack>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Id</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                  {selectedRestaurant?.restaurantId === 'all' && (
                    <TableCell sx={{ fontWeight: 700 }}>Restaurant</TableCell>
                  )}
                  
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subcategory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Attributes</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Popular</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 11 : 10} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading menu items..." />
                    </TableCell>
                  </TableRow>
                ) : filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 11 : 10} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading menu items..." />
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 11 : 10} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconChefHat size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No menu items found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm || selectedCategory?.id !== 'all' || selectedSubcategory?.id !== 'all' || selectedStatus !== 'All Status'
                            ? 'Try adjusting your filters'
                            : 'No menu items available'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <Fade in timeout={1200 + index * 100} key={item._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>#{index + 1}</TableCell>
                        <TableCell>
                          <Avatar 
                            src={item.images?.[0]} 
                            sx={{ 
                              bgcolor: 'white', 
                              width: 60, 
                              height: 60,
                              borderRadius: 2
                            }}
                          >
                            <IconChefHat size={24} />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.name}
                          </Typography>
                        </TableCell>
                        {selectedRestaurant?.restaurantId === 'all' && (
                          <TableCell>
                            <Typography variant="body2">
                              {item.restaurantName || 'Unknown Restaurant'}
                            </Typography>
                          </TableCell>
                        )}
                       
                        <TableCell>
                          <Chip 
                            label={item.category} 
                            color={item.category.toLowerCase() === 'veg' ? 'success' : item.category.toLowerCase() === 'non-veg' ? 'error' : 'warning'} 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.subcategory?.name || 'N/A'} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {item.attributes && item.attributes.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {item.attributes.map((attr, idx) => (
                                <Typography key={idx} variant="body2" sx={{ fontWeight: 500 }}>
                                  {attr.name}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No attributes
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.attributes && item.attributes.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {item.attributes.map((attr, idx) => (
                                <Typography key={idx} variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                  ₹{attr.price}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={item.isAvailable}
                              onChange={() => handleStatusToggle(item._id)}
                              size="small"
                            />
                            <Chip 
                              label={item.isAvailable ? 'Available' : 'Unavailable'} 
                              color={item.isAvailable ? 'success' : 'error'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={item.isPopular || false}
                              onChange={() => handlePopularToggle(item._id)}
                              size="small"
                              color="warning"
                            />
                            <Chip 
                              label={item.isPopular ? 'Popular' : 'Regular'} 
                              color={item.isPopular ? 'warning' : 'default'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Item" arrow>
                              <IconButton
                                onClick={() => handleViewItem(item)}
                                sx={{ 
                                  color: 'info.main',
                                  borderRadius: 1,
                                  '&:hover': {
                                    backgroundColor: 'info.main',
                                    color: 'white',
                                    transform: 'scale(1.08)'
                                  }
                                }}
                              >
                                <Visibility sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Item" arrow>
                              <IconButton
                                onClick={() => handleEditItem(item)}
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
                            <Tooltip title="Delete Item" arrow>
                              <IconButton
                                onClick={() => handleDeleteItem(item)}
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
        </Card>
      </Fade>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>View Menu Item</DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedItem && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
                    {selectedItem.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Avatar 
                          src={image} 
                          sx={{ 
                            width: 80, 
                            height: 80,
                            borderRadius: 2,
                            border: index === 0 ? '2px solid' : 'none',
                            borderColor: 'primary.main'
                          }}
                        >
                          <IconChefHat size={30} />
                        </Avatar>
                        {index === 0 && (
                          <Chip 
                            label="PRIMARY" 
                            size="small" 
                            color="primary" 
                            sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              fontSize: '0.6rem',
                              height: 16
                            }} 
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      width: 100, 
                      height: 100,
                      borderRadius: 2,
                      mb: 2
                    }}
                  >
                    <IconChefHat size={40} />
                  </Avatar>
                )}
                <Typography variant="h5" fontWeight="bold" textAlign="center">{selectedItem.name}</Typography>
                <Typography variant="h6" color="primary.main">₹{selectedItem.attributes?.[0]?.price || 0}</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.description || 'No description available'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                    Category & Subcategory
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={selectedItem.category} 
                      color={selectedItem.category?.toLowerCase() === 'veg' ? 'success' : selectedItem.category?.toLowerCase() === 'non-veg' ? 'error' : 'warning'} 
                      variant="outlined"
                    />
                    <Chip 
                      label={selectedItem.subcategory?.name || 'N/A'} 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedItem.isAvailable ? 'Available' : 'Unavailable'} 
                    color={selectedItem.isAvailable ? 'success' : 'error'}
                    variant="filled"
                  />
                </Grid>
                
                {selectedItem.attributes && selectedItem.attributes.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                      Attributes
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedItem.attributes.map((attr, index) => (
                        <Chip 
                          key={index}
                          label={`${attr.name}: ₹${attr.price}`} 
                          color="secondary" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                
                {selectedRestaurant?.restaurantId === 'all' && (
                  <Grid item xs={12}>
                    <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                      Restaurant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedItem.restaurantName || 'Unknown Restaurant'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="outlined">Close</Button>
          <Button onClick={() => handleEditItem(selectedItem)} variant="contained">Edit Item</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Menu Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={editFormData.price || ''}
                onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={categoryOptions}
                getOptionLabel={(option) => option.name}
                value={editFormData.category || null}
                onChange={(event, newValue) => setEditFormData({...editFormData, category: newValue})}
                renderInput={(params) => (
                  <TextField {...params} label="Category" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={subcategories}
                getOptionLabel={(option) => option.name}
                value={editFormData.subcategory || null}
                onChange={(event, newValue) => setEditFormData({...editFormData, subcategory: newValue})}
                renderInput={(params) => (
                  <TextField {...params} label="Subcategory" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Attribute Value"
                type="number"
                value={editFormData.attributeValue || ''}
                onChange={(e) => setEditFormData({...editFormData, attributeValue: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Attribute Unit"
                value={editFormData.attributeUnit || ''}
                onChange={(e) => setEditFormData({...editFormData, attributeUnit: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteItem}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item"
        itemName={itemToDelete?.name}
      />
      
      {/* Toast Notifications */}
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