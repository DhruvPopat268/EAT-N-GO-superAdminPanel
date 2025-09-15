import React, { useState } from 'react';
import { Upload, Plus, Eye, Download, Building, Menu, Camera } from 'lucide-react';
import { IconBuildingStore } from '@tabler/icons-react';

const mockRestaurants = [
  { id: 1, name: 'Pizza Palace' },
  { id: 2, name: 'Burger House' },
  { id: 3, name: 'Sushi World' },
  { id: 4, name: 'Taco Bell' }
];

const attributeUnits = [
  'ml', 'grams', 'pieces', 'kg', 'liters', 'small', 'medium', 'large', 'regular', 'family pack'
];

const currencyOptions = [
  { id: 'INR', name: 'INR', symbol: '₹' },
  { id: 'USD', name: 'USD', symbol: '$' },
  { id: 'EUR', name: 'EUR', symbol: '€' },
  { id: 'GBP', name: 'GBP', symbol: '£' }
];

const categoryOptions = [
  { id: 'veg', name: 'Veg' },
  { id: 'non-veg', name: 'Non-Veg' },
  { id: 'mixed', name: 'Mixed' }
];

const subcategoryOptions = [
  { id: 'burger', name: 'Burger' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'chinese', name: 'Chinese' },
  { id: 'punjabi', name: 'Punjabi' },
  { id: 'south-indian', name: 'South Indian' },
  { id: 'north-indian', name: 'North Indian' },
  { id: 'italian', name: 'Italian' },
  { id: 'mexican', name: 'Mexican' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'biryani', name: 'Biryani' },
  { id: 'rolls', name: 'Rolls' },
  { id: 'sandwiches', name: 'Sandwiches' }
];

