import React, { useState } from 'react';
import { Box, Card, Typography, Button, Stack, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

export default function FileUploadTest() {
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleDocumentChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    
    formData.append('data', JSON.stringify({
      restaurantName: 'Test Restaurant',
      ownerName: 'Test Owner',
      email: `test${Date.now()}@test.com`,
      phone: '1234567890',
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      country: 'India',
      pincode: '123456',
      latitude: '0',
      longitude: '0',
      foodCategory: 'Veg',
      cuisineTypes: ['Indian'],
      licenseNumber: 'TEST123',
      gstNumber: 'GST123',
      bankAccount: '1234567890',
      ifscCode: 'TEST0001',
      description: 'Test restaurant'
    }));

    images.forEach(img => formData.append('restaurantImages', img));
    documents.forEach(doc => formData.append('businessLicense', doc));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/restaurants`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true }
      );
      setResult({ success: true, data: response.data });
    } catch (error) {
      setResult({ success: false, error: error.response?.data || error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>File Upload Test</Typography>
        
        <Stack spacing={3} sx={{ mt: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Upload Images</Typography>
            <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
              Select Images
              <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
            </Button>
            {images.length > 0 && <Typography variant="body2" sx={{ mt: 1 }}>{images.length} image(s) selected</Typography>}
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>Upload Documents</Typography>
            <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
              Select Document
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentChange} />
            </Button>
            {documents.length > 0 && <Typography variant="body2" sx={{ mt: 1 }}>{documents.length} document(s) selected</Typography>}
          </Box>

          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={uploading || (images.length === 0 && documents.length === 0)}
          >
            {uploading ? 'Uploading...' : 'Test Upload'}
          </Button>

          {result && (
            <Alert severity={result.success ? 'success' : 'error'}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Alert>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
