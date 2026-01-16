import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, MapPin, Clock, Star } from 'lucide-react';
import { useToast } from '../../utils/toast.jsx';

export default function ItemDetail() {
  const { itemId, restaurantId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemDetail();
  }, [itemId, restaurantId]);

  const fetchItemDetail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, restaurantId })
      });
      
      const result = await response.json();
      if (result.success) {
        setItem(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch item details');
      }
    } catch (error) {
      console.error('Error fetching item detail:', error);
      toast.error('Failed to fetch item details');
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = () => {
    navigate('/restaurant/add-menu-item', {
      state: {
        editMode: true,
        itemData: item,
        restaurantId: restaurantId
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Item not found</p>
          <button
            onClick={() => navigate('/restaurant/menu-list')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Menu List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/restaurant/menu-list')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
              <p className="text-gray-600">Item Details</p>
            </div>
          </div>
      
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images & Customizations */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Images</h3>
              {item.images && item.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  </div>
                  {item.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {item.images.slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${item.name} ${index + 2}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No images available</p>
                </div>
              )}
            </div>

            {/* Customizations */}
            {item.customizations && item.customizations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Customizations</h3>
                <div className="space-y-4">
                  {item.customizations.map((custom, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">{custom.name}</h4>
                        <span className="text-xs text-gray-500">
                          Max: {custom.MaxSelection === -1 ? 'Unlimited' : custom.MaxSelection}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {custom.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              {option.label} ({option.quantity} {option.unit})
                            </span>
                            <span className="font-medium">
                              {option.price === 0 ? 'Free' : `${item.currency === 'INR' ? '₹' : '$'}${option.price}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Restaurant</label>
                  <p className="text-gray-900">{item.restaurantName || 'Unknown Restaurant'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{item.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{item.description || 'No description available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900">{item.category}</p>
                </div>
                {item.subcategory && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subcategory</label>
                    <p className="text-gray-900">{item.subcategory.name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    item.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Attributes */}
            {item.attributes && item.attributes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Attributes & Pricing</h3>
                <div className="space-y-3">
                  {item.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{attr.attribute?.name || 'Unknown'}</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {item.currency === 'INR' ? '₹' : '$'}{attr.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food Types */}
            {item.foodTypes && item.foodTypes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Food Types</h3>
                <div className="flex flex-wrap gap-2">
                  {item.foodTypes.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {item.addons && item.addons.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Available Addons</h3>
                <div className="space-y-4">
                  {item.addons.map((addon) => (
                    <div key={addon._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        {addon.image && (
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{addon.name}</h4>
                          {addon.description && (
                            <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                          )}
                          <div className="mt-2 space-y-1">
                            {addon.attributes?.map((attr, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">{attr.attribute?.name}</span>
                                <span className="font-medium text-blue-600">
                                  {addon.currency === 'INR' ? '₹' : '$'}{attr.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}