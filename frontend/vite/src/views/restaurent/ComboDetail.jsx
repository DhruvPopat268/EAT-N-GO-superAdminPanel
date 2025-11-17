import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, Package } from 'lucide-react';
import { useToast } from '../../utils/toast.jsx';

export default function ComboDetail() {
  const { comboId, restaurantId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComboDetail();
  }, [comboId, restaurantId]);

  const fetchComboDetail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/combos/admin/detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comboId, restaurantId })
      });
      
      const result = await response.json();
      if (result.success) {
        setCombo(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch combo details');
      }
    } catch (error) {
      console.error('Error fetching combo detail:', error);
      toast.error('Failed to fetch combo details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/restaurant/combo-management', {
      state: {
        editCombo: combo,
        restaurantId: restaurantId
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading combo details...</p>
        </div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Combo not found</p>
          <button
            onClick={() => navigate('/restaurant/combo-management')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Combo Management
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
              onClick={() => navigate('/restaurant/combo-management')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{combo.name}</h1>
              <p className="text-gray-600">Combo Details</p>
            </div>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images & Items */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Images</h3>
              {combo.image ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No image available</p>
                </div>
              )}
            </div>

            {/* Items */}
            {combo.items && combo.items.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Combo Items ({combo.items.length})</h3>
                <div className="space-y-4">
                  {combo.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {item.itemId?.images?.[0] && (
                          <img
                            src={item.itemId.images[0]}
                            alt={item.itemId.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.itemId?.name || 'Unknown Item'}</h4>
                          {item.itemId?.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.itemId.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-medium text-blue-600">Qty: {item.quantity}</span>
                            {item.attribute && (
                              <span className="text-sm text-gray-600">Size: {item.attribute.name}</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.itemId?.category?.toLowerCase() === 'veg' 
                                ? 'bg-green-100 text-green-800'
                                : item.itemId?.category?.toLowerCase() === 'non-veg'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {item.itemId?.category || 'Unknown'}
                            </span>
                          </div>
                        </div>
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
                  <p className="text-gray-900">{combo.restaurantName || 'Unknown Restaurant'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{combo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{combo.description || 'No description available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {combo.currency === 'INR' ? '₹' : '$'}{combo.price}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    combo.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {combo.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Addons */}
            {combo.addons && combo.addons.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Available Addons ({combo.addons.length})</h3>
                <div className="space-y-3">
                  {combo.addons.map((addon, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {addon.image && (
                        <img
                          src={addon.image}
                          alt={addon.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{addon.name || 'Unknown Addon'}</h4>
                        {addon.attributes && addon.attributes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {addon.attributes.map((attr, attrIndex) => (
                              <span key={attrIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {attr.name}: ₹{attr.price}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        addon.category?.toLowerCase() === 'veg' 
                          ? 'bg-green-100 text-green-800'
                          : addon.category?.toLowerCase() === 'non-veg'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {addon.category || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
           {combo.category && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Category</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  combo.category.toLowerCase() === 'veg' 
                    ? 'bg-green-100 text-green-800'
                    : combo.category.toLowerCase() === 'non-veg'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {combo.category}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}