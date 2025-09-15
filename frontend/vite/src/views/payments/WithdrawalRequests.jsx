import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  TextField,
  IconButton
} from "@mui/material";
import BlackSpinner from 'ui-component/BlackSpinner';
import {
  CheckCircle,
  Cancel,
  Visibility,
  AccountBalance,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  Schedule,
  TrendingUp,
  Payment,
  AccessTime
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const withdrawalRequests = [
  { 
    id: 1, 
    restaurantName: "Food Fiesta", 
    location: "Ahmedabad", 
    phone: "+91 9876543210", 
    email: "foodfiesta@email.com", 
    amount: 15000,
    requestDate: "2024-01-20",
    bankAccount: "****1234",
    status: "pending",
    daysAgo: 2
  },
  { 
    id: 2, 
    restaurantName: "Spice Hub", 
    location: "Surat", 
    phone: "+91 9876543211", 
    email: "spicehub@email.com", 
    amount: 8500,
    requestDate: "2024-01-19",
    bankAccount: "****5678",
    status: "pending",
    daysAgo: 3
  },
  { 
    id: 3, 
    restaurantName: "Royal Kitchen", 
    location: "Delhi", 
    phone: "+91 9876543214", 
    email: "royalkitchen@email.com", 
    amount: 22000,
    requestDate: "2024-01-18",
    bankAccount: "****9012",
    status: "pending",
    daysAgo: 4
  },
];

export default function WithdrawalRequests() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(withdrawalRequests);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, requestId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BlackSpinner />;
  }

  const handleAction = (id, action) => {
    if (action === 'reject') {
      setRejectDialog({ open: true, requestId: id });
    } else {
      setRequests(prev => prev.filter(r => r.id !== id));
      console.log(`${action} withdrawal request with id: ${id}`);
    }
  };

  const handleRejectConfirm = () => {
    setRequests(prev => prev.filter(r => r.id !== rejectDialog.requestId));
    console.log(`Rejected withdrawal request ${rejectDialog.requestId} with reason: ${rejectionReason}`);
    setRejectDialog({ open: false, requestId: null });
    setRejectionReason('');
  };

  const handleRejectCancel = () => {
    setRejectDialog({ open: false, requestId: null });
    setRejectionReason('');
  };

  const handleView = (id) => {
    navigate(`/payment/withdrawal-detail/${id}`);
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
              <Payment sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
                Withdrawal Requests
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Review and process restaurant withdrawal requests
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Requests"
                value={requests.length}
                subtitle="Awaiting approval"
                icon={Schedule}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Amount"
                value="₹45.5K"
                subtitle="Pending withdrawals"
                icon={AttachMoney}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="This Month"
                value="18"
                subtitle="Processed requests"
                icon={TrendingUp}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Avg. Time"
                value="1.2d"
                subtitle="Processing time"
                icon={AccessTime}
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Grid>
          </Grid>
        </Box>

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
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
              Pending Withdrawal Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and approve restaurant withdrawal requests
            </Typography>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Restaurant</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Bank Account</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((row, index) => (
                    <TableRow key={row.id}
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
                            badgeContent={row.daysAgo}
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
                                bgcolor: 'primary.main',
                                width: 52,
                                height: 52,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                              }}
                            >
                              {getInitials(row.restaurantName)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                              {row.restaurantName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {row.daysAgo} days ago
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       
                          <Typography variant="h6" fontWeight="bold" >
                            ₹{row.amount.toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalance sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500">
                            {row.bankAccount}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {row.requestDate}
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
                          <Tooltip title="Approve Withdrawal" arrow>
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
                          
                          <Tooltip title="Reject Request" arrow>
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
                          
                          <Tooltip title="View Restaurant" arrow>
                            <IconButton
                              onClick={() => handleView(row.id)}
                              sx={{ 
                                color: 'primary.main',
                                borderRadius: 1,
                                '&:hover': {
                                  backgroundColor: 'primary.main',
                                  color: 'white',
                                  transform: 'scale(1.08)'
                                }
                              }}
                            >
                              <Visibility sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

      <Dialog open={rejectDialog.open} onClose={handleRejectCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Withdrawal Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide a reason for rejecting this withdrawal request:
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please specify the reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectCancel}>Cancel</Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}