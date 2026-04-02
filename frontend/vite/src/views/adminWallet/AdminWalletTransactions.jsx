import { useState, useEffect } from 'react';
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
  Chip,
  alpha,
  useTheme,
  Fade,
  TablePagination,
  Grid,
  Tooltip
} from '@mui/material';
import { IconWallet, IconTrendingUp, IconTrendingDown, IconCurrencyRupee } from '@tabler/icons-react';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { formatDateTime } from '../../utils/dateFormatter.js';

const AdminWalletTransactions = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin-wallet/transactions?page=${page + 1}&limit=${rowsPerPage}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setWalletData(data.wallet);
        setTotalCount(data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTransactionTypeColor = (type) => {
    return type === 'credit' 
      ? { bgcolor: '#4CAF50', textColor: 'white' }
      : { bgcolor: '#F44336', textColor: 'white' };
  };

  const getSourceColor = (source) => {
    const sourceConfig = {
      order_payment: { bgcolor: '#2196F3', textColor: 'white' },
      table_booking_payment: { bgcolor: '#9C27B0', textColor: 'white' },
      commission: { bgcolor: '#4CAF50', textColor: 'white' },
      settlement: { bgcolor: '#FF9800', textColor: 'white' },
      refund: { bgcolor: '#F44336', textColor: 'white' },
      withdrawal: { bgcolor: '#795548', textColor: 'white' },
      adjustment: { bgcolor: '#607D8B', textColor: 'white' },
      penalty: { bgcolor: '#E91E63', textColor: 'white' },
      bonus: { bgcolor: '#00BCD4', textColor: 'white' }
    };
    return sourceConfig[source] || { bgcolor: '#9E9E9E', textColor: 'white' };
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card sx={{ 
      p: 3, 
      borderRadius: 3, 
      border: '1px solid #e0e0e0',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} color={color} />
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight="bold" color="text.primary">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Admin Wallet Transactions
          </Typography>
        </Box>
      </Fade>

      {loading && !walletData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <ThemeSpinner message="Loading wallet data..." />
        </Box>
      ) : (
        <>
          <Fade in timeout={1000}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Current Balance"
                  value={`${walletData?.currency?.symbol || '₹'}${walletData?.balance?.toFixed(2) || '0.00'}`}
                  icon={IconWallet}
                  color={theme.palette.primary.main}
                  subtitle={walletData?.currency?.code || 'INR'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Credits"
                  value={`${walletData?.currency?.symbol || '₹'}${walletData?.totalCredits?.toFixed(2) || '0.00'}`}
                  icon={IconTrendingUp}
                  color="#4CAF50"
                  subtitle="All time credits"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Debits"
                  value={`${walletData?.currency?.symbol || '₹'}${walletData?.totalDebits?.toFixed(2) || '0.00'}`}
                  icon={IconTrendingDown}
                  color="#F44336"
                  subtitle="All time debits"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Currency"
                  value={walletData?.currency?.code || 'INR'}
                  icon={IconCurrencyRupee}
                  color="#FF9800"
                  subtitle={walletData?.currency?.name || 'Indian Rupee'}
                />
              </Grid>
            </Grid>
          </Fade>

          <Fade in timeout={1200}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Transaction History
                </Typography>
              </Box>
              
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                      <TableCell sx={{ fontWeight: 700, py: 3, textAlign: 'center' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Restaurant</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order No</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Table Booking No</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Transaction Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Commission %</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={11} sx={{ textAlign: 'center', py: 8 }}>
                          <ThemeSpinner message="Loading transactions..." />
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} sx={{ textAlign: 'center', py: 8 }}>
                          <Typography variant="h6" color="text.secondary">
                            No transactions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction, index) => (
                        <Fade in timeout={1400 + index * 100} key={transaction._id}>
                          <TableRow sx={{ 
                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) }
                          }}>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" color="text.primary" fontWeight={600}>
                                {page * rowsPerPage + index + 1}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Box>
                                <Typography variant="body2" color="text.primary">
                                  {transaction.restaurantId?.basicInfo?.restaurantName || '-'}
                                </Typography>
                                {transaction.restaurantId?.contactDetails && (
                                  <Typography variant="caption" color="text.secondary">
                                    {[
                                      transaction.restaurantId.contactDetails.city,
                                      transaction.restaurantId.contactDetails.state,
                                      transaction.restaurantId.contactDetails.country
                                    ].filter(Boolean).join(', ') || '-'}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" color="text.primary">
                                {transaction.orderId?.orderNo ? `#${transaction.orderId.orderNo}` : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" color="text.primary">
                                {transaction.tableBookingId?.tableBookingNo ? `#${transaction.tableBookingId.tableBookingNo}` : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Chip 
                                label={transaction.transactionType?.toUpperCase() || 'N/A'}
                                sx={{ 
                                  bgcolor: getTransactionTypeColor(transaction.transactionType).bgcolor,
                                  color: getTransactionTypeColor(transaction.transactionType).textColor,
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Chip 
                                label={transaction.source?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                                sx={{ 
                                  bgcolor: getSourceColor(transaction.source).bgcolor,
                                  color: getSourceColor(transaction.source).textColor,
                                  fontSize: '0.7rem',
                                  fontWeight: 500
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" color="text.primary">
                                {transaction.commissionPercentage ? `${transaction.commissionPercentage}%` : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                color={transaction.transactionType === 'credit' ? 'success.main' : 'error.main'}
                              >
                                {transaction.transactionType === 'credit' ? '+' : '-'}
                                {transaction.currency?.symbol || '₹'}{transaction.amount?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', maxWidth: 200 }}>
                              <Tooltip title={transaction.description || '-'} arrow placement="top">
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {transaction.description || '-'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Chip 
                                label={transaction.status?.toUpperCase() || 'N/A'}
                                sx={{ 
                                  bgcolor: transaction.status === 'completed' ? '#4CAF50' : '#9E9E9E',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: 500
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
                                {formatDateTime(transaction.createdAt)}
                              </Typography>
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
        </>
      )}
    </Box>
  );
};

export default AdminWalletTransactions;
