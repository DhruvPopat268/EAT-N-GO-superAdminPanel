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
  useTheme
} from "@mui/material";
import BlackSpinner from 'ui-component/BlackSpinner';
import {
  Visibility,
  AccountBalance,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  CheckCircle,
  TrendingUp,
  Payment,
  AccessTime
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const approvedWithdrawals = [
  { 
    id: 8, 
    restaurantName: "Approved Delights", 
    location: "Chennai", 
    phone: "+91 9876543217", 
    email: "approveddelights@email.com", 
    amount: 12000,
    requestDate: "2024-01-15",
    approvedDate: "2024-01-16",
    bankAccount: "****3456",
    status: "approved",
    daysAgo: 7
  },
  { 
    id: 9, 
    restaurantName: "Success Kitchen", 
    location: "Bangalore", 
    phone: "+91 9876543218", 
    email: "successkitchen@email.com", 
    amount: 18500,
    requestDate: "2024-01-12",
    approvedDate: "2024-01-13",
    bankAccount: "****7890",
    status: "approved",
    daysAgo: 10
  },
];

export default function ApprovedWithdrawals() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [requests] = useState(approvedWithdrawals);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BlackSpinner />;
  }

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
                bgcolor: 'success.main', 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)'
              }}
            >
              <CheckCircle sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
                Approved Withdrawals
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Successfully processed withdrawal requests
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Approved Requests"
                value={requests.length}
                subtitle="Successfully processed"
                icon={CheckCircle}
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Amount"
                value="₹30.5K"
                subtitle="Approved withdrawals"
                icon={AttachMoney}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="This Month"
                value="25"
                subtitle="Processed requests"
                icon={TrendingUp}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Avg. Time"
                value="1.1d"
                subtitle="Processing time"
                icon={AccessTime}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
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
              background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.05) 0%, rgba(56, 249, 215, 0.05) 100%)'
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
              Approved Withdrawal Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Successfully processed restaurant withdrawal requests
            </Typography>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.success.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Restaurant</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Bank Account</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Approved Date</TableCell>
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
                          backgroundColor: alpha(theme.palette.success.main, 0.04),
                          transform: 'translateX(8px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '& .action-buttons': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          }
                        },
                        borderLeft: hoveredRow === row.id ? `6px solid ${theme.palette.success.main}` : '6px solid transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                          <Badge
                            badgeContent={row.daysAgo}
                            color="success"
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
                                bgcolor: 'success.main',
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
                              Approved {row.daysAgo} days ago
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
                          {row.approvedDate}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
    </Box>
  );
}