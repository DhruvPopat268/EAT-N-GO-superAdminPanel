import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  IconCalculator,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconBuilding,
  IconBuildingStore
} from '@tabler/icons-react';
import BlackSpinner from 'ui-component/BlackSpinner';

const mockRestaurants = [
  { id: 1, name: 'Pizza Palace', model: 'commission' },
  { id: 2, name: 'Burger Barn', model: 'subscription' },
  { id: 3, name: 'Sushi Spot', model: 'commission' },
  { id: 4, name: 'Taco Town', model: 'subscription' },
  { id: 5, name: 'Pasta Place', model: 'commission' }
];

const getDefaultCostItems = (restaurantModel) => [
  { id: 1, name: 'GST', type: 'percentage', value: 18 },
  { id: 2, name: 'Other Taxes', type: 'percentage', value: 5 },
  ...(restaurantModel === 'commission' ? [{ id: 3, name: 'Platform Charges', type: 'percentage', value: 10 }] : []),
  { id: 4, name: 'Other Charges', type: 'amount', value: 0 }
];

export default function CostBreakdown() {
  const [loading, setLoading] = useState(true);
  const [breakdownType, setBreakdownType] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [costItems, setCostItems] = useState([]);
  const [nextId, setNextId] = useState(5);
  const [savedBreakdowns, setSavedBreakdowns] = useState([]);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BlackSpinner />;
  }

  const handleBreakdownTypeChange = (type) => {
    setBreakdownType(type);
    setSelectedRestaurant(null);
    setCostItems([]);
  };

  const handleRestaurantChange = (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (restaurant) {
      setCostItems(getDefaultCostItems(restaurant.model));
    }
  };

  const handleAllRestaurantsSetup = () => {
    setCostItems(getDefaultCostItems('commission')); // Default to commission model items
  };

  const handleCostItemChange = (id, field, value) => {
    setCostItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addCostItem = () => {
    const newItem = {
      id: nextId,
      name: '',
      type: 'amount',
      value: 0
    };
    setCostItems([...costItems, newItem]);
    setNextId(nextId + 1);
  };

  const removeCostItem = (id) => {
    setCostItems(items => items.filter(item => item.id !== id));
  };



  const handleSave = () => {
    const newBreakdown = {
      id: Date.now(),
      type: breakdownType,
      restaurant: selectedRestaurant,
      restaurantName: breakdownType === 'individual' ? selectedRestaurant?.name : 'All Restaurants',
      model: breakdownType === 'individual' ? selectedRestaurant?.model : 'Mixed',
      costItems: [...costItems],
      createdAt: new Date().toLocaleDateString()
    };
    
    setSavedBreakdowns(prev => [...prev, newBreakdown]);
    
    // Reset form
    setBreakdownType('');
    setSelectedRestaurant(null);
    setCostItems([]);
  };

  const handleDeleteBreakdown = (breakdownId) => {
    console.log('Deleting breakdown with ID:', breakdownId);
    setSavedBreakdowns(prev => {
      const filtered = prev.filter(breakdown => breakdown.id !== breakdownId);
      console.log('Remaining breakdowns:', filtered.length);
      return filtered;
    });
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
            <IconCalculator size={32} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Cost Breakdown Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Create and manage cost breakdowns for restaurants
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', mb: 3 }}>
        <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Select Breakdown Type
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose whether to create cost breakdown for individual restaurant or all restaurants
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={3}>
            <Button
              variant={breakdownType === 'individual' ? 'contained' : 'outlined'}
              startIcon={<IconBuildingStore size={20} />}
              onClick={() => handleBreakdownTypeChange('individual')}
              sx={{ borderRadius: 0, px: 4, py: 2 }}
            >
              Individual Restaurant
            </Button>
            <Button
              variant={breakdownType === 'all' ? 'contained' : 'outlined'}
              startIcon={<IconBuilding size={20} />}
              onClick={() => {
                handleBreakdownTypeChange('all');
                handleAllRestaurantsSetup();
              }}
              sx={{ borderRadius: 0, px: 4, py: 2 }}
            >
              All Restaurants
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {breakdownType === 'individual' && (
        <Card sx={{ borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', mb: 3 }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Select Restaurant
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Autocomplete
              options={mockRestaurants}
              getOptionLabel={(option) => option.name}
              value={selectedRestaurant}
              onChange={(event, newValue) => handleRestaurantChange(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Choose Restaurant" fullWidth />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.name} -  {option.model}</Typography>
                    {/* <Typography variant="body2" color={option.model === 'commission' ? 'primary.main' : 'secondary.main'}>
                      {option.model}
                    </Typography> */}
                  </Box>
                </Box>
              )}
            />
          </CardContent>
        </Card>
      )}

      {((breakdownType === 'individual' && selectedRestaurant) || breakdownType === 'all') && (
        <Card sx={{ borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Cost Breakdown Items
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {breakdownType === 'individual' 
                    ? `Creating breakdown for ${selectedRestaurant?.name}` 
                    : 'Creating breakdown for all restaurants'
                  }
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<IconPlus size={20} />}
                onClick={addCostItem}
                sx={{ borderRadius: 0 }}
              >
                Add Item
              </Button>
            </Box>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              {costItems.map((item, index) => (
                <Box key={item.id} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      label="Item Name"
                      value={item.name}
                      onChange={(e) => handleCostItemChange(item.id, 'name', e.target.value)}
                      sx={{ flex: 2 }}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={item.type}
                        label="Type"
                        onChange={(e) => handleCostItemChange(item.id, 'type', e.target.value)}
                      >
                        <MenuItem value="amount">Amount</MenuItem>
                        <MenuItem value="percentage">Percentage</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Value"
                      type="number"
                      value={item.value}
                      onChange={(e) => handleCostItemChange(item.id, 'value', e.target.value)}
                      InputProps={{
                        startAdornment: item.type === 'percentage' ? '%' : '₹'
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeCostItem(item.id)}
                      disabled={costItems.length <= 1}
                    >
                      <IconTrash size={20} />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
              
              
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<IconDeviceFloppy size={20} />}
                  onClick={handleSave}
                  sx={{ borderRadius: 0, px: 6, py: 2 }}
                  size="large"
                >
                  Save Cost Breakdown
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {savedBreakdowns.length > 0 && (
        <Card sx={{ borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', mt: 3 }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Saved Cost Breakdowns
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Restaurant</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Cost Items</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedBreakdowns.map((breakdown) => (
                    <TableRow key={breakdown.id}>
                      <TableCell>{breakdown.restaurantName}</TableCell>
                      <TableCell>{breakdown.model}</TableCell>
                      <TableCell >
                     {breakdown.type} 
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {breakdown.costItems.map((item, index) => (
                            <Chip 
                              key={index}
                              label={`${item.name}: ${item.type === 'percentage' ? item.value + '%' : '₹' + item.value}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{breakdown.createdAt}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteBreakdown(breakdown.id)}
                          size="small"
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}