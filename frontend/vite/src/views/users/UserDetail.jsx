import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    const styles = {
      'completed': 'bg-green-50 text-green-700 border border-green-200',
      'confirmed': 'bg-blue-50 text-blue-700 border border-blue-200',
      'preparing': 'bg-amber-50 text-amber-700 border border-amber-200',
      'ready': 'bg-purple-50 text-purple-700 border border-purple-200',
      'served': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      'cancelled': 'bg-gray-50 text-gray-700 border border-gray-200',
      'refunded': 'bg-red-50 text-red-700 border border-red-200',
    };
    return styles[status] || styles.confirmed;
  };
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusStyle(status)}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  );
};

const StatsCard = ({ icon, title, value, subtitle, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-lg p-4 border border-gray-100`}>
    <div className="flex items-center justify-between">
      <div>
        <div className={`text-2xl font-semibold ${textColor} mb-1`}>{value}</div>
        <div className="text-gray-600 text-sm">{title}</div>
        {subtitle && <div className="text-gray-500 text-xs mt-1">{subtitle}</div>}
      </div>
      <div className={`${textColor} opacity-70`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit, setOrderLimit] = useState(10);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const params = {
        orderPage,
        orderLimit
      };
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`, { params });
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [id, orderPage, orderLimit]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewOrder = (orderId, restaurantId) => {
    navigate(`/orders/detail/${orderId}?restaurantId=${restaurantId}`);
  };

  const handlePrintOrder = (orderId) => {
    // Print order functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <button onClick={handleBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">User Details</h1>
                <p className="text-gray-500 text-sm">View user information and order history</p>
              </div>
            </div>
            <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="bg-slate-600 p-4 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-xl font-semibold">{user?.fullName || 'Unknown User'}</h2>
                <p className="text-white/80 text-sm">User ID: #{user?._id?.slice(-6)}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">Phone</h3>
                    <p className="text-gray-600 text-sm truncate">{user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">Email</h3>
                    <p className="text-gray-600 text-sm truncate">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className={`${user?.status ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} rounded-lg p-3 border`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${user?.status ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {user?.status ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">Status</h3>
                    <p className={`text-sm truncate ${user?.status ? 'text-green-600' : 'text-red-600'}`}>
                      {user?.status ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
            title="Total Orders"
            value={user?.totalOrders || 0}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatsCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
            title="Total Amount"
            value={`${user?.currency?.symbol || '₹'}${user?.totalOrdersAmount?.toLocaleString() || 0}`}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatsCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            title="Avg Order Value"
            value={`${user?.currency?.symbol || '₹'}${Math.round(user?.avgOrderAmount || 0)}`}
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
          <StatsCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            title="Completed Orders"
            value={user?.totalCompletedOrders || 0}
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
            <p className="text-gray-500 text-sm">All orders placed by this user</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {user?.orders?.length > 0 ? (
                  user.orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderNo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user?.currency?.symbol || '₹'}{order.orderAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewOrder(order._id, order.restaurantId)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer"
                            title="View Order"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {user?.orderPagination && user.orderPagination.totalOrders > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Rows per page:
                  </span>
                  <select
                    value={orderLimit}
                    onChange={(e) => {
                      setOrderLimit(parseInt(e.target.value));
                      setOrderPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {((orderPage - 1) * orderLimit) + 1}-{Math.min(orderPage * orderLimit, user.orderPagination.totalOrders)} of {user.orderPagination.totalOrders}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setOrderPage(1)}
                      disabled={orderPage === 1}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⟨⟨
                    </button>
                    <button
                      onClick={() => setOrderPage(orderPage - 1)}
                      disabled={!user.orderPagination.hasPrev}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⟨
                    </button>
                    <button
                      onClick={() => setOrderPage(orderPage + 1)}
                      disabled={!user.orderPagination.hasNext}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⟩
                    </button>
                    <button
                      onClick={() => setOrderPage(user.orderPagination.totalPages)}
                      disabled={orderPage === user.orderPagination.totalPages}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⟩⟩
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}