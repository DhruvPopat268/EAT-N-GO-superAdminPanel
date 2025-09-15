import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
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
  IconButton,
  Fade,
  Slide,
  useTheme,
  alpha,
  Container,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Restaurant,
  Business,
  ContactPhone,
  Description,
  CheckCircle,
  CloudUpload,
  Delete,
  AttachFile,
  HourglassEmpty,
  CheckCircleOutline,
  ArrowBack,
  ArrowForward,
  Star,
  LocationOn,
  Email,
  Phone,
  AccountBalance,
  VerifiedUser
} from '@mui/icons-material';

const steps = ['Basic Info', 'Contact Details', 'Business Details', 'Upload Documents', 'Review'];

export default function AddRestaurant() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    foodCategory: 'Veg',
    cuisineType: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    licenseNumber: '',
    gstNumber: '',
    bankAccount: '',
    ifscCode: '',
    description: '',
    documents: {
      businessLicense: null,
      gstCertificate: null,
      panCard: null,
      bankStatement: null,
      foodLicense: null
    }
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

  const handleFileUpload = (documentType) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));
      if (errors[documentType]) {
        setErrors(prev => ({ ...prev, [documentType]: '' }));
      }
    }
  };

  const handleFileRemove = (documentType) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: null
      }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.restaurantName) newErrors.restaurantName = 'Restaurant name is required';
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.foodCategory) newErrors.foodCategory = 'Food category is required';
        if (!formData.cuisineType) newErrors.cuisineType = 'Cuisine type is required';
        break;
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        break;
      case 2:
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.gstNumber) newErrors.gstNumber = 'GST number is required';
        if (!formData.bankAccount) newErrors.bankAccount = 'Bank account is required';
        if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
        break;
      case 3:
        if (!formData.documents.businessLicense) newErrors.businessLicense = 'Business license is required';
        if (!formData.documents.gstCertificate) newErrors.gstCertificate = 'GST certificate is required';
        if (!formData.documents.panCard) newErrors.panCard = 'PAN card is required';
        if (!formData.documents.foodLicense) newErrors.foodLicense = 'Food license is required';
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
    setIsSubmitted(true);
  };

  const progressPercentage = ((activeStep + 1) / steps.length) * 100;

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Card sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                mb: 4,
                borderRadius: 4
              }}>
              </Card>

              <Stack spacing={4}>
                <TextField
                  fullWidth
                  label="Restaurant Name"
                  value={formData.restaurantName}
                  onChange={handleInputChange('restaurantName')}
                  error={!!errors.restaurantName}
                  helperText={errors.restaurantName}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderWidth: 2 }
                    },
                    '& .MuiInputLabel-root': { fontSize: '1.1rem' }
                  }}
                />

                <TextField
                  fullWidth
                  label="Owner Name"
                  value={formData.ownerName}
                  onChange={handleInputChange('ownerName')}
                  error={!!errors.ownerName}
                  helperText={errors.ownerName}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderWidth: 2 }
                    },
                    '& .MuiInputLabel-root': { fontSize: '1.1rem' }
                  }}
                />

                <FormControl fullWidth required error={!!errors.foodCategory}>
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Food Category</InputLabel>
                  <Select
                    value={formData.foodCategory}
                    onChange={handleInputChange('foodCategory')}
                    label="Food Category"
                    sx={{
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                    }}
                  >
                    <MenuItem value="Veg">Vegetarian</MenuItem>
                    <MenuItem value="Non-Veg">Non-Vegetarian</MenuItem>
                    <MenuItem value="Mixed">Mixed</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Cuisine Type"
                  value={formData.cuisineType}
                  onChange={handleInputChange('cuisineType')}
                  error={!!errors.cuisineType}
                  helperText={errors.cuisineType || "e.g., Indian, Chinese, Italian, Mexican"}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderWidth: 2 }
                    },
                    '& .MuiInputLabel-root': { fontSize: '1.1rem' }
                  }}
                />
              </Stack>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Card sx={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                mb: 4,
                borderRadius: 4
              }}>
              </Card>

              <Stack spacing={4}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* <Email sx={{ color: 'primary.main', mt: 2 }} /> */}
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* <Phone sx={{ color: 'primary.main', mt: 2 }} /> */}
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Complete Address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
                  <FormControl fullWidth required error={!!errors.city}>
                    <InputLabel sx={{ fontSize: '1.1rem' }}>City</InputLabel>
                    <Select
                      value={formData.city}
                      onChange={handleInputChange('city')}
                      label="City"
                      sx={{
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                      }}
                    >
                      <MenuItem value="Mumbai">Mumbai</MenuItem>
                      <MenuItem value="Delhi">Delhi</MenuItem>
                      <MenuItem value="Bangalore">Bangalore</MenuItem>
                      <MenuItem value="Chennai">Chennai</MenuItem>
                      <MenuItem value="Kolkata">Kolkata</MenuItem>
                      <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                      <MenuItem value="Pune">Pune</MenuItem>
                      <MenuItem value="Ahmedabad">Ahmedabad</MenuItem>
                      <MenuItem value="Jaipur">Jaipur</MenuItem>
                      <MenuItem value="Surat">Surat</MenuItem>
                    </Select>
                    {errors.city && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.city}</Typography>}
                  </FormControl>

                  <FormControl fullWidth required error={!!errors.state}>
                    <InputLabel sx={{ fontSize: '1.1rem' }}>State</InputLabel>
                    <Select
                      value={formData.state}
                      onChange={handleInputChange('state')}
                      label="State"
                      sx={{
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                      }}
                    >
                      <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                      <MenuItem value="Delhi">Delhi</MenuItem>
                      <MenuItem value="Karnataka">Karnataka</MenuItem>
                      <MenuItem value="Tamil Nadu">Tamil Nadu</MenuItem>
                      <MenuItem value="West Bengal">West Bengal</MenuItem>
                      <MenuItem value="Telangana">Telangana</MenuItem>
                      <MenuItem value="Gujarat">Gujarat</MenuItem>
                      <MenuItem value="Rajasthan">Rajasthan</MenuItem>
                      <MenuItem value="Uttar Pradesh">Uttar Pradesh</MenuItem>
                      <MenuItem value="Madhya Pradesh">Madhya Pradesh</MenuItem>
                    </Select>
                    {errors.state && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.state}</Typography>}
                  </FormControl>

                  <FormControl fullWidth required error={!!errors.country}>
                    <InputLabel sx={{ fontSize: '1.1rem' }}>Country</InputLabel>
                    <Select
                      value={formData.country}
                      onChange={handleInputChange('country')}
                      label="Country"
                      sx={{
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                      }}
                    >
                      <MenuItem value="India">India</MenuItem>
                      <MenuItem value="United States">United States</MenuItem>
                      <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                      <MenuItem value="Canada">Canada</MenuItem>
                      <MenuItem value="Australia">Australia</MenuItem>
                      <MenuItem value="Germany">Germany</MenuItem>
                      <MenuItem value="France">France</MenuItem>
                      <MenuItem value="Japan">Japan</MenuItem>
                      <MenuItem value="Singapore">Singapore</MenuItem>
                      <MenuItem value="UAE">UAE</MenuItem>
                    </Select>
                    {errors.country && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.country}</Typography>}
                  </FormControl>
                </Box>

                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.pincode}
                  onChange={handleInputChange('pincode')}
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />
              </Stack>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Card sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                mb: 4,
                borderRadius: 4
              }}>
              </Card>

              <Stack spacing={4}>
                <TextField
                  fullWidth
                  label="Business License Number"
                  value={formData.licenseNumber}
                  onChange={handleInputChange('licenseNumber')}
                  error={!!errors.licenseNumber}
                  helperText={errors.licenseNumber}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="GST Number"
                  value={formData.gstNumber}
                  onChange={handleInputChange('gstNumber')}
                  error={!!errors.gstNumber}
                  helperText={errors.gstNumber || "Format: 22AAAAA0000A1Z5"}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Bank Account Number"
                  value={formData.bankAccount}
                  onChange={handleInputChange('bankAccount')}
                  error={!!errors.bankAccount}
                  helperText={errors.bankAccount}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChange={handleInputChange('ifscCode')}
                  error={!!errors.ifscCode}
                  helperText={errors.ifscCode || "Format: ABCD0123456"}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Restaurant Description (Optional)"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  helperText={`${formData.description.length}/500 characters`}
                  inputProps={{ maxLength: 500 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />
              </Stack>
            </Box>
          </Fade>
        );

      case 3:
        const documentTypes = [
          { key: 'businessLicense', label: 'Business License', icon: <Business />, required: true },
          { key: 'gstCertificate', label: 'GST Certificate', icon: <VerifiedUser />, required: true },
          { key: 'panCard', label: 'PAN Card', icon: <AttachFile />, required: true },
          { key: 'bankStatement', label: 'Bank Statement', icon: <AccountBalance />, required: false },
          { key: 'foodLicense', label: 'Food License (FSSAI)', icon: <Restaurant />, required: true }
        ];

        return (
          <Fade in timeout={500}>
            <Box>
              <Card sx={{
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
                color: 'white',
                mb: 4,
                borderRadius: 4
              }}>
              </Card>

              <Stack spacing={3}>
                {documentTypes.map((doc) => (
                  <Card
                    key={doc.key}
                    sx={{
                      borderRadius: 4,
                      border: errors[doc.key] ? '2px solid #f44336' : '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'white' }}>
                          {doc.icon}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {doc.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doc.required ? 'Required Document' : 'Optional Document'}
                          </Typography>
                        </Box>
                        {doc.required && <Chip label="Required" color="error" size="small" />}
                      </Box>

                      {!formData.documents[doc.key] ? (
                        <Box>
                          <input
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            id={`upload-${doc.key}`}
                            type="file"
                            onChange={handleFileUpload(doc.key)}
                          />
                          <label htmlFor={`upload-${doc.key}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<CloudUpload />}
                              fullWidth
                              size="large"
                              sx={{
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                borderRadius: 3,
                                py: 2,
                                '&:hover': {
                                  borderStyle: 'dashed',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                                }
                              }}
                            >
                              Click to Upload {doc.label}
                            </Button>
                          </label>
                          {errors[doc.key] && (
                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                              {errors[doc.key]}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
                          <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CheckCircle sx={{ color: 'success.main' }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {formData.documents[doc.key].name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(formData.documents[doc.key].size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                            <IconButton
                              onClick={() => handleFileRemove(doc.key)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Fade>
        );

      case 4:
        return (
          <Fade in timeout={500}>
            <Box>
              <Card sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                mb: 4,
                borderRadius: 4
              }}>
              </Card>

              <Stack spacing={3}>
                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 2
                  }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                      <Restaurant sx={{ color: 'white' }} /> Restaurant Information
                    </Typography>
                  </Box>
                  <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <Box><strong>Name:</strong> {formData.restaurantName}</Box>
                      <Box><strong>Owner:</strong> {formData.ownerName}</Box>
                      <Box><strong>Category:</strong> <Chip label={formData.foodCategory} size="small" /></Box>
                      <Box><strong>Cuisine:</strong> {formData.cuisineType}</Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{
                    background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    p: 2
                  }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                      <LocationOn sx={{ color: 'white' }} /> Contact Information
                    </Typography>
                  </Box>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box><strong>Email:</strong> {formData.email}</Box>
                      <Box><strong>Phone:</strong> {formData.phone}</Box>
                      <Box><strong>Address:</strong> {formData.address}</Box>
                      <Box><strong>Location:</strong> {formData.city}, {formData.state}, {formData.country} - {formData.pincode}</Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 2
                  }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                      <AccountBalance /> Business Details
                    </Typography>
                  </Box>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box><strong>License:</strong> {formData.licenseNumber}</Box>
                      <Box><strong>GST:</strong> {formData.gstNumber}</Box>
                      <Box><strong>Bank Account:</strong> {formData.bankAccount}</Box>
                      <Box><strong>IFSC:</strong> {formData.ifscCode}</Box>
                      {formData.description && <Box><strong>Description:</strong> {formData.description}</Box>}
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{
                    background: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)',
                    color: 'white',
                    p: 2
                  }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                      <AttachFile /> Documents
                    </Typography>
                  </Box>
                  <CardContent>
                    <Stack spacing={1}>
                      {Object.entries(formData.documents).map(([key, file]) => {
                        const labels = {
                          businessLicense: 'Business License',
                          gstCertificate: 'GST Certificate',
                          panCard: 'PAN Card',
                          bankStatement: 'Bank Statement',
                          foodLicense: 'Food License'
                        };
                        return file ? (
                          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                            <Typography>{labels[key]}: {file.name}</Typography>
                          </Box>
                        ) : null;
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };
  if (isSubmitted) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Slide direction="up" in mountOnEnter>
          <Card
            sx={{
              borderRadius: 6,
              textAlign: "center",
              background: "white", // White background
              color: "black", // Black text
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)", // Subtle shadow
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 3,
                  bgcolor: "white", // Black circle
                  color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // White icon
                }}
              >
                <HourglassEmpty sx={{ fontSize: 50 }} />
              </Avatar>

              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Application Submitted!
              </Typography>

              <Typography variant="h6" sx={{ opacity: 0.8, mb: 4 }}>
                Your restaurant registration is under review
              </Typography>

              <Card
                sx={{
                  bgcolor: "#f9f9f9", // Light gray to stand out from white bg
                  mb: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ color: "black" }}>
                    Application ID: REST-{Date.now().toString().slice(-6)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "gray", mt: 1 }}>
                    Review time: 2-3 business days
                  </Typography>
                </CardContent>
              </Card>

              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                <Chip
                  icon={<CheckCircleOutline />}
                  label="Submitted"
                  sx={{
                    bgcolor: "rgba(0,0,0,0.05)",
                    color: "black",
                    border: "1px solid black",
                  }}
                />
                <Chip
                  icon={<HourglassEmpty />}
                  label="Under Review"
                  sx={{
                    bgcolor: "rgba(0,0,0,0.05)",
                    color: "black",
                    border: "1px solid black",
                  }}
                />
              </Stack>

              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  "&:hover": { bgcolor: "#333" },
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                }}
              >
                Submit Another Application
              </Button>
            </CardContent>
          </Card>
        </Slide>
      </Container>

    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <Restaurant sx={{ fontSize: 40 }} />
          </Avatar>

          <Typography variant="h2" fontWeight="bold" color="text.primary" gutterBottom>
            Restaurant Registration
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join our platform and start serving customers today
          </Typography>

          {/* Progress Section */}
          <Card sx={{
            borderRadius: 4,
            mb: 4,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Step {activeStep + 1} of {steps.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progressPercentage)}% Complete
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 3,
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }
                }}
              />

              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          '&.Mui-completed': {
                            color: 'success.main',
                            '& .MuiStepIcon-text': { fill: 'white' }
                          },
                          '&.Mui-active': {
                            color: 'primary.main',
                            '& .MuiStepIcon-text': { fill: 'white' }
                          }
                        }
                      }}
                    >
                      <Typography variant="caption" fontWeight={index === activeStep ? 'bold' : 'normal'}>
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Box>

        {/* Form Content */}
        <Card sx={{
          borderRadius: 4,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              {renderStepContent(activeStep)}
            </Box>

            <Divider sx={{ my: 6 }} />

            {/* Navigation Buttons */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: 600,
              mx: 'auto'
            }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  minWidth: 140,
                  '&:disabled': {
                    opacity: 0.3
                  }
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  size="large"
                  startIcon={<CheckCircle />}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    minWidth: 180,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Submit Application
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    minWidth: 140,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team at support@restaurant.com
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}