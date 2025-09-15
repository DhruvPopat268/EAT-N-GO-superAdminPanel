import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock customer data
const mockCustomers = {
  1: { name: 'John Doe', phone: '+91 9876543210', email: 'john.doe@email.com', location: '123 Main St, Mumbai, Maharashtra' },
  2: { name: 'Jane Smith', phone: '+91 9876543211', email: 'jane.smith@email.com', location: '789 Park Avenue, Delhi, Delhi' },
  3: { name: 'Bob Wilson', phone: '+91 9876543212', email: 'bob.wilson@email.com', location: '321 Oak Street, Bangalore, Karnataka' },
  4: { name: 'Alice Brown', phone: '+91 9876543213', email: 'alice.brown@email.com', location: '654 Pine Road, Chennai, Tamil Nadu' },
  5: { name: 'Charlie Davis', phone: '+91 9876543214', email: 'charlie.davis@email.com', location: '987 Elm Street, Pune, Maharashtra' },
  6: { name: 'Eva Green', phone: '+91 9876543215', email: 'eva.green@email.com', location: '147 Maple Drive, Hyderabad, Telangana' },
  7: { name: 'Frank Miller', phone: '+91 9876543216', email: 'frank.miller@email.com', location: '258 Cedar Lane, Kolkata, West Bengal' },
  8: { name: 'Grace Lee', phone: '+91 9876543217', email: 'grace.lee@email.com', location: '369 Birch Street, Ahmedabad, Gujarat' }
};

// Mock customer orders data
const mockCustomerOrders = {
  4: [
    { id: 4, orderNumber: '#ORD004', status: 'Delivered', amount: 280 },
    { id: 13, orderNumber: '#ORD013', status: 'Pending', amount: 350 },
    { id: 14, orderNumber: '#ORD014', status: 'Preparing', amount: 420 },
    { id: 21, orderNumber: '#ORD021', status: 'Delivered', amount: 180 },
    { id: 22, orderNumber: '#ORD022', status: 'Cancelled', amount: 220 }
  ]
};

const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    const styles = {
      'Delivered': 'bg-green-50 text-green-700 border border-green-200',
      'Preparing': 'bg-amber-50 text-amber-700 border border-amber-200',
      'Pending': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Cancelled': 'bg-red-50 text-red-700 border border-red-200',
    };
    return styles[status] || styles.Pending;
  };
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusStyle(status)}`}>
      {status}
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

export default function CustomerDetail() {
  const [currentCustomerId] = useState('4');
  const navigate = useNavigate();
  const customerData = mockCustomers[currentCustomerId];
  const customerOrders = mockCustomerOrders[currentCustomerId] || [];
  
  const totalOrders = customerOrders.length;
  const totalAmount = customerOrders.reduce((sum, order) => sum + order.amount, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;
  const completedOrders = customerOrders.filter(order => order.status === 'Delivered').length;

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order/detail/${orderId}`);
  };

  const handlePrintOrder = (orderId) => {
    // Print order functionality
  };

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
                <h1 className="text-xl font-semibold text-gray-900">Customer Details</h1>
                <p className="text-gray-500 text-sm">View customer information and order history</p>
              </div>
            </div>
            <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Customer Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="bg-slate-600 p-4 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-xl font-semibold">{customerData?.name || 'Unknown Customer'}</h2>
                <p className="text-white/80 text-sm">Premium Customer</p>
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
                    <p className="text-gray-600 text-sm truncate">{customerData?.phone || 'N/A'}</p>
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
                    <p className="text-gray-600 text-sm truncate">{customerData?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">Location</h3>
                    <p className="text-gray-600 text-sm truncate">{customerData?.location || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            subtitle="All time"
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
          <StatsCard
            title="Total Amount"
            value={`₹${totalAmount}`}
            subtitle="Lifetime value"
            bgColor="bg-green-50"
            textColor="text-green-700"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatsCard
            title="Avg Order Value"
            value={`₹${avgOrderValue}`}
            subtitle="Per order"
            bgColor="bg-purple-50"
            textColor="text-purple-700"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatsCard
            title="Completed"
            value={completedOrders}
            subtitle="Successful orders"
            bgColor="bg-orange-50"
            textColor="text-orange-700"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Order History</h3>
                  <p className="text-gray-500 text-sm">Track all customer orders</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {totalOrders} total orders
              </div>
            </div>
          </div>

          {customerOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">This customer hasn't placed any orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerOrders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-6 h-6 bg-slate-600 rounded-md flex items-center justify-center">
                          <span className="text-white font-medium text-xs">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">₹{order.amount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="group relative">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="w-9 h-9 text-blue-600 rounded border-0 flex items-center justify-center transition-all duration-200 hover:bg-blue-600 hover:text-white hover:scale-110 cursor-pointer"
                              title="View Order Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                              View Order Details
                            </div>
                          </div>
                          <div className="group relative">
                            <button
                              onClick={() => handlePrintOrder(order.id)}
                              className="w-9 h-9 text-purple-600 rounded border-0 flex items-center justify-center transition-all duration-200 hover:bg-purple-600 hover:text-white hover:scale-110 cursor-pointer"
                              title="Print Invoice"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                              Print Invoice
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
