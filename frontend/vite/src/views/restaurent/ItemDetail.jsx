import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Chip,
  Avatar,
  Stack,
  Grid,
  useTheme,
  Fade,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ImageList,
  ImageListItem
} from '@mui/material';
import { ArrowBack, Restaurant } from '@mui/icons-material';
import { IconChefHat } from '@tabler/icons-react';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';

export default function ItemDetail() {
  const theme = useTheme();
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemDetail();
  }, [itemId]);

  const fetchItemDetail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ itemId })
      });
      const result = await response.json();
      if (result.success) {
        setItem(result.data);
      }
    } catch (error) {
      console.error('Error fetching item detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ThemeSpinner message="Loading item details..." />;
  }

  if (!item) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Item not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              variant="outlined"
            >
              Back
            </Button>
            <IconChefHat size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Item Details
            </Typography>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Images Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Images</Typography>
            {item.images && item.images.length > 0 ? (
              <ImageList cols={2} rowHeight={200} gap={8}>
                {item.images.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image}
                      alt={`${item.name} ${index + 1}`}
                      loading="lazy"
                      style={{ borderRadius: 8 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <IconChefHat size={48} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  No images available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Basic Info Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{item.name}</Typography>
                <Typography variant="h5" color="primary.main" sx={{ mt: 1 }}>
                  ₹{item.attributes?.[0]?.price || 0}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">{item.description}</Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip 
                  label={item.category} 
                  color={item.category.toLowerCase() === 'veg' ? 'success' : item.category.toLowerCase() === 'non-veg' ? 'error' : 'warning'} 
                  variant="outlined"
                />
                <Chip 
                  label={item.subcategory?.name || 'N/A'} 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={item.isAvailable ? 'Available' : 'Unavailable'} 
                  color={item.isAvailable ? 'success' : 'error'}
                  variant="filled"
                />
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Food Types Section */}
        {item.foodTypes && item.foodTypes.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Food Types</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {item.foodTypes.map((type, index) => (
                  <Chip 
                    key={index}
                    label={type} 
                    color="secondary" 
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Card>
          </Grid>
        )}

        {/* Customizations Section */}
        {item.customizations && item.customizations.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Customizations</Typography>
              <Stack spacing={2}>
                {item.customizations.map((customization, index) => (
                  <Box key={index}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {customization.name}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Option</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {customization.options.map((option, optIndex) => (
                            <TableRow key={optIndex}>
                              <TableCell>{option.label}</TableCell>
                              <TableCell>{option.quantity}</TableCell>
                              <TableCell>{option.unit}</TableCell>
                              <TableCell>₹{option.price}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>
        )}

        {/* Additional Info */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Additional Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Currency</Typography>
                <Typography variant="body1">{item.currency}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Created</Typography>
                <Typography variant="body1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body1">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Item ID</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {item._id}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}