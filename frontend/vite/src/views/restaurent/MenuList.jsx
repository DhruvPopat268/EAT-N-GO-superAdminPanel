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



const categoryOptions = [
  { id: 'all', name: 'All Categories' },
  { id: 'veg', name: 'Veg' },
  { id: 'non-veg', name: 'Non-Veg' },
  { id: 'mixed', name: 'Mixed' }
];

const subcategoryOptions = [
  { id: 'all', name: 'All Subcategories' },
  { id: 'burger', name: 'Burger' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'chinese', name: 'Chinese' },
  { id: 'punjabi', name: 'Punjabi' },
  { id: 'south-indian', name: 'South Indian' },
  { id: 'north-indian', name: 'North Indian' },
  { id: 'italian', name: 'Italian' },
  { id: 'mexican', name: 'Mexican' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'biryani', name: 'Biryani' },
  { id: 'rolls', name: 'Rolls' },
  { id: 'sandwiches', name: 'Sandwiches' }
];


export default function MenuList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryOptions[0]);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  React.useEffect(() => {
    fetchRestaurantNames();
  }, []);

  React.useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant.restaurantId);
    } else {
      setMenuItems([]);
    }
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

  const fetchMenuItems = async (restaurantId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/byRestaurant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ restaurantId })
      });
      const result = await response.json();
      if (result.success) {
        setMenuItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleStatusToggle = (itemId) => {
    setMenuItems(prevItems => {
      const updatedItems = { ...prevItems };
      Object.keys(updatedItems).forEach(restaurantId => {
        updatedItems[restaurantId] = updatedItems[restaurantId].map(item => 
          item.id === itemId 
            ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
            : item
        );
      });
      return updatedItems;
    });
  };

  const handleViewItem = (itemId) => {
    navigate(`/item-detail/${itemId}`);
  };

  const handleEditItem = (itemId) => {
    const item = filteredItems.find(item => item._id === itemId);
    setSelectedItem(item);
    setEditFormData({
      name: item.name,
      description: item.description,
      price: item.attributes[0]?.price || 0,
      category: categoryOptions.find(cat => cat.id.toLowerCase() === item.category.toLowerCase()),
      subcategory: { id: item.subcategory._id, name: item.subcategory.name }
    });
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setMenuItems(prevItems => {
        const updatedItems = { ...prevItems };
        Object.keys(updatedItems).forEach(restaurantId => {
          updatedItems[restaurantId] = updatedItems[restaurantId].filter(item => item.id !== itemId);
        });
        return updatedItems;
      });
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
    if (!selectedRestaurant) return [];
    
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
                options={restaurants}
                getOptionLabel={(option) => option.name}
                value={selectedRestaurant}
                onChange={(event, newValue) => setSelectedRestaurant(newValue)}
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
                    onChange={(event, newValue) => setSelectedCategory(newValue || categoryOptions[0])}
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
                    options={subcategoryOptions}
                    getOptionLabel={(option) => option.name}
                    value={selectedSubcategory}
                    onChange={(event, newValue) => setSelectedSubcategory(newValue || subcategoryOptions[0])}
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
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <MenuItem value="All Status">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
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
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subcategory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!selectedRestaurant ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconBuildingStore size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          Please select a restaurant first
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Choose a restaurant from the dropdown to view menu items
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconChefHat size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No menu items found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm || selectedCategory?.id !== 'all' || selectedSubcategory?.id !== 'all' || selectedStatus !== 'All Status'
                            ? 'Try adjusting your filters'
                            : 'This restaurant has no menu items yet'
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
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                            {item.description}
                          </Typography>
                        </TableCell>
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
                          <Typography variant="h6" fontWeight="bold">
                            ₹{item.attributes?.[0]?.price || 0}
                          </Typography>
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Item" arrow>
                              <IconButton
                                onClick={() => handleViewItem(item._id)}
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
                                onClick={() => handleEditItem(item._id)}
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
                                onClick={() => handleDeleteItem(item._id)}
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
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} PaperProps={{ sx: { width: 400, maxWidth: 400 } }}>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>View Menu Item</DialogTitle>
        <DialogContent sx={{ px: 3, py: 2, width: '100%' }}>
          {selectedItem && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={selectedItem.image} 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 60, 
                    height: 60,
                    borderRadius: 2,
                    mb: 1
                  }}
                >
                  <IconChefHat size={24} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" textAlign="center">{selectedItem.name}</Typography>
                <Typography variant="h6" color="primary.main">₹{selectedItem.price}</Typography>
              </Box>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.primary">
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.description}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={categoryOptions.find(cat => cat.id === selectedItem.category)?.name} 
                    color={selectedItem.category === 'veg' ? 'success' : selectedItem.category === 'non-veg' ? 'error' : 'warning'} 
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    label={selectedItem.subcategory?.name || 'N/A'} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${selectedItem.attributeValue} ${selectedItem.attributeUnit}`} 
                    color="secondary" 
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    label={selectedItem.status} 
                    color={selectedItem.status === 'active' ? 'success' : 'error'}
                    variant="filled"
                    size="small"
                  />
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="outlined" size="small" fullWidth>Close</Button>
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
                options={subcategoryOptions}
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
    </Box>
  );
}