import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme
} from '@mui/material';
import {
  IconCreditCard,
  IconEdit,
  IconCheck,
  IconClock,
  IconHeadset,
  IconShield,
  IconTrendingUp
} from '@tabler/icons-react';
import BlackSpinner from 'ui-component/BlackSpinner';

const initialPlan = {
  id: 1,
  name: 'Restaurant Subscription Plan',
  price: 999,
  currency: '₹',
  period: 'month',
  description: 'Complete restaurant management solution with all essential features',
  features: [
    '24/7 Customer Support',
    'Order Management System',
    'Payment Processing',
    'Analytics & Reports',
    'Multi-location Support',
    'Staff Management',
    'Inventory Tracking',
    'Customer Database'
  ],
  isActive: true
};

export default function SubscriptionManagement() {
  const theme = useTheme();
  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: []
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BlackSpinner />;
  }

  const handleEditOpen = () => {
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description,
      features: [...plan.features]
    });
    setEditDialog(true);
  };

  const handleEditClose = () => {
    setEditDialog(false);
    setFormData({ name: '', price: '', description: '', features: [] });
  };

  const handleSave = () => {
    setPlan({
      ...plan,
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      features: formData.features
    });
    handleEditClose();
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

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
            <IconCreditCard size={32} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Subscription Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage restaurant subscription plans and pricing
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 0, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
        <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                Current Subscription Plan
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage pricing and features for restaurant partners
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<IconEdit size={20} />}
              onClick={handleEditOpen}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Edit Plan
            </Button>
          </Box>
        </Box>

        <CardContent sx={{ p: 6 }}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {plan.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h2" fontWeight="bold" color="primary.main">
                  {plan.currency}{plan.price}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  /{plan.period}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {plan.description}
              </Typography>
              <Chip 
                label={plan.isActive ? 'Active' : 'Inactive'} 
                color={plan.isActive ? 'success' : 'error'}
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconTrendingUp size={20} />
                Plan Features
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                {plan.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <IconCheck size={20} color={theme.palette.success.main} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip 
                icon={<IconHeadset size={16} />}
                label="24/7 Support"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                icon={<IconShield size={16} />}
                label="Secure Payments"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                icon={<IconClock size={16} />}
                label="Real-time Updates"
                color="info"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={editDialog} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Subscription Plan</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Plan Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Price per Month"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              fullWidth
              InputProps={{ startAdornment: '₹' }}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Plan Features
                </Typography>
                <Button onClick={addFeature} size="small">
                  Add Feature
                </Button>
              </Box>
              {formData.features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Enter feature"
                  />
                  <Button 
                    onClick={() => removeFeature(index)}
                    color="error"
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!formData.name || !formData.price || !formData.description}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}