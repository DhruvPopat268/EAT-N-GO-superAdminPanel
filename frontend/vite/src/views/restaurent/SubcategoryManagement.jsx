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
  Grid,
  Chip,
  Switch
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import { IconCategory, IconPlus } from '@tabler/icons-react';

const mockSubcategories = [
  { 
    id: 1, 
    name: 'Pizza', 
    category: 'veg', 
    image: '/pizza-category.jpg',
    status: 'active',
    createdAt: '2024-01-15'
  },
  { 
    id: 2, 
    name: 'Burger', 
    category: 'non-veg', 
    image: '/burger-category.jpg',
    status: 'active',
    createdAt: '2024-01-16'
  },
  { 
    id: 3, 
    name: 'Chinese', 
    category: 'mixed', 
    image: '/chinese-category.jpg',
    status: 'inactive',
    createdAt: '2024-01-17'
  },
  { 
    id: 4, 
    name: 'Beverages', 
    category: 'veg', 
    image: '/beverages-category.jpg',
    status: 'active',
    createdAt: '2024-01-18'
  }
];

export default function SubcategoryManagement() {
  const theme = useTheme();
  const [subcategories, setSubcategories] = useState(mockSubcategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    image: null
  });

  const handleAddSubcategory = () => {
    setEditMode(false);
    setFormData({ name: '', category: '', image: null });
    setDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setEditMode(true);
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      category: subcategory.category,
      image: null
    });
    setDialogOpen(true);
  };

  const handleDeleteSubcategory = (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      setSubcategories(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleStatusToggle = (id) => {
    setSubcategories(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
        : item
    ));
  };

  const handleSubmit = () => {
    if (editMode) {
      setSubcategories(prev => prev.map(item => 
        item.id === selectedSubcategory.id 
          ? { ...item, name: formData.name, category: formData.category }
          : item
      ));
    } else {
      const newSubcategory = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        image: '/default-category.jpg',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSubcategories(prev => [...prev, newSubcategory]);
    }
    setDialogOpen(false);
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
                        <TableCell>
                          <Chip 
                            label={subcategory.category.charAt(0).toUpperCase() + subcategory.category.slice(1)} 
                            color={getCategoryColor(subcategory.category)} 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={subcategory.status === 'active'}
                              onChange={() => handleStatusToggle(subcategory.id)}
                              size="small"
                            />
                            <Chip 
                              label={subcategory.status} 
                              color={subcategory.status === 'active' ? 'success' : 'error'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(subcategory.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Subcategory" arrow>
                              <IconButton
                                onClick={() => handleEditSubcategory(subcategory)}
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
                            <Tooltip title="Delete Subcategory" arrow>
                              <IconButton
                                onClick={() => handleDeleteSubcategory(subcategory.id)}
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            width: 400,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {editMode ? 'Edit Subcategory' : 'Add New Subcategory'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Subcategory Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter subcategory name"
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <MenuItem value="veg">Veg</MenuItem>
                <MenuItem value="non-veg">Non-Veg</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Subcategory Image
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ 
                    borderStyle: 'dashed',
                    py: 2,
                    textTransform: 'none'
                  }}
                >
                  {formData.image ? formData.image.name : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                  />
                </Button>
                {formData.image && (
                  <Typography variant="caption" color="text.secondary">
                    Selected: {formData.image.name}
                  </Typography>
                )}
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
            disabled={!formData.name || !formData.category}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}