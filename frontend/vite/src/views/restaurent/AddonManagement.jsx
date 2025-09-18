import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import { Edit, Delete, CloudUpload, Add, Remove } from '@mui/icons-material';
import { IconPackage, IconPlus } from '@tabler/icons-react';

const mockCategories = [
  { id: 'veg', name: 'Veg' },
  { id: 'non-veg', name: 'Non-Veg' },
  { id: 'mixed', name: 'Mixed' }
];

const mockSubcategories = [
  { id: 'pizza', name: 'Pizza', category: 'veg' },
  { id: 'burger', name: 'Burger', category: 'non-veg' },
  { id: 'chinese', name: 'Chinese', category: 'mixed' },
  { id: 'beverages', name: 'Beverages', category: 'veg' }
];

const mockAttributes = [
  { id: 'size', name: 'Size' },
  { id: 'weight', name: 'Weight' },
  { id: 'volume', name: 'Volume' },
  { id: 'pieces', name: 'Pieces' }
];

const mockAddons = [
  {
    id: 1,
    name: 'Extra Cheese',
    category: 'veg',
    subcategory: 'pizza',
    image: '/cheese.jpg',
    status: 'active',
    attributes: [
      { attribute: 'size', price: 50 },
      { attribute: 'weight', price: 30 }
    ],
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Chicken Patty',
    category: 'non-veg',
    subcategory: 'burger',
    image: '/chicken.jpg',
    status: 'active',
    attributes: [
      { attribute: 'pieces', price: 80 }
    ],
    createdAt: '2024-01-16'
  }
];

export default function AddonManagement() {
  const theme = useTheme();
  const [addons, setAddons] = useState(mockAddons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: null,
    subcategory: null,
    image: null,
    attributes: [{ attribute: null, price: '' }]
  });

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

  const handleAddAddon = () => {
    setEditMode(false);
    setFormData({
      name: '',
      category: null,
      subcategory: null,
      image: null,
      attributes: [{ attribute: null, price: '' }]
    });
    setDialogOpen(true);
  };

  const handleEditAddon = (addon) => {
    setEditMode(true);
    setSelectedAddon(addon);
    setFormData({
      name: addon.name,
      category: mockCategories.find(c => c.id === addon.category),
      subcategory: mockSubcategories.find(s => s.id === addon.subcategory),
      image: null,
      attributes: addon.attributes.map(attr => ({
        attribute: mockAttributes.find(a => a.id === attr.attribute),
        price: attr.price
      }))
    });
    setDialogOpen(true);
  };

  const handleDeleteAddon = (id) => {
    if (window.confirm('Are you sure you want to delete this addon?')) {
      setAddons(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleStatusToggle = (id) => {
    setAddons(prev => prev.map(item =>
      item.id === id
        ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
        : item
    ));
  };

  const handleSubmit = () => {
    const addonData = {
      name: formData.name,
      category: formData.category?.id,
      subcategory: formData.subcategory?.id,
      image: '/default-addon.jpg',
      attributes: formData.attributes.map(attr => ({
        attribute: attr.attribute?.id,
        price: parseInt(attr.price)
      }))
    };

    if (editMode) {
      setAddons(prev => prev.map(item =>
        item.id === selectedAddon.id
          ? { ...item, ...addonData }
          : item
      ));
    } else {
      const newAddon = {
        id: Date.now(),
        ...addonData,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAddons(prev => [...prev, newAddon]);
    }
    setDialogOpen(false);
  };

  const filteredSubcategories = mockSubcategories.filter(sub =>
    !formData.category || sub.category === formData.category.id
  );

  const availableSubcategories = mockSubcategories.filter(sub =>
    subcategoryFilter === 'all' || sub.category === categoryFilter
  );

  const filteredAddons = addons.filter(addon => {
    const categoryMatch = categoryFilter === 'all' || addon.category === categoryFilter;
    const subcategoryMatch = subcategoryFilter === 'all' || addon.subcategory === subcategoryFilter;
    const statusMatch = statusFilter === 'all' || addon.status === statusFilter;
    return categoryMatch && subcategoryMatch && statusMatch;
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
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSubcategoryFilter('all');
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="veg">Veg</MenuItem>
                <MenuItem value="non-veg">Non-Veg</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={subcategoryFilter}
                label="Subcategory"
                onChange={(e) => setSubcategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Subcategories</MenuItem>
                {availableSubcategories.map(sub => (
                  <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                ))}
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
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', background: 'white' }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Addon</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subcategory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Attributes & Pricing</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAddons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
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
                  filteredAddons.map((addon, index) => (
                    <Fade in timeout={1200 + index * 100} key={addon.id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
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
                        <TableCell>
                          <Chip
                            label={mockCategories.find(c => c.id === addon.category)?.name}
                            color={getCategoryColor(addon.category)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={mockSubcategories.find(s => s.id === addon.subcategory)?.name}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {addon.attributes.map((attr, i) => (
                              <Chip
                                key={i}
                                label={`${mockAttributes.find(a => a.id === attr.attribute)?.name}: ₹${attr.price}`}
                                color="secondary"
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={addon.status === 'active'}
                              onChange={() => handleStatusToggle(addon.id)}
                              size="small"
                            />
                            <Chip
                              label={addon.status}
                              color={addon.status === 'active' ? 'success' : 'error'}
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
                                onClick={() => handleDeleteAddon(addon.id)}
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
                options={mockCategories}
                getOptionLabel={(option) => option.name}
                value={formData.category}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, category: newValue, subcategory: null });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Category" />
                )}
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
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                />
              </Button>
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
                    options={mockAttributes}
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
            disabled={!formData.name || !formData.category || !formData.subcategory || 
              formData.attributes.some(attr => !attr.attribute || !attr.price)}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}