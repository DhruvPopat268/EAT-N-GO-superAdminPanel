import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Badge,
  Button,
  Stack,
  Grid,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from "@mui/material";
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import {
  Visibility,
  Restaurant,
  Phone,
  Email,
  LocationOn,
  Fastfood,
  Block,
  TrendingDown,
  Warning,
  CalendarToday,
  Star,
  CheckCircle
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function SuspendedRestaurants() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactivateDialog, setReactivateDialog] = useState({ open: false, restaurant: null });
  const [reactivating, setReactivating] = useState(false);

  React.useEffect(() => {
    fetchSuspendedRestaurants();
  }, []);

  const fetchSuspendedRestaurants = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/suspended`, { credentials: 'include' });
      const result = await response.json();
      if (result.success) {
        setRestaurants(result.data);
      }
    } catch (error) {
      console.error('Error fetching suspended restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ThemeSpinner message="Loading suspended restaurants..." />;
  }

  const handleView = (id) => {
    navigate(`/restaurant/detail/${id}`);
  };

  const handleReactivate = (restaurant) => {
    setReactivateDialog({ open: true, restaurant });
  };

  const confirmReactivate = async () => {
    if (!reactivateDialog.restaurant) return;
    
    setReactivating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/reactivate/${reactivateDialog.restaurant._id}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );
      
      const result = await response.json();
      if (result.success) {
        // Remove restaurant from suspended list
        setRestaurants(prev => prev.filter(r => r._id !== reactivateDialog.restaurant._id));
        setReactivateDialog({ open: false, restaurant: null });
      } else {
        console.error('Failed to reactivate restaurant:', result.message);
      }
    } catch (error) {
      console.error('Error reactivating restaurant:', error);
    } finally {
      setReactivating(false);
    }
  };

  const getDaysAgo = (dateString) => {
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Veg': return 'success';
      case 'Non-Veg': return 'error';
      case 'Mixed': return 'warning';
      default: return 'default';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient }) => (
    <Card
      sx={{
        background: gradient,
        color: 'white',
        borderRadius: 3,
        overflow: 'visible',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: 'white',
              width: 64,
              height: 64,
            }}
          >
            <Block sx={{ fontSize: 32, color: '#ff5722' }} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Suspended Restaurants
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Restaurants suspended due to poor ratings or policy violations
            </Typography>
          </Box>
        </Box>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Suspended"
              value={restaurants.length}
              subtitle="Currently suspended"
              icon={Block}
              gradient="linear-gradient(135deg, #ff5722 0%, #ff9800 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="This Month"
              value="3"
              subtitle="Recent suspensions"
              icon={TrendingDown}
              gradient="linear-gradient(135deg, #f44336 0%, #e91e63 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Rating"
              value="0.8"
              subtitle="Before suspension"
              icon={Star}
              gradient="linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Days"
              value="5"
              subtitle="Since suspension"
              icon={CalendarToday}
              gradient="linear-gradient(135deg, #607d8b 0%, #455a64 100%)"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Enhanced Main Table */}
      <Card
        sx={{
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.06)'
        }}
      >
        <Box
          sx={{
            p: 4,
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)'
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Suspended Restaurant Partners
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage restaurants that have been suspended
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha('#ff5722', 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Restaurant</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Location & Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Suspended Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {restaurants.map((row, index) => (
                <TableRow key={row._id}
                  onMouseEnter={() => setHoveredRow(row._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha('#ff5722', 0.04),
                      transform: 'translateX(8px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '& .action-buttons': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      }
                    },
                    borderLeft: hoveredRow === row._id ? `6px solid #ff5722` : '6px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  <TableCell sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Badge
                        badgeContent={getDaysAgo(row.updatedAt)}
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.75rem',
                            height: '22px',
                            minWidth: '22px',
                            fontWeight: 'bold'
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `white`,
                            width: 52,
                            height: 52,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            opacity: 0.6
                          }}
                        >
                          {getInitials(row.basicInfo?.restaurantName || row.restaurantName)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ opacity: 0.8 }}>
                          {row.basicInfo?.restaurantName || row.restaurantName}
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          Suspended {getDaysAgo(row.updatedAt)} days ago
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="500">
                          {row.contactDetails?.city || row.city}, {row.contactDetails?.state || row.state}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {row.contactDetails?.phone || row.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {row.contactDetails?.email || row.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<Fastfood sx={{ fontSize: 18 }} />}
                      label={row.basicInfo?.foodCategory || row.foodCategory}
                      color={getCategoryColor(row.foodCategory)}
                      size="medium"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        height: 36,
                        opacity: 0.6,
                        '& .MuiChip-icon': {
                          fontSize: 18
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star sx={{ fontSize: 18, color: '#ffd700' }} />
                      <Typography variant="body1" fontWeight="bold" color="error.main">
                        {row.averageRating?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /5.0
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      className="action-buttons"
                      sx={{
                        opacity: 0.7,
                        transform: 'translateY(4px)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Tooltip title="View Details" arrow>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleView(row._id)}
                          sx={{
                            minWidth: 44,
                            height: 44,
                            borderRadius: 2.5,
                            borderWidth: 2,
                            '&:hover': {
                              transform: 'scale(1.08)',
                              backgroundColor: 'primary.main',
                              color: 'white',
                              borderWidth: 2,
                            }
                          }}
                        >
                          <Visibility sx={{ fontSize: 20 }} />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Reactivate Restaurant" arrow>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleReactivate(row)}
                          sx={{
                            minWidth: 44,
                            height: 44,
                            borderRadius: 2.5,
                            borderWidth: 2,
                            '&:hover': {
                              transform: 'scale(1.08)',
                              backgroundColor: 'success.main',
                              color: 'white',
                              borderWidth: 2,
                            }
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 20 }} />
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {restaurants.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Block sx={{ fontSize: 80, color: 'text.disabled', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
              No suspended restaurants
            </Typography>
            <Typography variant="body1" color="text.disabled">
              All restaurants are currently in good standing
            </Typography>
          </Box>
        )}
      </Card>

      {/* Reactivate Confirmation Dialog */}
      <Dialog
        open={reactivateDialog.open}
        onClose={() => !reactivating && setReactivateDialog({ open: false, restaurant: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircle color="success" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Reactivate Restaurant
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontSize: '1rem' }}>
            Are you sure you want to reactivate{' '}
            <strong>{reactivateDialog.restaurant?.basicInfo?.restaurantName}</strong>?
          </DialogContentText>
          <DialogContentText color="text.secondary">
            This will change the restaurant status from "suspended" to "approved" and allow them to receive orders again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setReactivateDialog({ open: false, restaurant: null })}
            disabled={reactivating}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmReactivate}
            variant="contained"
            color="success"
            disabled={reactivating}
            sx={{ minWidth: 120 }}
          >
            {reactivating ? 'Reactivating...' : 'Reactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}