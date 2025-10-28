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
  useTheme
} from "@mui/material";
import BlackSpinner from 'ui-component/BlackSpinner';
import {
  Visibility,
  Restaurant,
  Phone,
  Email,
  LocationOn,
  Fastfood,
  Cancel,
  TrendingDown,
  Warning,
  CalendarToday
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function RejectedRestaurants() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRejectedRestaurants();
  }, []);

  const fetchRejectedRestaurants = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/rejected`,{ credentials: 'include' });
      const result = await response.json();
      if (result.success) {
        setRestaurants(result.data);
      }
    } catch (error) {
      console.error('Error fetching rejected restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BlackSpinner />;
  }

  const handleView = (id) => {
    navigate(`/restaurant/detail/${id}`);
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
            <Cancel sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Rejected Applications
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Review declined restaurant partnership applications
            </Typography>
          </Box>
        </Box>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rejected Apps"
              value={restaurants.length}
              subtitle="Declined applications"
              icon={Cancel}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="This Month"
              value="6"
              subtitle="Recent rejections"
              icon={TrendingDown}
              gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Top Reason"
              value="Docs"
              subtitle="Incomplete documents"
              icon={Warning}
              gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Days"
              value="10"
              subtitle="Since rejection"
              icon={CalendarToday}
              gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
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
            background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%)'
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Declined Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review reasons for rejection and manage declined applications
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Restaurant</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Location & Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Rejected Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Reason</TableCell>
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
                      backgroundColor: alpha(theme.palette.error.main, 0.04),
                      transform: 'translateX(8px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '& .action-buttons': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      }
                    },
                    borderLeft: hoveredRow === row._id ? `6px solid ${theme.palette.error.main}` : '6px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  <TableCell sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Badge
                        badgeContent={getDaysAgo(row.updatedAt)}

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
                            opacity: 0.7
                          }}
                        >
                          {getInitials(row.basicInfo?.restaurantName || row.restaurantName)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {row.basicInfo?.restaurantName || row.restaurantName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rejected {getDaysAgo(row.updatedAt)} days ago
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
                        opacity: 0.7,
                        '& .MuiChip-icon': {
                          fontSize: 18
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.rejectionReason || 'No reason provided'}
                      color="error"
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        borderWidth: 1
                      }}
                    />
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {restaurants.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Cancel sx={{ fontSize: 80, color: 'text.disabled', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
              No rejected applications
            </Typography>
            <Typography variant="body1" color="text.disabled">
              All applications have been processed successfully
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}