import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data for order details
const mockOrderDetails = {
  4: {
    orderNumber: '#ORD004',
    customerName: 'Alice Brown',
    customerPhone: '+91 9876543213',
    customerEmail: 'alice.brown@email.com',
    customerLocation: '654 Pine Road, Chennai, Tamil Nadu',
    restaurant: 'Sushi World',
    restaurantLocation: '123 Sushi Plaza, Chennai, Tamil Nadu',
    status: 'Delivered',
    date: '2024-01-20',
    time: '12:15',
    items: [
      {
        id: 8,
        name: 'Salmon Roll',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop',
        quantity: 1,
        price: 180
      },
      {
        id: 9,
        name: 'Miso Soup',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=100&h=100&fit=crop',
        quantity: 1,
        price: 100
      }
    ]
  }
};

const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    const styles = {
      'Delivered': 'bg-green-50 text-green-700 border-green-200',
      'Preparing': 'bg-amber-50 text-amber-700 border-amber-200',
      'Pending': 'bg-blue-50 text-blue-700 border-blue-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || styles.Pending;
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

const InfoCard = ({ icon, title, children, bgColor = "bg-gray-50" }) => (
  <div className={`${bgColor} rounded-lg p-4 h-full border border-gray-200`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

export default function OrderDetail() {
  const [currentOrderId] = useState('4');
  const navigate = useNavigate();

  const orderData = mockOrderDetails[currentOrderId];
  const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    // window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
                <p className="text-gray-500 text-sm">View comprehensive order information</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          {/* Order Header */}
          <div className="bg-slate-600 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{orderData.orderNumber}</h2>
                <p className="text-white/80 text-sm">{orderData.date} at {orderData.time}</p>
              </div>
              <StatusBadge status={orderData.status} />
            </div>
          </div>

          {/* Customer and Restaurant Info */}
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <InfoCard
                icon={
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                title="Customer Information"
                bgColor="bg-blue-50"
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{orderData.customerName}</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">{orderData.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm truncate">{orderData.customerEmail}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{orderData.customerLocation}</span>
                  </div>
                </div>
              </InfoCard>

              {/* Restaurant Info */}
              <InfoCard
                icon={
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                title="Restaurant Information"
                bgColor="bg-green-50"
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{orderData.restaurant}</h4>
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{orderData.restaurantLocation}</span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5m6 5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {orderData.items.map((item, index) => (
              <div key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-slate-600 rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-xs">{index + 1}</span>
                  </div>

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500">Premium quality item</p>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Qty: {item.quantity}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900">₹{item.price * item.quantity}</div>
                    {item.quantity > 1 && (
                      <div className="text-xs text-gray-500">₹{item.price} each</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Total Amount</span>
              <span className="text-xl font-bold text-slate-700">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
