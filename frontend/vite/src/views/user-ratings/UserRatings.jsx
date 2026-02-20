import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  alpha,
  useTheme,
  Fade,
  InputAdornment,
  Autocomplete,
  TablePagination,
  Rating,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import { IconBuildingStore, IconSearch, IconStar, IconEye, IconFilterOff } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { formatDateTime } from '../../utils/dateFormatter.js';

const UserRatings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ restaurantId: 'all', name: 'All Restaurants' });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      if (data.success) {
        setRestaurants([{ restaurantId: 'all', name: 'All Restaurants' }, ...data.data]);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/user-ratings?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (selectedRestaurant?.restaurantId && selectedRestaurant.restaurantId !== 'all') {
        url += `&restaurantId=${selectedRestaurant.restaurantId}`;
      }
      
      if (debouncedSearchTerm.trim()) {
        url += `&phone=${encodeURIComponent(debouncedSearchTerm.trim())}&fullName=${encodeURIComponent(debouncedSearchTerm.trim())}&restaurantName=${encodeURIComponent(debouncedSearchTerm.trim())}`;
      }
      
      if (selectedRating) {
        url += `&rating=${selectedRating}`;
      }
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      
      if (endDate) {
        url += `&endDate=${endDate}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setRatings(data.data.ratings);
        setTotalCount(data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchRatings();
  }, [page, rowsPerPage, selectedRestaurant, debouncedSearchTerm, selectedRating, startDate, endDate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (orderId, restaurantId) => {
    navigate(`/orders/detail/${orderId}?restaurantId=${restaurantId}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRestaurant({ restaurantId: 'all', name: 'All Restaurants' });
    setSelectedRating('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || selectedRestaurant?.restaurantId !== 'all' || selectedRating || startDate || endDate;

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconStar size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              User Ratings
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            View and manage user ratings for orders
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
              <TextField
                placeholder="Search by customer name, phone, or restaurant..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Autocomplete
                  sx={{ minWidth: 220 }}
                  options={restaurants}
                  getOptionLabel={(option) => option.name}
                  value={selectedRestaurant}
                  onChange={(event, newValue) => {
                    setSelectedRestaurant(newValue || { restaurantId: 'all', name: 'All Restaurants' });
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Restaurant"
                      placeholder="Search restaurants..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconBuildingStore size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Autocomplete
                  sx={{ minWidth: 150 }}
                  options={ratingOptions}
                  getOptionLabel={(option) => option.label}
                  value={ratingOptions.find(option => option.value === selectedRating) || ratingOptions[0]}
                  onChange={(event, newValue) => {
                    setSelectedRating(newValue?.value || '');
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rating"
                      placeholder="Select rating..."
                    />
                  )}
                />
                
                <TextField
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                  onClick={(e) => e.target.showPicker?.()}
                  sx={{ minWidth: 140, cursor: 'pointer' }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { cursor: 'pointer' } }}
                />
                
                <TextField
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                  onClick={(e) => e.target.showPicker?.()}
                  sx={{ minWidth: 140, cursor: 'pointer' }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { cursor: 'pointer' } }}
                />

                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<IconFilterOff size={18} />}
                    onClick={handleClearFilters}
                    sx={{ minWidth: 120 }}
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Stack>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3, textAlign: 'center' }}>#</TableCell>
                  {selectedRestaurant?.restaurantId === 'all' && <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Restaurant</TableCell>}
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>User Info</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order No</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Feedback</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 8 : 7} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading ratings..." />
                    </TableCell>
                  </TableRow>
                ) : ratings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 8 : 7} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        No ratings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  ratings.map((rating, index) => (
                    <Fade in timeout={1200 + index * 100} key={rating._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {page * rowsPerPage + index + 1}
                          </Typography>
                        </TableCell>
                        {selectedRestaurant?.restaurantId === 'all' && (
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="black">
                              {rating.restaurantId?.basicInfo?.restaurantName || 'N/A'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="black">
                              {rating.userId?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="black">
                              {rating.userId?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {rating.orderId?.orderNo || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Rating value={rating.rating} readOnly size="small" />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', maxWidth: 300 }}>
                          <Typography variant="body2" color="black" sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {rating.feedback || 'No feedback'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDateTime(rating.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="View Order">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewOrder(rating.orderId?._id, rating.restaurantId?._id || rating.restaurantId)}
                              sx={{ 
                                color: 'info.main',
                                borderRadius: 1,
                                '&:hover': {
                                  backgroundColor: 'info.main',
                                  color: 'white',
                                  transform: 'scale(1.08)'
                                }
                              }}
                            >
                              <IconEye />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Fade>
    </Box>
  );
};

export default UserRatings;
