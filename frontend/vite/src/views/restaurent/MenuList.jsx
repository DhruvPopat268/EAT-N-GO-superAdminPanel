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

const mockRestaurants = [
  { id: 1, name: 'Pizza Palace' },
  { id: 2, name: 'Burger House' },
  { id: 3, name: 'Sushi World' },
  { id: 4, name: 'Taco Bell' }
];

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

const mockMenuItems = {
  1: [
    { 
      id: 1, 
      name: 'Margherita Pizza', 
      description: 'Classic pizza with tomato and mozzarella', 
      price: 299, 
      category: 'veg', 
      subcategory: 'pizza',
      attributeValue: 1,
      attributeUnit: 'medium', 
      status: 'active',
      image: '/pizza1.jpg'
    },
    { 
      id: 2, 
      name: 'Pepperoni Pizza', 
      description: 'Pizza with pepperoni and cheese', 
      price: 399, 
      category: 'non-veg', 
      subcategory: 'pizza',
      attributeValue: 1,
      attributeUnit: 'large', 
      status: 'active',
      image: '/pizza2.jpg'
    },
    { 
      id: 3, 
      name: 'Coca Cola', 
      description: 'Refreshing cold drink', 
      price: 50, 
      category: 'veg', 
      subcategory: 'beverages',
      attributeValue: 330,
      attributeUnit: 'ml', 
      status: 'inactive',
      image: '/coke.jpg'
    }
  ],
  2: [
    { 
      id: 4, 
      name: 'Chicken Burger', 
      description: 'Grilled chicken burger with lettuce', 
      price: 199, 
      category: 'non-veg', 
      subcategory: 'burger',
      attributeValue: 1,
      attributeUnit: 'regular', 
      status: 'active',
      image: '/burger1.jpg'
    },
    { 
      id: 5, 
      name: 'Paneer Burger', 
      description: 'Grilled paneer burger with vegetables', 
      price: 179, 
      category: 'veg', 
      subcategory: 'burger',
      attributeValue: 1,
      attributeUnit: 'regular', 
      status: 'active',
      image: '/burger2.jpg'
    }
  ],
  3: [
    { 
      id: 6, 
      name: 'Hakka Noodles', 
      description: 'Stir-fried noodles with vegetables', 
      price: 180, 
      category: 'veg', 
      subcategory: 'chinese',
      attributeValue: 250,
      attributeUnit: 'grams', 
      status: 'active',
      image: '/noodles.jpg'
    }
  ],
  4: [
    { 
      id: 7, 
      name: 'Butter Chicken', 
      description: 'Creamy tomato-based chicken curry', 
      price: 320, 
      category: 'non-veg', 
      subcategory: 'punjabi',
      attributeValue: 2,
      attributeUnit: 'pieces', 
      status: 'active',
      image: '/butter-chicken.jpg'
    }
  ]
};

export default function MenuList() {
  const theme = useTheme();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryOptions[0]);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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
    const item = filteredItems.find(item => item.id === itemId);
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleEditItem = (itemId) => {
    const item = filteredItems.find(item => item.id === itemId);
    setSelectedItem(item);
    setEditFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      attributeValue: item.attributeValue,
      attributeUnit: item.attributeUnit,
      category: categoryOptions.find(cat => cat.id === item.category),
      subcategory: subcategoryOptions.find(sub => sub.id === item.subcategory)
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
    
    let items = menuItems[selectedRestaurant.id] || [];
    
    // Filter by category
    if (selectedCategory.id !== 'all') {
      items = items.filter(item => item.category === selectedCategory.id);
    }
    
    // Filter by subcategory
    if (selectedSubcategory.id !== 'all') {
      items = items.filter(item => item.subcategory === selectedSubcategory.id);
    }
    
    // Filter by status
    if (selectedStatus !== 'All Status') {
      items = items.filter(item => item.status === selectedStatus);
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
                options={mockRestaurants}
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
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subcategory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Attributes</TableCell>
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
                          {searchTerm || selectedCategory.id !== 'all' || selectedSubcategory.id !== 'all' || selectedStatus !== 'All Status'
                            ? 'Try adjusting your filters'
                            : 'This restaurant has no menu items yet'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <Fade in timeout={1200 + index * 100} key={item.id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              src={item.image} 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                width: 50, 
                                height: 50,
                                borderRadius: 2
                              }}
                            >
                              <IconChefHat size={24} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {item.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                            {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={categoryOptions.find(cat => cat.id === item.category)?.name || item.category} 
                            color={item.category === 'veg' ? 'success' : item.category === 'non-veg' ? 'error' : 'warning'} 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={subcategoryOptions.find(sub => sub.id === item.subcategory)?.name || item.subcategory} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold">
                            ₹{item.price}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${item.attributeValue} ${item.attributeUnit}`} 
                            color="secondary" 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={item.status === 'active'}
                              onChange={() => handleStatusToggle(item.id)}
                              size="small"
                            />
                            <Chip 
                              label={item.status} 
                              color={item.status === 'active' ? 'success' : 'error'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Item" arrow>
                              <IconButton
                                onClick={() => handleViewItem(item.id)}
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
                                onClick={() => handleEditItem(item.id)}
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
                                onClick={() => handleDeleteItem(item.id)}
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
                    label={subcategoryOptions.find(sub => sub.id === selectedItem.subcategory)?.name} 
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