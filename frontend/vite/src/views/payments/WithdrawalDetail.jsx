import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Grid, Typography, Card, CardContent, Button, Box, Divider, 
  List, ListItem, ListItemText, ListItemIcon, Avatar
} from "@mui/material";
import { 
  ArrowBack, Phone, Email, LocationOn, Restaurant, 
  AccountBalance, AttachMoney, CalendarToday, Person,
  Schedule, CheckCircle, Cancel, TrendingUp, CreditCard
} from "@mui/icons-material";
import MainCard from "ui-component/cards/MainCard";

const withdrawalData = {
  1: {
    id: 1,
    restaurantName: "Food Fiesta",
    location: "Ahmedabad, Gujarat",
    address: "123 Food Street, Satellite, Ahmedabad - 380015",
    phone: "+91 9876543210",
    email: "foodfiesta@email.com",
    amount: 15000,
    requestDate: "2024-01-20",
    requestTime: "14:30 PM",
    bankDetails: {
      accountNumber: "1234567890123456",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      branchName: "Satellite Branch, Ahmedabad",
      accountHolderName: "Food Fiesta Pvt Ltd"
    },
    ownerName: "Rajesh Patel",
    ownerPhone: "+91 9876543210",
    totalEarnings: 45000,
    availableBalance: 15000,
    status: "pending",
    description: "Monthly earnings withdrawal request for Food Fiesta restaurant operations."
  }
};

export default function WithdrawalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const withdrawal = withdrawalData[id] || withdrawalData[1];

  const handleAction = (action) => {
    console.log(`${action} withdrawal request ${id}`);
    navigate(-1);
  };

  return (
    <MainCard 
      title={
        <Box display="flex" alignItems="center" gap={2}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
          <Typography variant="h3">{withdrawal.restaurantName}</Typography>
        </Box>
      }
    >
      <Grid container spacing={3}>
        {/* Main Information */}
        <Grid item xs={12} md={8}>
          {/* Restaurant Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>Restaurant Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><Restaurant /></ListItemIcon>
                      <ListItemText primary="Restaurant Name" secondary={withdrawal.restaurantName} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocationOn /></ListItemIcon>
                      <ListItemText primary="Address" secondary={withdrawal.address} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Phone /></ListItemIcon>
                      <ListItemText primary="Phone" secondary={withdrawal.phone} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText primary="Email" secondary={withdrawal.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText primary="Owner" secondary={withdrawal.ownerName} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Bank Account Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>Bank Account Details</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><AccountBalance /></ListItemIcon>
                      <ListItemText primary="Account Holder Name" secondary={withdrawal.bankDetails.accountHolderName} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CreditCard /></ListItemIcon>
                      <ListItemText primary="Account Number" secondary={withdrawal.bankDetails.accountNumber} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AccountBalance /></ListItemIcon>
                      <ListItemText primary="Bank Name" secondary={withdrawal.bankDetails.bankName} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><LocationOn /></ListItemIcon>
                      <ListItemText primary="Branch" secondary={withdrawal.bankDetails.branchName} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CreditCard /></ListItemIcon>
                      <ListItemText primary="IFSC Code" secondary={withdrawal.bankDetails.ifscCode} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>Request Details</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><CalendarToday /></ListItemIcon>
                      <ListItemText primary="Request Date" secondary={withdrawal.requestDate} />
                    </ListItem>
                      <ListItem>
                      <ListItemIcon><Restaurant /></ListItemIcon>
                      <ListItemText primary="Description" secondary={withdrawal.description} />
                    </ListItem>
                    
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                  <ListItem>
                      <ListItemIcon><Schedule /></ListItemIcon>
                      <ListItemText primary="Request Time" secondary={withdrawal.requestTime} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Financial Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>Financial Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemIcon><TrendingUp /></ListItemIcon>
                  <ListItemText primary="Total Earnings" secondary={`₹${withdrawal.totalEarnings.toLocaleString()}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AccountBalance /></ListItemIcon>
                  <ListItemText primary="Available Balance" secondary={`₹${withdrawal.availableBalance.toLocaleString()}`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Withdrawal Amount */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>Withdrawal Amount</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box 
                sx={{
                  backgroundColor: '#e3f2fd',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  ₹{withdrawal.amount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requested Amount
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons - Full Width */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Actions</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" gap={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleAction('approve')}
                  size="large"
                  sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
                >
                  Approve Withdrawal
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => handleAction('reject')}
                  size="large"
                  sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
                >
                  Reject Request
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainCard>
  );
}