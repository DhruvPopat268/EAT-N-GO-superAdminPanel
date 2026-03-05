import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Button,
  Tooltip,
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Pagination,
  Fade,
  InputAdornment,
  Autocomplete,
  TablePagination
} from '@mui/material';
import { IconUsers, IconEye, IconPhone, IconMail, IconSearch, IconFilterOff, IconX } from '@tabler/icons-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import BlackSpinner from 'ui-component/BlackSpinner';
import ThemeSpinner from 'ui-component/ThemeSpinner';
import axios from 'axios';

export default function UserManagement() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    filter: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    startDate: '',
    endDate: ''
  });

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'orderCount', label: 'Order Count' },
    { value: 'orderAmount', label: 'Order Amount' }
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(debouncedSearchTerm.trim() && { search: debouncedSearchTerm.trim() }),
        ...(filters.filter && { filter: filters.filter }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, { params });
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalCount(response.data.pagination.totalUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, debouncedSearchTerm, filters]);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}/status`, {
        status: !currentStatus
      });
      
      if (response.data.success) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, status: !currentStatus } : user
        ));
        alert('User status updated successfully');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleView = (userId) => {
    navigate(`/user/detail/${userId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      filter: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      startDate: '',
      endDate: ''
    });
    setPage(0);
  };

  const hasActiveFilters = searchTerm || filters.filter || filters.startDate || filters.endDate;

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase() || 'U';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            User Management
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search by name or phone..."
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
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchTerm('');
                            setPage(0);
                          }}
                        >
                          <IconX size={18} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Autocomplete
                  sx={{ minWidth: 150 }}
                  options={sortOptions}
                  getOptionLabel={(option) => option.label}
                  value={sortOptions.find(option => option.value === filters.filter) || sortOptions[0]}
                  onChange={(event, newValue) => {
                    setFilters(prev => ({ ...prev, filter: newValue?.value || '' }));
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sort By"
                      placeholder="Select sort..."
                    />
                  )}
                />
                
                <TextField
                  type="date"
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, startDate: e.target.value }));
                    setPage(0);
                  }}
                  sx={{ minWidth: 140 }}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  type="date"
                  label="End Date"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, endDate: e.target.value }));
                    setPage(0);
                  }}
                  sx={{ minWidth: 140 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Stack>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>User Info</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Orders</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Order Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Joining Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading users..." />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <Fade in timeout={1200 + index * 100} key={user._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {page * rowsPerPage + index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="black">
                              {user.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="black">
                              {user.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {user.totalOrderCount || 0}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {user.currency?.symbol || '₹'}{user.totalOrderAmount?.toLocaleString() || 0}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {new Date(user.createdAt).toLocaleDateString()}{'\n'}{new Date(user.createdAt).toLocaleTimeString('en-GB', { hour12: false })}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Switch checked={user.status} onChange={() => handleStatusToggle(user._id, user.status)} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="View User Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleView(user._id)}
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
}