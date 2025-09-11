import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  Stack,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  Restaurant,
  Business,
  ContactPhone,
  Description,
  CheckCircle
} from '@mui/icons-material';

const steps = ['Basic Info', 'Contact Details', 'Business Details', 'Review'];

export default function AddRestaurant() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    restaurantName: '',
    ownerName: '',
    foodCategory: '',
    cuisineType: '',
    
    // Contact Details
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Business Details
    licenseNumber: '',
    gstNumber: '',
    bankAccount: '',
    ifscCode: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.restaurantName) newErrors.restaurantName = 'Restaurant name is required';
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.foodCategory) newErrors.foodCategory = 'Food category is required';
        if (!formData.cuisineType) newErrors.cuisineType = 'Cuisine type is required';
        break;
      case 1: // Contact Details
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        break;
      case 2: // Business Details
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.gstNumber) newErrors.gstNumber = 'GST number is required';
        if (!formData.bankAccount) newErrors.bankAccount = 'Bank account is required';
        if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Restaurant Registration Data:', formData);
    // Handle form submission here
    alert('Restaurant registered successfully!');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Restaurant Name"
                value={formData.restaurantName}
                onChange={handleInputChange('restaurantName')}
                error={!!errors.restaurantName}
                helperText={errors.restaurantName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Owner Name"
                value={formData.ownerName}
                onChange={handleInputChange('ownerName')}
                error={!!errors.ownerName}
                helperText={errors.ownerName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.foodCategory}>
                <InputLabel>Food Category</InputLabel>
                <Select
                  value={formData.foodCategory}
                  onChange={handleInputChange('foodCategory')}
                  label="Food Category"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 200,
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          minHeight: 48
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="Veg">Vegetarian</MenuItem>
                  <MenuItem value="Non-Veg">Non-Vegetarian</MenuItem>
                  <MenuItem value="Mixed">Mixed</MenuItem>
                  <MenuItem value="Vegan">Vegan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cuisine Type"
                value={formData.cuisineType}
                onChange={handleInputChange('cuisineType')}
                error={!!errors.cuisineType}
                helperText={errors.cuisineType}
                placeholder="e.g., Indian, Chinese, Italian"
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange('address')}
                error={!!errors.address}
                helperText={errors.address}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                error={!!errors.city}
                helperText={errors.city}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleInputChange('state')}
                error={!!errors.state}
                helperText={errors.state}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pincode"
                value={formData.pincode}
                onChange={handleInputChange('pincode')}
                error={!!errors.pincode}
                helperText={errors.pincode}
                required
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                value={formData.licenseNumber}
                onChange={handleInputChange('licenseNumber')}
                error={!!errors.licenseNumber}
                helperText={errors.licenseNumber}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GST Number"
                value={formData.gstNumber}
                onChange={handleInputChange('gstNumber')}
                error={!!errors.gstNumber}
                helperText={errors.gstNumber}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Account Number"
                value={formData.bankAccount}
                onChange={handleInputChange('bankAccount')}
                error={!!errors.bankAccount}
                helperText={errors.bankAccount}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={formData.ifscCode}
                onChange={handleInputChange('ifscCode')}
                error={!!errors.ifscCode}
                helperText={errors.ifscCode}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restaurant Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Brief description about your restaurant..."
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review all information before submitting the registration.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Basic Information
                  </Typography>
                  <Stack spacing={1}>
                    <Box><strong>Restaurant:</strong> {formData.restaurantName}</Box>
                    <Box><strong>Owner:</strong> {formData.ownerName}</Box>
                    <Box><strong>Category:</strong> <Chip label={formData.foodCategory} size="small" /></Box>
                    <Box><strong>Cuisine:</strong> {formData.cuisineType}</Box>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <ContactPhone sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contact Details
                  </Typography>
                  <Stack spacing={1}>
                    <Box><strong>Email:</strong> {formData.email}</Box>
                    <Box><strong>Phone:</strong> {formData.phone}</Box>
                    <Box><strong>Address:</strong> {formData.address}</Box>
                    <Box><strong>Location:</strong> {formData.city}, {formData.state} - {formData.pincode}</Box>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Business Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box><strong>License Number:</strong> {formData.licenseNumber}</Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box><strong>GST Number:</strong> {formData.gstNumber}</Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box><strong>Bank Account:</strong> {formData.bankAccount}</Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box><strong>IFSC Code:</strong> {formData.ifscCode}</Box>
                    </Grid>
                    {formData.description && (
                      <Grid item xs={12}>
                        <Box><strong>Description:</strong> {formData.description}</Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
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
              Restaurant Registration
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Register a new restaurant partner
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-completed': {
                          color: 'success.main',
                        },
                        '&.Mui-active': {
                          color: 'primary.main',
                        }
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Box>

      {/* Form Content */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {steps[activeStep]}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {activeStep === 0 && "Enter basic restaurant information"}
            {activeStep === 1 && "Provide contact and location details"}
            {activeStep === 2 && "Add business and legal information"}
            {activeStep === 3 && "Review and confirm all details"}
          </Typography>

          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Back
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<CheckCircle />}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    }
                  }}
                >
                  Register Restaurant
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ borderRadius: 2 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}