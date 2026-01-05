import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress
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
  VerifiedUser,
  ContentCopy
} from '@mui/icons-material';

const steps = ['Basic Info', 'Contact Details', 'Business Details', 'Upload Documents', 'Review'];

const cuisineTypes = [
  'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American', 'Mediterranean',
  'French', 'Korean', 'Vietnamese', 'Lebanese', 'Greek', 'Spanish', 'Turkish', 'Continental', 'Other'
];

export default function AddRestaurant() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  console.log("submissionData:", submissionData);

  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    foodCategory: 'Veg',
    cuisineTypes: [],
    otherCuisine: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    latitude: '',
    longitude: '',
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
    },
    restaurantImages: []
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (activeStep === 1 && inputRef.current && window.google && window.google.maps) {
      const timer = setTimeout(() => {
        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['establishment', 'geocode']
          });
          
          autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  useEffect(() => {
    if (activeStep === 1 && window.google && window.google.maps && formData.latitude && formData.longitude) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeStep, formData.latitude, formData.longitude]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Create draggable marker
    const marker = new window.google.maps.Marker({
      position: { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) },
      map: map,
      draggable: true,
      title: 'Drag to adjust location'
    });

    markerRef.current = marker;

    // Update coordinates when marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      updateLocationFromCoordinates(position.lat(), position.lng());
    });

    // Allow clicking on map to move marker
    map.addListener('click', (event) => {
      const clickedLocation = event.latLng;
      marker.setPosition(clickedLocation);
      updateLocationFromCoordinates(clickedLocation.lat(), clickedLocation.lng());
    });
  };

  const updateLocationFromCoordinates = async (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      let city = '', state = '', country = '', pincode = '';
      
      response.address_components?.forEach(component => {
        const types = component.types;
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        } else if (types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });

      setFormData(prev => ({
        ...prev,
        address: response.formatted_address,
        city,
        state,
        country,
        pincode,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));

      setLocationQuery(response.formatted_address);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Still update coordinates even if reverse geocoding fails
      setFormData(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));
    }
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (place.geometry) {
      let city = '', state = '', country = '', pincode = '';
      
      place.address_components?.forEach(component => {
        const types = component.types;
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        } else if (types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });
      
      setFormData(prev => ({
        ...prev,
        address: place.formatted_address || place.name,
        city,
        state,
        country,
        pincode,
        latitude: place.geometry.location.lat().toString(),
        longitude: place.geometry.location.lng().toString()
      }));
      
      setLocationQuery(place.formatted_address || place.name);
    }
  };

  const handleCuisineChange = (cuisine) => (event) => {
    const isChecked = event.target.checked;
    setFormData(prev => ({
      ...prev,
      cuisineTypes: isChecked
        ? [...prev.cuisineTypes, cuisine]
        : prev.cuisineTypes.filter(c => c !== cuisine),
      otherCuisine: cuisine === 'Other' && !isChecked ? '' : prev.otherCuisine
    }));
    if (errors.cuisineTypes) {
      setErrors(prev => ({ ...prev, cuisineTypes: '' }));
    }
  };

  const handleFileUpload = (documentType) => (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (documentType === 'restaurantImages') {
        setFormData(prev => ({
          ...prev,
          restaurantImages: Array.from(files)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [documentType]: files[0]
          }
        }));
      }
      if (errors[documentType]) {
        setErrors(prev => ({ ...prev, [documentType]: '' }));
      }
    }
  };

  const handleFileRemove = (documentType, index = null) => {
    if (documentType === 'restaurantImages') {
      if (index !== null) {
        setFormData(prev => ({
          ...prev,
          restaurantImages: prev.restaurantImages.filter((_, i) => i !== index)
        }));
      } else {
        setFormData(prev => ({ ...prev, restaurantImages: [] }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: null
        }
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.restaurantName) newErrors.restaurantName = 'Restaurant name is required';
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.foodCategory) newErrors.foodCategory = 'Food category is required';
        if (formData.cuisineTypes.length === 0) newErrors.cuisineTypes = 'At least one cuisine type is required';
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Add form data as JSON string
      const { documents, restaurantImages, ...otherData } = formData;
      formDataToSend.append('data', JSON.stringify(otherData));

      // Add document files
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(key, file);
        }
      });

      // Add restaurant images
      restaurantImages.forEach((file, index) => {
        formDataToSend.append('restaurantImages', file);
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        console.log("result.data:", result.data);
        setSubmissionData(result.data);
        setIsSubmitted(true);
      } else {
        alert(result.message || 'Error submitting form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
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

                <FormControl component="fieldset" error={!!errors.cuisineTypes}>
                  <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
                    Cuisine Types *
                  </Typography>
                  <FormGroup sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                    border: errors.cuisineTypes ? '2px solid #f44336' : '1px solid #e0e0e0',
                    borderRadius: 3,
                    p: 2
                  }}>
                    {cuisineTypes.map((cuisine) => (
                      <FormControlLabel
                        key={cuisine}
                        control={
                          <Checkbox
                            checked={formData.cuisineTypes.includes(cuisine)}
                            onChange={handleCuisineChange(cuisine)}
                            sx={{
                              '&.Mui-checked': {
                                color: 'primary.main'
                              }
                            }}
                          />
                        }
                        label={cuisine}
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.95rem'
                          }
                        }}
                      />
                    ))}
                  </FormGroup>
                  {formData.cuisineTypes.includes('Other') && (
                    <TextField
                      fullWidth
                      label="Specify Other Cuisine"
                      value={formData.otherCuisine}
                      onChange={handleInputChange('otherCuisine')}
                      placeholder="Enter cuisine type"
                      sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: '1rem'
                        }
                      }}
                    />
                  )}
                  {errors.cuisineTypes && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1.5 }}>
                      {errors.cuisineTypes}
                    </Typography>
                  )}
                  {formData.cuisineTypes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Selected Cuisines:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.cuisineTypes.map((cuisine) => (
                          <Chip
                            key={cuisine}
                            label={cuisine}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </FormControl>
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

                <TextField
                  fullWidth
                  label="Search Location"
                  inputRef={inputRef}
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onFocus={() => {
                    if (window.google && window.google.maps && inputRef.current && !autocompleteRef.current) {
                      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                        types: ['establishment', 'geocode']
                      });
                      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
                    }
                  }}
                  error={!!errors.address}
                  helperText={errors.address || "Start typing to search for your restaurant location"}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    error={!!errors.city}
                    helperText={errors.city}
                    required
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        bgcolor: 'grey.50'
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="State"
                    value={formData.state}
                    onChange={handleInputChange('state')}
                    error={!!errors.state}
                    helperText={errors.state}
                    required
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        bgcolor: 'grey.50'
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.country}
                    onChange={handleInputChange('country')}
                    error={!!errors.country}
                    helperText={errors.country}
                    required
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        bgcolor: 'grey.50'
                      }
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.pincode}
                  onChange={handleInputChange('pincode')}
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                  required
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      bgcolor: 'grey.50'
                    }
                  }}
                />

                {(formData.latitude && formData.longitude) ? (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Restaurant Location
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click on the map or drag the marker to adjust your exact location
                    </Typography>
                    <Box
                      ref={mapRef}
                      sx={{
                        width: '100%',
                        height: 300,
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                      <Typography variant="caption">Lat: {parseFloat(formData.latitude).toFixed(6)}</Typography>
                      <Typography variant="caption">Lng: {parseFloat(formData.longitude).toFixed(6)}</Typography>
                    </Box>
                  </Box>
                ) : null}
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
          { key: 'foodLicense', label: 'Food License (FSSAI)', icon: <Restaurant />, required: true },
          { key: 'restaurantImages', label: 'Restaurant Images', icon: <Restaurant />, required: false, multiple: true }
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

                      {(doc.key === 'restaurantImages' ? formData.restaurantImages.length === 0 : !formData.documents[doc.key]) ? (
                        <Box>
                          <input
                            accept={doc.key === 'restaurantImages' ? '.jpg,.jpeg,.png' : '.pdf,.jpg,.jpeg,.png'}
                            style={{ display: 'none' }}
                            id={`upload-${doc.key}`}
                            type="file"
                            multiple={doc.multiple}
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
                        <Box>
                          {doc.key === 'restaurantImages' ? (
                            <Stack spacing={2}>
                              {formData.restaurantImages.map((file, index) => (
                                <Card key={index} sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
                                  <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircle sx={{ color: 'success.main' }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="body1" fontWeight="medium">
                                        {file.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      onClick={() => handleFileRemove(doc.key, index)}
                                      color="error"
                                      size="small"
                                    >
                                      <Delete />
                                    </IconButton>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
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
                        </Box>
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
                      <Box><strong>Cuisines:</strong> {formData.cuisineTypes.map(c => c === 'Other' ? formData.otherCuisine : c).filter(Boolean).join(', ')}</Box>
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
      <Container maxWidth="sm" sx={{ py: 3 }}>
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
            <CardContent sx={{ p: 4 }}>
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
                  bgcolor: "#f9f9f9",
                  mb: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ color: "black" }}>
                    Application ID: REST-{submissionData?._id?.slice(-8) || Date.now().toString().slice(-6)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "gray", mt: 1 }}>
                    Review time: 2-3 business days
                  </Typography>
                </CardContent>
              </Card>

              {submissionData?.contactDetails?.email && submissionData?.plainTempPassword && (
                <Card
                  sx={{
                    bgcolor: "#e8f5e8",
                    mb: 4,
                    borderRadius: 3,
                    border: "2px solid #4caf50"
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2, fontWeight: "bold" }}>
                      🔐 Restaurant Panel Access Credentials
                    </Typography>
                    <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2, mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body1" sx={{ color: "black" }}>
                          <strong>Email:</strong> {submissionData?.contactDetails?.email || formData.email}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => navigator.clipboard.writeText(submissionData?.contactDetails?.email || formData.email)}
                          sx={{ color: "#4caf50" }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="body1" sx={{ color: "black" }}>
                          <strong>Password:</strong> {submissionData?.plainTempPassword}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => navigator.clipboard.writeText(submissionData?.plainTempPassword)}
                          sx={{ color: "#4caf50" }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      href="https://eat-n-go-restaurent.vercel.app/"
                      target="_blank"
                      sx={{
                        bgcolor: "#4caf50",
                        "&:hover": { bgcolor: "#45a049" },
                        borderRadius: 2
                      }}
                    >
                      Access Restaurant Panel
                    </Button>
                  </CardContent>
                </Card>
              )}

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
      py: 2
    }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            mx: 'auto',

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
                  disabled={isSubmitting}
                  size="large"
                  startIcon={isSubmitting ? null : <CheckCircle />}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    minWidth: 180,
                    background: isSubmitting
                      ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: isSubmitting
                        ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                        : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: isSubmitting ? 'none' : 'translateY(-2px)',
                      boxShadow: isSubmitting ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.4)'
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }}
                      />
                      <Typography variant="button" sx={{ color: 'white' }}>
                        Submitting...
                      </Typography>
                    </Box>
                  ) : (
                    'Submit Application'
                  )}
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