import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Chip,
  TablePagination,
  Autocomplete,
  TextField
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import BlackSpinner from 'ui-component/BlackSpinner';
import axios from 'axios';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ modules: [], subModules: [] });
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubModule, setSelectedSubModule] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFilters();
    fetchLogs();
  }, [selectedModule, selectedSubModule, page, rowsPerPage]);

  const fetchFilters = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/activity-logs/filters`, {
        withCredentials: true
      });
      setFilters(response.data.data || { modules: [], subModules: [] });
    } catch (error) {
      console.error('Error fetching filters:', error);
      setFilters({ modules: [], subModules: [] });
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(selectedModule && { module: selectedModule }),
        ...(selectedSubModule && { subModule: selectedSubModule })
      };

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/activity-logs`, { 
        params,
        withCredentials: true
      });
      setLogs(response.data.data || []);
      setTotalLogs(response.data.pagination?.totalLogs || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
    setSelectedSubModule('');
    setPage(0);
  };

  const handleSubModuleChange = (event) => {
    setSelectedSubModule(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'approve': return 'success';
      case 'reject': return 'error';
      case 'create': return 'primary';
      case 'update': return 'warning';
      case 'delete': return 'error';
      default: return 'default';
    }
  };

  return (
    <MainCard title="Activity Logs">
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Autocomplete
            fullWidth
            sx={{ minWidth: 300 }}
            options={[{ value: '', label: 'All Modules' }, ...filters.modules?.map(module => ({ value: module, label: module })) || []]}
            getOptionLabel={(option) => option.label}
            value={filters.modules?.find(m => m === selectedModule) ? { value: selectedModule, label: selectedModule } : { value: '', label: 'All Modules' }}
            onChange={(event, newValue) => {
              setSelectedModule(newValue?.value || '');
              setSelectedSubModule('');
              setPage(0);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Module"
                placeholder="Select module..."
                sx={{ minWidth: 300 }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Autocomplete
            fullWidth
            sx={{ minWidth: 300 }}
            options={[{ value: '', label: 'All Sub Modules' }, ...filters.subModules?.map(subModule => ({ value: subModule, label: subModule })) || []]}
            getOptionLabel={(option) => option.label}
            value={filters.subModules?.find(sm => sm === selectedSubModule) ? { value: selectedSubModule, label: selectedSubModule } : { value: '', label: 'All Sub Modules' }}
            onChange={(event, newValue) => {
              setSelectedSubModule(newValue?.value || '');
              setPage(0);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sub Module"
                placeholder="Select sub module..."
                sx={{ minWidth: 300 }}
              />
            )}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Restaurant</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Sub Module</TableCell>
              <TableCell>Action</TableCell>
              {/* <TableCell>Description</TableCell> */}
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <BlackSpinner />
                </TableCell>
              </TableRow>
            ) : !logs || logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>No activity logs found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{log.restroName || '-'}</TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.subModule}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={getActionColor(log.action)}
                      size="small"
                    />
                  </TableCell>
                  {/* <TableCell>{log.description}</TableCell> */}
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalLogs}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MainCard>
  );
};

export default ActivityLogs;