export default function AddMenuItem() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [addMethod, setAddMethod] = useState('');
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    image: null,
    attributeValue: '',
    attributeUnit: null,
    price: '',
    currency: currencyOptions[0],
    category: null,
    subcategory: null
  });
  const [uploadFile, setUploadFile] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setUploadFile(file);
    } else {
      alert('Please upload only Excel files (.xlsx)');
    }
  };

  const handleSubmitIndividual = () => {
    console.log('Individual item submitted:', formData);
    setFormData({
      itemName: '',
      description: '',
      image: null,
      attributeValue: '',
      attributeUnit: null,
      price: '',
      currency: currencyOptions[0],
      category: null,
      subcategory: null
    });
  };

  const handleSubmitBulk = () => {
    console.log('Bulk upload submitted:', uploadFile);
    setUploadFile(null);
  };

  const downloadSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/restaurant_menu.xlsx';
    link.download = 'restaurant_menu_sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMethodSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        className={`p-8 rounded-xl text-center cursor-pointer transition-all duration-300 border-2 ${addMethod === 'individual'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
          }`}
        onClick={() => setAddMethod('individual')}
      >
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Add Individual Item</h3>
        <p className="text-gray-600">Add menu items one by one with detailed information</p>
      </div>

      <div
        className={`p-8 rounded-xl text-center cursor-pointer transition-all duration-300 border-2 ${addMethod === 'bulk'
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
          }`}
        onClick={() => setAddMethod('bulk')}
      >
        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Upload Menu (Bulk Import)</h3>
        <p className="text-gray-600">Upload multiple menu items using Excel file</p>
      </div>
    </div>
  );

  const CustomDropdown = ({
    label,
    value,
    options,
    onChange,
    placeholder,
    isOpen,
    setIsOpen,
    displayKey = 'name'
  }) => (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value ? value[displayKey] : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={option.id || index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {typeof option === 'string' ? option : option[displayKey]}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPinterestStyleForm = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Product Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Details</h3>

            {/* Item Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name Product
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
              />
            </div>

            {/* Category */}
            <CustomDropdown
              label="Category"
              value={formData.category}
              options={categoryOptions}
              onChange={(option) => handleInputChange('category', option)}
              placeholder="Select category"
              isOpen={showCategoryDropdown}
              setIsOpen={setShowCategoryDropdown}
            />

            {/* Subcategory */}
            <CustomDropdown
              label="Subcategory"
              value={formData.subcategory}
              options={subcategoryOptions}
              onChange={(option) => handleInputChange('subcategory', option)}
              placeholder="Select subcategory"
              isOpen={showSubcategoryDropdown}
              setIsOpen={setShowSubcategoryDropdown}
            />

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  placeholder="Enter product description..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors min-h-32 resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {formData.description.length}/1000
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Photos & Variants */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Photos</h3>

            {/* Image Upload Area */}
            <div className="mb-8">
              <div className="relative border-2 border-dashed border-orange-300 rounded-xl p-12 text-center bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">Max 10 MB file size or image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Image Preview Thumbnails */}
              {formData.image && (
                <div className="flex gap-3 mt-4">
                  <div className="relative w-16 h-16">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => handleInputChange('image', null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Attribute Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute Value
                </label>
                <input
                  type="text"
                  placeholder="Value"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                  value={formData.attributeValue}
                  onChange={(e) => handleInputChange('attributeValue', e.target.value)}
                />
              </div>
              <CustomDropdown
                label="Unit"
                value={formData.attributeUnit}
                options={attributeUnits.map(unit => ({ id: unit, name: unit }))}
                onChange={(option) => handleInputChange('attributeUnit', option)}
                placeholder="Select unit"
                isOpen={showUnitDropdown}
                setIsOpen={setShowUnitDropdown}
              />
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />

                <div className="relative bottom-1.5">
                  <CustomDropdown
                    label=""
                    value={formData.currency}
                    options={currencyOptions}
                    onChange={(option) => handleInputChange('currency', option)}
                    placeholder="Select currency"
                    isOpen={showCurrencyDropdown}
                    setIsOpen={setShowCurrencyDropdown}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Now at the bottom of the single card */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSubmitIndividual}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Item
          </button>
          <button
            onClick={() => {
              setFormData({
                itemName: '',
                description: '',
                image: null,
                attributeValue: '',
                attributeUnit: null,
                price: '',
                currency: currencyOptions[0],
                category: null,
                subcategory: null
              });
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );

  const renderBulkUpload = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold mb-6 text-center">Bulk Menu Upload</h3>

      <div className="space-y-6">
        <div className="text-center">
          <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 bg-purple-50">
            <Upload className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Upload Excel File</h4>
            <p className="text-gray-600 mb-4">Choose your restaurant menu Excel file</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="bulk-upload"
            />
            <label
              htmlFor="bulk-upload"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:bg-purple-700 transition-colors"
            >
              Choose File
            </label>
          </div>
        </div>

        {uploadFile && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-green-700">
              Selected: <span className="font-medium">{uploadFile.name}</span>
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={downloadSampleFile}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Download className="w-4 h-4" />
            Download Sample File
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmitBulk}
            disabled={!uploadFile}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${uploadFile
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
          >
            Upload Menu
          </button>
          <button
            onClick={() => setAddMethod('')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Add Menu Item</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Add new items to restaurant menu
          </p>
        </div>

        {/* Restaurant Selection */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <select
              value={selectedRestaurant?.id || ''}
              onChange={(e) => {
                const restaurant = mockRestaurants.find(r => r.id === parseInt(e.target.value));
                setSelectedRestaurant(restaurant || null);
                if (restaurant) setAddMethod(''); // Reset method selection when switching restaurant
              }}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white appearance-none"
            >
              <option value="">Select Restaurant</option>
              {mockRestaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <IconBuildingStore size={20} />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedRestaurant && (
          <div>
            {!addMethod && renderMethodSelection()}
            {addMethod === 'individual' && renderPinterestStyleForm()}
            {addMethod === 'bulk' && renderBulkUpload()}
          </div>
        )}
      </div>
    </div>
  );
}