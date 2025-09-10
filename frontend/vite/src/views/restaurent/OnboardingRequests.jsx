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
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Visibility,
  Restaurant,
  Phone,
  Email,
  LocationOn,
  Fastfood,
  Schedule,
  TrendingUp,
  Star,
  AccessTime
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const requests = [
  { 
    id: 1, 
    name: "Food Fiesta", 
    location: "Ahmedabad", 
    foodCategory: "Veg", 
    phone: "+91 9876543210", 
    email: "foodfiesta@email.com", 
    status: "pending", 
    submittedDays: 2,
    rating: 4.5 
  },
  { 
    id: 2, 
    name: "Spice Hub", 
    location: "Surat", 
    foodCategory: "Mixed", 
    phone: "+91 9876543211", 
    email: "spicehub@email.com", 
    status: "pending", 
    submittedDays: 1,
    rating: 4.2 
  },
  { 
    id: 3, 
    name: "Tasty Bites", 
    location: "Mumbai", 
    foodCategory: "Non-Veg", 
    phone: "+91 9876543212", 
    email: "tastybites@email.com", 
    status: "pending", 
    submittedDays: 5,
    rating: 4.8 
  },
];

export default function OnboardingRequests() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState(requests);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, restaurantId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleAction = (id, action) => {
    if (action === 'reject') {
      setRejectDialog({ open: true, restaurantId: id });
    } else {
      setRestaurants(prev => prev.filter(r => r.id !== id));
      console.log(`${action} restaurant with id: ${id}`);
    }
  };

  const handleRejectConfirm = () => {
    const finalReason = rejectionReason === 'Other' ? customReason : rejectionReason;
    setRestaurants(prev => prev.filter(r => r.id !== rejectDialog.restaurantId));
    console.log(`Rejected restaurant ${rejectDialog.restaurantId} with reason: ${finalReason}`);
    setRejectDialog({ open: false, restaurantId: null });
    setRejectionReason('');
    setCustomReason('');
  };

  const handleRejectCancel = () => {
    setRejectDialog({ open: false, restaurantId: null });
    setRejectionReason('');
    setCustomReason('');
  };

  const handleView = (id) => {
    navigate(`/restaurant-detail/${id}`);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Veg': return 'success';
      case 'Non-Veg': return 'error';
      case 'Mixed': return 'warning';
      default: return 'default';
    }
  };

  const getInitials = (name) => {
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
      <Fade in timeout={800}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Restaurant sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
                Restaurant Onboarding
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Review and manage restaurant partnership requests
              </Typography>
            </Box>
          </Box>

          {/* Enhanced Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Requests"
                value={restaurants.length}
                subtitle="Awaiting review"
                icon={Schedule}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="This Month"
                value="24"
                subtitle="New applications"
                icon={TrendingUp}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Avg. Rating"
                value="4.6"
                subtitle="Restaurant quality"
                icon={Star}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Response Time"
                value="2.3d"
                subtitle="Average processing"
                icon={AccessTime}
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Enhanced Main Table */}
      <Zoom in timeout={1000}>
        <Card 
          sx={{ 
            borderRadius: 4, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)', 
            overflow: 'hidden',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <Box 
            sx={{ 
              p: 4, 
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
              Pending Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review restaurant details and take action on partnership requests
            </Typography>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Restaurant</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Location & Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {restaurants.map((row, index) => (
                  <Fade in timeout={1200 + index * 200} key={row.id}>
                    <TableRow
                      onMouseEnter={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          transform: 'translateX(8px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '& .action-buttons': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          }
                        },
                        borderLeft: hoveredRow === row.id ? `6px solid ${theme.palette.primary.main}` : '6px solid transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                          <Badge
                            badgeContent={row.submittedDays}
                            color="primary"
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
                                bgcolor: `${getCategoryColor(row.foodCategory)}.main`,
                                width: 52,
                                height: 52,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                              }}
                            >
                              {getInitials(row.name)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                              {row.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Submitted {row.submittedDays} days ago
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={1.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight="500">
                              {row.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {row.phone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {row.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={<Fastfood sx={{ fontSize: 18 }} />}
                          label={row.foodCategory}
                          color={getCategoryColor(row.foodCategory)}
                          size="medium"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            height: 36,
                            '& .MuiChip-icon': {
                              fontSize: 18
                            }
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ fontSize: 18, color: '#ffd700' }} />
                          <Typography variant="body1" fontWeight="bold">
                            {row.rating}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            /5.0
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip 
                          label="Under Review" 
                          color="warning" 
                          variant="outlined"
                          size="medium"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            borderWidth: 2
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
                          <Tooltip title="Approve Application" arrow>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleAction(row.id, "approve")}
                              sx={{ 
                                minWidth: 44,
                                height: 44,
                                borderRadius: 2.5,
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                '&:hover': {
                                  transform: 'scale(1.08)',
                                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                                }
                              }}
                            >
                              <CheckCircle sx={{ fontSize: 20 }} />
                            </Button>
                          </Tooltip>
                          
                          <Tooltip title="Reject Application" arrow>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleAction(row.id, "reject")}
                              sx={{ 
                                minWidth: 44,
                                height: 44,
                                borderRadius: 2.5,
                                borderWidth: 2,
                                '&:hover': {
                                  transform: 'scale(1.08)',
                                  backgroundColor: 'error.main',
                                  color: 'white',
                                  borderWidth: 2,
                                }
                              }}
                            >
                              <Cancel sx={{ fontSize: 20 }} />
                            </Button>
                          </Tooltip>
                          
                          <Tooltip title="View Details" arrow>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleView(row.id)}
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
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {restaurants.length === 0 && (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 80, color: 'text.disabled', mb: 3, opacity: 0.5 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                No pending requests
              </Typography>
              <Typography variant="body1" color="text.disabled">
                All restaurant applications have been processed
              </Typography>
            </Box>
          )}
        </Card>
      </Zoom>

      {/* Quick Actions Footer */}
      {restaurants.length > 0 && (
        <Fade in timeout={1500}>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.06)'
            }}>
              <CardContent sx={{ py: 2, px: 4 }}>
                <Stack direction="row" spacing={4} alignItems="center">
                  <Button 
                    variant="contained" 
                    size="small" 
                    color="success"
                    sx={{ borderRadius: 2 }}
                  >
                    Approve All
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Bulk Actions
                  </Button>
                  <Button 
                    variant="text" 
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Export Data
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialog.open} onClose={handleRejectCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Application</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide a reason for rejecting this restaurant application:
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Rejection Reason</InputLabel>
            <Select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              label="Rejection Reason"
            >
              <MenuItem value="Incomplete documents">Incomplete documents</MenuItem>
              <MenuItem value="License issues">License issues</MenuItem>
              <MenuItem value="Poor hygiene standards">Poor hygiene standards</MenuItem>
              <MenuItem value="Location not suitable">Location not suitable</MenuItem>
              <MenuItem value="Failed verification">Failed verification</MenuItem>
              <MenuItem value="Other">Other (specify below)</MenuItem>
            </Select>
          </FormControl>

          {rejectionReason === 'Other' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom Reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please specify the reason for rejection..."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectCancel}>Cancel</Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            variant="contained"
            disabled={!rejectionReason || (rejectionReason === 'Other' && !customReason.trim())}
          >
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}