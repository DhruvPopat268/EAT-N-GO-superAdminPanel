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
  TextField
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { IconAdjustments, IconPlus } from '@tabler/icons-react';

const mockAttributes = [
  { 
    id: 1, 
    name: 'Size', 
    createdAt: '2024-01-15'
  },
  { 
    id: 2, 
    name: 'Weight', 
    createdAt: '2024-01-16'
  },
  { 
    id: 3, 
    name: 'Volume', 
    createdAt: '2024-01-17'
  },
  { 
    id: 4, 
    name: 'Pieces', 
    createdAt: '2024-01-18'
  }
];

export default function AttributesManagement() {
  const theme = useTheme();
  const [attributes, setAttributes] = useState(mockAttributes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleAddAttribute = () => {
    setEditMode(false);
    setFormData({ name: '' });
    setDialogOpen(true);
  };

  const handleEditAttribute = (attribute) => {
    setEditMode(true);
    setSelectedAttribute(attribute);
    setFormData({ name: attribute.name });
    setDialogOpen(true);
  };

  const handleDeleteAttribute = (id) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      setAttributes(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = () => {
    if (editMode) {
      setAttributes(prev => prev.map(item => 
        item.id === selectedAttribute.id 
          ? { ...item, name: formData.name }
          : item
      ));
    } else {
      const newAttribute = {
        id: Date.now(),
        name: formData.name,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAttributes(prev => [...prev, newAttribute]);
    }
    setDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconAdjustments size={32} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Attributes Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={handleAddAttribute}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add Attributes
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage menu item attributes for your restaurant
          </Typography>
        </Box>
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
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Attribute Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconAdjustments size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No attributes found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Attributes" to create your first attribute
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attribute, index) => (
                    <Fade in timeout={1200 + index * 100} key={attribute.id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {attribute.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(attribute.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Attribute" arrow>
                              <IconButton
                                onClick={() => handleEditAttribute(attribute)}
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
                            <Tooltip title="Delete Attribute" arrow>
                              <IconButton
                                onClick={() => handleDeleteAttribute(attribute.id)}
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
            {editMode ? 'Edit Attribute' : 'Add New Attribute'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Attribute Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter attribute name"
            />
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
            disabled={!formData.name}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}