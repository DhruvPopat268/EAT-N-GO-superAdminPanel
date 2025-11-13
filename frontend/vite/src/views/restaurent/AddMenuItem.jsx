import React, { useState, useEffect } from 'react';
import { Upload, Plus, Eye, Download, Building, Menu, Camera, Edit, Trash2 } from 'lucide-react';
import { IconBuildingStore } from '@tabler/icons-react';
import { Snackbar, Alert } from '@mui/material';
import { useToast } from '../../utils/toast.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

const attributeUnits = [
  'ml', 'grams', 'pieces', 'kg', 'liters', 'small', 'medium', 'large', 'regular', 'family pack'
];

const currencyOptions = [
  { id: 'INR', name: 'INR', symbol: '₹' },
  { id: 'USD', name: 'USD', symbol: '$' },
  { id: 'EUR', name: 'EUR', symbol: '€' },
  { id: 'GBP', name: 'GBP', symbol: '£' }
];

const foodTypeOptions = ['Regular', 'Jain', 'Swaminarayan'];
const unitOptions = ['GM', 'ML', 'unit'];


export default function AddMenuItem() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.state?.editMode || false;
  const itemData = location.state?.itemData || null;
  const editRestaurantId = location.state?.restaurantId || null;
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [addMethod, setAddMethod] = useState('');
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showCustomizations, setShowCustomizations] = useState(false);
  const [currentCustomization, setCurrentCustomization] = useState({ name: '', options: [] });
  const [currentOption, setCurrentOption] = useState({ label: '', quantity: 0, unit: 'unit', price: 0 });
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    images: [],
    attributes: [],
    price: '',
    currency: currencyOptions[0],
    category: null,
    subcategory: null,
    foodTypes: [],
    isAvailable: true,
    customizations: []
  });
  const [currentAttribute, setCurrentAttribute] = useState({
    value: '',
    unit: null
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Handle edit mode initialization
  useEffect(() => {
    if (editMode && itemData && restaurants.length > 0) {
      initializeEditMode();
    }
  }, [editMode, itemData, restaurants]);

  // Set category when restaurant details are loaded in edit mode
  useEffect(() => {
    if (editMode && itemData && restaurantDetails?.foodCategory) {
      const categoryOption = restaurantDetails.foodCategory
        .map(cat => ({ id: cat.toLowerCase(), name: cat }))
        .find(cat => cat.name.toLowerCase() === itemData.category?.toLowerCase());
      
      if (categoryOption) {
        setFormData(prev => ({ ...prev, category: categoryOption }));
      }
    }
  }, [editMode, itemData, restaurantDetails]);

  // Set subcategory when subcategories are loaded in edit mode
  useEffect(() => {
    if (editMode && itemData && subcategories.length > 0) {
      const subcategoryOption = subcategories.find(sub => 
        sub.id === itemData.subcategory?._id || sub.name === itemData.subcategory?.name
      );
      
      if (subcategoryOption) {
        setFormData(prev => ({ ...prev, subcategory: subcategoryOption }));
      }
    }
  }, [editMode, itemData, subcategories]);

  // Set attributes when attributes are loaded in edit mode
  useEffect(() => {
    if (editMode && itemData && attributes.length > 0) {
      const mappedAttributes = itemData.attributes?.map((attr, index) => {
        const attributeOption = attributes.find(a => a.name === attr.name);
        return {
          id: Date.now() + index,
          value: attr.price?.toString() || '',
          unit: attributeOption ? { id: attributeOption._id, name: attributeOption.name } : null
        };
      }).filter(attr => attr.unit) || [];
      
      if (mappedAttributes.length > 0) {
        setFormData(prev => ({ ...prev, attributes: mappedAttributes }));
      }
    }
  }, [editMode, itemData, attributes]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchRestaurantDetails();
      fetchAttributes();
      fetchSubcategories();
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`, { credentials: 'include' });
      const result = await response.json();
      if (result.success) {
        setRestaurants(result.data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/usefullDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ restaurantId: selectedRestaurant.restaurantId })
      });
      const result = await response.json();
      if (result.success) {
        setRestaurantDetails(result.data);
        // Set default currency based on country
        const defaultCurrency = result.data.country === 'India' ? currencyOptions[0] : currencyOptions[1];
        setFormData(prev => ({ ...prev, currency: defaultCurrency }));
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      toast.error('Failed to load restaurant details');
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/attributes/admin/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ restaurantId: selectedRestaurant.restaurantId })
      });
      const result = await response.json();
      if (result.success) {
        // Filter only available attributes
        const availableAttributes = result.data.filter(attr => attr.isAvailable);
        setAttributes(availableAttributes);
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast.error('Failed to load attributes');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subcategories/admin/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ restaurantId: selectedRestaurant.restaurantId })
      });
      const result = await response.json();
      if (result.success) {
        // Filter only available subcategories
        const availableSubcategories = result.data.filter(sub => sub.isAvailable);
        setSubcategories(availableSubcategories);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    }
  };

  const initializeEditMode = () => {
    // Find and set the restaurant
    const restaurant = restaurants.find(r => r.restaurantId === editRestaurantId);
    if (restaurant) {
      setSelectedRestaurant(restaurant);
      setAddMethod('individual');
      
      // Handle customizations
      const mappedCustomizations = itemData.customizations?.map((custom, index) => ({
        id: Date.now() + index,
        name: custom.name,
        options: custom.options?.map((opt, optIndex) => ({
          id: Date.now() + index + optIndex + 1000,
          label: opt.label,
          quantity: opt.quantity || 0,
          unit: opt.unit || 'unit',
          price: opt.price || 0
        })) || []
      })) || [];
      
      // Enable customizations if there are any
      if (mappedCustomizations.length > 0) {
        setShowCustomizations(true);
      }
      
      // Set basic form data with item data
      setFormData({
        itemName: itemData.name || '',
        description: itemData.description || '',
        images: itemData.images || [], // Include existing images
        attributes: [], // Will be set when attributes are loaded
        price: itemData.attributes?.[0]?.price?.toString() || '',
        currency: currencyOptions[0], // Will be updated when restaurant details are loaded
        category: null, // Will be set when restaurant details are loaded
        subcategory: null, // Will be set when subcategories are loaded
        foodTypes: itemData.foodTypes || [],
        isAvailable: itemData.isAvailable !== undefined ? itemData.isAvailable : true,
        customizations: mappedCustomizations
      });
    }
  };

  // API functions for item operations
  const getItems = async (restaurantId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ restaurantId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch items');
      return { success: false, message: error.message };
    }
  };

  const getItemDetail = async (itemId, restaurantId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, restaurantId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching item detail:', error);
      toast.error('Failed to fetch item details');
      return { success: false, message: error.message };
    }
  };

  const updateItem = async (itemId, restaurantId, itemData, imageFile = null) => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({ itemId, restaurantId, ...itemData }));
      if (imageFile) {
        formData.append('images', imageFile);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/update`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
      return { success: false, message: error.message };
    }
  };

  const updateItemStatus = async (itemId, restaurantId, isAvailable) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, restaurantId, isAvailable })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
      return { success: false, message: error.message };
    }
  };

  const deleteItem = async (itemId, restaurantId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, restaurantId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      return { success: false, message: error.message };
    }
  };

  const addItem = async (restaurantId, itemData, imageFiles = []) => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({ restaurantId, ...itemData }));
      
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/admin/add`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
      return { success: false, message: error.message };
    }
  };

  const handleSubmit = async () => {
    if (!selectedRestaurant) {
      toast.error('Please select a restaurant');
      return;
    }

    if (!formData.itemName.trim()) {
      toast.error('Please enter item name');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter valid price');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      const itemData = {
        itemName: formData.itemName,
        description: formData.description,
        attributes: formData.attributes,
        price: parseFloat(formData.price),
        currency: formData.currency.id,
        category: formData.category.id,
        subcategory: formData.subcategory?.id,
        foodTypes: formData.foodTypes,
        isAvailable: formData.isAvailable,
        customizations: formData.customizations
      };

      const result = await addItem(selectedRestaurant.restaurantId, itemData, formData.images);
      
      if (result.success) {
        toast.success('Menu item added successfully!');
        // Reset form
        setFormData({
          itemName: '',
          description: '',
          images: [],
          attributes: [],
          price: '',
          currency: currencyOptions[0],
          category: null,
          subcategory: null,
          foodTypes: [],
          isAvailable: true,
          customizations: []
        });
        setCurrentAttribute({ value: '', unit: null });
        setUploadFile(null);
      } else {
        toast.error(result.message || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to delete item');
      return { success: false, message: error.message };
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFoodTypeChange = (foodType) => {
    setFormData(prev => ({
      ...prev,
      foodTypes: prev.foodTypes.includes(foodType)
        ? prev.foodTypes.filter(type => type !== foodType)
        : [...prev.foodTypes, foodType]
    }));
  };

  const addCustomizationOption = () => {
    if (currentOption.label) {
      if (editingOptionId) {
        // Update existing option
        setCurrentCustomization(prev => ({
          ...prev,
          options: prev.options.map(opt => 
            opt.id === editingOptionId ? { ...currentOption, id: editingOptionId } : opt
          )
        }));
        setEditingOptionId(null);
      } else {
        // Add new option
        setCurrentCustomization(prev => ({
          ...prev,
          options: [...prev.options, { ...currentOption, id: Date.now() }]
        }));
      }
      setCurrentOption({ label: '', quantity: 0, unit: 'unit', price: 0 });
    }
  };

  const editCustomizationOption = (option) => {
    setCurrentOption({
      label: option.label,
      quantity: option.quantity,
      unit: option.unit,
      price: option.price
    });
    setEditingOptionId(option.id);
  };

  const cancelEditOption = () => {
    setCurrentOption({ label: '', quantity: 0, unit: 'unit', price: 0 });
    setEditingOptionId(null);
  };

  const editFinalCustomizationOption = (customizationId, option, optionIndex) => {
    // Remove the option from final customizations and put it back in current customization for editing
    const customization = formData.customizations.find(c => c.id === customizationId);
    
    // Set current customization to the one being edited
    setCurrentCustomization({
      name: customization.name,
      options: customization.options.filter((_, idx) => idx !== optionIndex)
    });
    
    // Set the option to be edited
    setCurrentOption({
      label: option.label,
      quantity: option.quantity,
      unit: option.unit,
      price: option.price
    });
    
    // Remove the customization from final list temporarily
    setFormData(prev => ({
      ...prev,
      customizations: prev.customizations.filter(c => c.id !== customizationId)
    }));
    
    setEditingOptionId('editing-final');
  };

  const removeCustomizationOption = (optionId) => {
    setCurrentCustomization(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId)
    }));
  };

  const addCustomization = () => {
    if (currentCustomization.name && currentCustomization.options.length > 0) {
      setFormData(prev => ({
        ...prev,
        customizations: [...prev.customizations, { ...currentCustomization, id: Date.now() }]
      }));
      setCurrentCustomization({ name: '', options: [] });
    }
  };

  const removeCustomization = (customizationId) => {
    setFormData(prev => ({
      ...prev,
      customizations: prev.customizations.filter(custom => custom.id !== customizationId)
    }));
  };

  const handleSubmitIndividual = async () => {
    if (!selectedRestaurant) {
      toast.warning('Please select a restaurant first');
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      const itemDataToSend = {
        name: formData.itemName,
        description: formData.description,
        category: formData.category?.name,
        subcategory: formData.subcategory?.id,
        attributes: formData.attributes.map(attr => ({
          name: attr.unit.name,
          price: parseFloat(attr.value)
        })),
        foodTypes: formData.foodTypes,
        customizations: formData.customizations.map(custom => ({
          name: custom.name,
          options: custom.options.map(opt => ({
            label: opt.label,
            quantity: opt.quantity,
            unit: opt.unit,
            price: opt.price
          }))
        })),
        currency: formData.currency.name,
        isAvailable: formData.isAvailable,
        restaurantId: selectedRestaurant.restaurantId
      };

      if (editMode && itemData) {
        itemDataToSend.itemId = itemData._id;
      }

      formDataToSend.append('data', JSON.stringify(itemDataToSend));
      
      // Separate existing images (URLs) from new images (files)
      const existingImages = formData.images.filter(image => typeof image === 'string');
      const newImages = formData.images.filter(image => typeof image !== 'string');
      
      // Add existing images as URLs
      if (existingImages.length > 0) {
        itemDataToSend.existingImages = existingImages;
      }
      
      // Add new images as files
      if (newImages.length > 0) {
        newImages.forEach(image => {
          formDataToSend.append('images', image);
        });
      }

      const apiUrl = editMode 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/items/admin/update`
        : `${import.meta.env.VITE_BACKEND_URL}/api/items/admin/create`;
      
      const response = await fetch(apiUrl, {
        method: editMode ? 'PUT' : 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(editMode ? 'Item updated successfully!' : 'Item created successfully!');
        if (editMode) {
          navigate('/restaurant/menu-list');
        } else {
          setFormData({
            itemName: '',
            description: '',
            images: [],
            attributes: [],
            price: '',
            currency: currencyOptions[0],
            category: null,
            subcategory: null,
            foodTypes: [],
            isAvailable: true,
            customizations: []
          });
          setCurrentAttribute({ value: '', unit: null });
          setCurrentCustomization({ name: '', options: [] });
          setCurrentOption({ label: '', quantity: 0, unit: 'unit', price: 0 });
          setShowCustomizations(false);
        }
      } else {
        toast.error(editMode ? 'Error updating item: ' + result.message : 'Error creating item: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Error creating item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const currentImages = formData.images.length;
    const totalImages = currentImages + files.length;
    
    if (totalImages > 5) {
      toast.error(`You can only upload a maximum of 5 images total. Currently have ${currentImages} images.`);
      event.target.value = '';
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setUploadFile(file);
    } else {
      toast.error('Please upload only Excel files (.xlsx)');
    }
  };

  const addAttribute = () => {
    if (currentAttribute.value && currentAttribute.unit) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...currentAttribute, id: Date.now() }]
      }));
      setCurrentAttribute({ value: '', unit: null });
    }
  };

  const removeAttribute = (id) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(attr => attr.id !== id)
    }));
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
              options={restaurantDetails?.foodCategory?.map(cat => ({ id: cat.toLowerCase(), name: cat })) || []}
              onChange={(option) => handleInputChange('category', option)}
              placeholder={restaurantDetails ? "Select category" : "Select a restaurant first"}
              isOpen={showCategoryDropdown}
              setIsOpen={setShowCategoryDropdown}
            />

            {/* Subcategory */}
            <CustomDropdown
              label="Subcategory"
              value={formData.subcategory}
              options={subcategories.map(sub => ({ id: sub._id, name: sub.name }))}
              onChange={(option) => handleInputChange('subcategory', option)}
              placeholder={subcategories.length > 0 ? "Select subcategory" : "No subcategories available"}
              isOpen={showSubcategoryDropdown}
              setIsOpen={setShowSubcategoryDropdown}
            />

            {/* Food Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Types</label>
              <div className="flex flex-wrap gap-3">
                {foodTypeOptions.map(foodType => (
                  <label key={foodType} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.foodTypes.includes(foodType)}
                      onChange={() => handleFoodTypeChange(foodType)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{foodType}</span>
                  </label>
                ))}
              </div>
            </div>



            {/* Customizations Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Enable Customizations</span>
                <div
                  className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                    showCustomizations ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setShowCustomizations(!showCustomizations)}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      showCustomizations ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </div>
            </div>

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

            {/* Customizations Section */}
            {showCustomizations && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Customizations</h4>
                
                {/* Add New Customization */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Customization name (e.g., Breads, Sweets)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                      value={currentCustomization.name}
                      onChange={(e) => setCurrentCustomization(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  {/* Add Options */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Option label"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                      value={currentOption.label}
                      onChange={(e) => setCurrentOption(prev => ({ ...prev, label: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        className="flex-1 px-1 py-2 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                        value={currentOption.quantity}
                        onChange={(e) => setCurrentOption(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      />
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                        value={currentOption.unit}
                        onChange={(e) => setCurrentOption(prev => ({ ...prev, unit: e.target.value }))}
                      >
                        {unitOptions.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mb-3">
                    <input
                      type="number"
                      placeholder="Price adjustment"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                      value={currentOption.price}
                      onChange={(e) => setCurrentOption(prev => ({ ...prev, price: Number(e.target.value) }))}
                    />
                    <button
                      type="button"
                      onClick={addCustomizationOption}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingOptionId ? 'Update Option' : 'Add Option'}
                    </button>
                    {editingOptionId && (
                      <button
                        type="button"
                        onClick={cancelEditOption}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  
                  {/* Display Added Options */}
                  {currentCustomization.options.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {currentCustomization.options.map(option => (
                        <div key={option.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{option.label} - {option.quantity} {option.unit} - {option.price === 0 ? 'Free' : `${option.price} ${formData.currency.symbol}`}</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editCustomizationOption(option)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomizationOption(option.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={addCustomization}
                    disabled={!currentCustomization.name || currentCustomization.options.length === 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      currentCustomization.name && currentCustomization.options.length > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add Customization
                  </button>
                </div>
                
                {/* Display Added Customizations */}
                {formData.customizations.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Added Customizations</label>
                    {formData.customizations.map(customization => (
                      <div key={customization.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{customization.name}</h5>
                          <button
                            type="button"
                            onClick={() => removeCustomization(customization.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {customization.options.map((option, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm text-gray-600">
                              <span>• {option.label} - {option.quantity} {option.unit} - {option.price === 0 ? 'Free' : `${option.price} ${formData.currency.symbol}`}</span>
                              <button
                                type="button"
                                onClick={() => editFinalCustomizationOption(customization.id, option, idx)}
                                className="text-blue-500 hover:text-blue-700 p-1 ml-2"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                <p className="text-gray-600 mb-2">
                  {editMode ? 'Upload new images (optional)' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">Max 5 images</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* All Images Display */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Images ({formData.images.length}/5)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {formData.images.map((image, index) => {
                      const isExisting = typeof image === 'string';
                      return (
                        <div key={index} className="relative w-16 h-16">
                          <img
                            src={isExisting ? image : URL.createObjectURL(image)}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                  
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Attributes Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Attributes</h4>

              {/* Add New Attribute */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <CustomDropdown
                  label="Attribute"
                  value={currentAttribute.unit}
                  options={attributes.filter(attr => !formData.attributes.some(selected => selected.unit.id === attr._id)).map(attr => ({ id: attr._id, name: attr.name }))}
                  onChange={(option) => setCurrentAttribute(prev => ({ ...prev, unit: option }))}
                  placeholder={attributes.length === 0 ? "No attributes available" : attributes.filter(attr => !formData.attributes.some(selected => selected.unit.id === attr._id)).length > 0 ? "Select attribute" : "No attributes available"}
                  isOpen={showUnitDropdown}
                  setIsOpen={setShowUnitDropdown}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attribute Value
                  </label>
                  <input
                    type="text"
                    placeholder="Value"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
                    value={currentAttribute.value}
                    onChange={(e) => setCurrentAttribute(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
              </div>

              {/* Add Attribute Button */}
              <button
                type="button"
                onClick={addAttribute}
                disabled={!currentAttribute.value || !currentAttribute.unit}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors mb-4 cursor-pointer ${currentAttribute.value && currentAttribute.unit
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Add Attribute
              </button>

              {/* Display Added Attributes */}
              {formData.attributes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Added Attributes
                  </label>
                  {formData.attributes.map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">
                        {attr.unit.name}
                      </span>
                      <span>
                        {attr.value} {formData.currency.symbol}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(attr.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                {formData.currency.name} ({formData.currency.symbol})
              </div>
              <p className="text-xs text-gray-500 mt-1">Currency is automatically set based on restaurant location</p>
            </div>

                        {/* Available Status Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Available</span>
                <div
                  className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                    formData.isAvailable ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onClick={() => handleInputChange('isAvailable', !formData.isAvailable)}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      formData.isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
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
            disabled={submitting}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {editMode ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              editMode ? 'Update Item' : 'Add Item'
            )}
          </button>
          <button
            onClick={() => {
              setFormData({
                itemName: '',
                description: '',
                images: [],
                attributes: [],
                price: '',
                currency: currencyOptions[0],
                category: null,
                subcategory: null,
                foodTypes: [],
                isAvailable: true,
                customizations: []
              });
              setCurrentAttribute({ value: '', unit: null });
              setCurrentCustomization({ name: '', options: [] });
              setCurrentOption({ label: '', quantity: 0, unit: 'unit', price: 0 });
              setShowCustomizations(false);
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
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
              {editMode ? <Edit className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editMode ? 'Edit Menu Item' : 'Add Menu Item'}
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {editMode ? 'Update existing menu item details' : 'Add new items to restaurant menu'}
          </p>
          {editMode && (
            <button
              onClick={() => navigate('/restaurant/menu-list')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Menu List
            </button>
          )}
        </div>

        {/* Restaurant Selection */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <select
              value={selectedRestaurant?.restaurantId || ''}
              onChange={(e) => {
                const restaurant = restaurants.find(r => r.restaurantId === e.target.value);
                setSelectedRestaurant(restaurant || null);
                if (restaurant) setAddMethod(''); // Reset method selection when switching restaurant
              }}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white appearance-none"
            >
              <option value="">Select Restaurant</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.restaurantId} value={restaurant.restaurantId}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <IconBuildingStore size={20} />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
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
      
      {/* Toast Notifications */}
      {toast.toasts.map((toastItem) => (
        <Snackbar
          key={toastItem.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 2 }}
        >
          <Alert
            severity={toastItem.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 300,
              fontWeight: 500
            }}
          >
            {toastItem.message}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
}