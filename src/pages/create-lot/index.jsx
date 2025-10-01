import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { useAuth } from 'context/AuthContext';
import { APIError } from 'lib/api/client';
import { createRequest, deleteRequest, getRequest, updateRequest } from 'lib/api/requests';
import { uploadImage as uploadImageFile } from 'lib/api/uploads';

const CreateLot = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, initializing } = useAuth();
  const fileInputRef = useRef(null);
  const [requestId, setRequestId] = useState(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [primaryImageUrl, setPrimaryImageUrl] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    currency: 'USD',
    budgetMin: 100,
    budgetMax: 1000,
    condition: '',
    location: '',
    images: [],
    duration: 7,
    autoAcceptThreshold: 0,
    sellerRequirements: {
      minRating: 0,
      verifiedOnly: false,
      businessSellers: false
    },
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: 'electronics', label: 'Electronics & Gadgets', icon: 'Smartphone' },
    { value: 'furniture', label: 'Furniture & Home', icon: 'Home' },
    { value: 'vehicles', label: 'Vehicles & Parts', icon: 'Car' },
    { value: 'fashion', label: 'Fashion & Accessories', icon: 'Shirt' },
    { value: 'books', label: 'Books & Media', icon: 'Book' },
    { value: 'sports', label: 'Sports & Outdoors', icon: 'Dumbbell' },
    { value: 'tools', label: 'Tools & Equipment', icon: 'Wrench' },
    { value: 'collectibles', label: 'Collectibles & Art', icon: 'Palette' },
    { value: 'services', label: 'Services', icon: 'Users' },
    { value: 'other', label: 'Other', icon: 'Package' }
  ];

  const conditions = [
    { value: 'new', label: 'Brand New', description: 'Never used, in original packaging' },
    { value: 'like-new', label: 'Like New', description: 'Barely used, excellent condition' },
    { value: 'good', label: 'Good', description: 'Used but well maintained' },
    { value: 'fair', label: 'Fair', description: 'Shows wear but functional' },
    { value: 'any', label: 'Any Condition', description: 'Open to all conditions' }
  ];

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Title, description, category' },
    { id: 2, title: 'Budget & Details', description: 'Price range, condition, location' },
    { id: 3, title: 'Images & Media', description: 'Upload photos and videos' },
    { id: 4, title: 'Advanced Options', description: 'Duration, requirements, settings' }
  ];

  useEffect(() => {
    if (!initializing && !user) {
      navigate('/login-register', { replace: true, state: { from: '/create-lot' } });
    }
  }, [initializing, user, navigate]);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (!idParam) {
      setRequestId(null);
      setPrimaryImageUrl(null);
      setFormData((prev) => ({
        ...prev,
        images: [],
      }));
      return;
    }
    const parsed = Number(idParam);
    if (Number.isNaN(parsed)) {
      setLoadError('Invalid lot identifier');
      return;
    }
    setRequestId(parsed);
  }, [searchParams]);

  const loadRequest = useCallback(async (id) => {
    setIsLoadingRequest(true);
    setLoadError(null);
    try {
      const data = await getRequest(id);
      setFormData((prev) => ({
        ...prev,
        title: data?.title ?? '',
        description: data?.description ?? '',
        category: prev.category,
        currency: data?.currencyCode ?? prev.currency,
        budgetMin: data?.budgetAmount ?? prev.budgetMin,
        budgetMax: data?.budgetAmount ?? prev.budgetMax,
        images: data?.imageUrl
          ? [{ id: 'existing', url: data.imageUrl, uploadedUrl: data.imageUrl, name: 'Uploaded image', uploading: false }]
          : [],
      }));
      setPrimaryImageUrl(data?.imageUrl ?? null);
      setLastSaved(null);
      setCurrentStep(1);
      setIsPreviewMode(false);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        setLoadError('Lot not found');
      } else {
        setLoadError(error.message || 'Failed to load lot');
      }
    } finally {
      setIsLoadingRequest(false);
    }
  }, []);

  useEffect(() => {
    if (!requestId || !user) {
      return;
    }
    loadRequest(requestId);
  }, [requestId, user, loadRequest]);

  const formatCurrency = useCallback(
    (value) => {
      const currencyCode = (formData.currency || 'USD').toUpperCase();
      const numericValue = Number(value) || 0;
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
        }).format(numericValue);
      } catch (error) {
        return `$${numericValue.toLocaleString()}`;
      }
    },
    [formData.currency]
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const revokePreviewUrl = useCallback((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const uploadImage = useCallback(async (file, imageId) => {
    setImageUploadError(null);
    try {
      const response = await uploadImageFile(file);
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((image) =>
          image.id === imageId
            ? { ...image, uploading: false, uploadedUrl: response?.url || image.uploadedUrl, error: null }
            : image
        ),
      }));
      setPrimaryImageUrl(response?.url || null);
    } catch (error) {
      const message = error?.message || 'Failed to upload image';
      setImageUploadError(message);
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((image) =>
          image.id === imageId
            ? { ...image, uploading: false, error: message }
            : image
        ),
      }));
    }
  }, []);

  const handleImageUpload = (files) => {
    if (!files || files.length === 0) {
      return;
    }

    const [file] = Array.from(files).filter((candidate) => candidate.type.startsWith('image/'));
    if (!file) {
      setImageUploadError('Please choose an image file.');
      return;
    }

    const imageId = Date.now() + Math.random();
    const previewUrl = URL.createObjectURL(file);

    setImageUploadError(null);
    setFormData((prev) => {
      prev.images.forEach((image) => revokePreviewUrl(image.url));
      return {
        ...prev,
        images: [{
          id: imageId,
          file,
          url: previewUrl,
          name: file.name,
          size: file.size,
          uploading: true,
          error: null,
        }],
      };
    });
    setPrimaryImageUrl(null);
    uploadImage(file, imageId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (imageId) => {
    let removedUploadedUrl = null;
    let remaining = 0;
    setFormData((prev) => {
      const nextImages = prev.images.filter((img) => {
        if (img.id === imageId) {
          revokePreviewUrl(img.url);
          removedUploadedUrl = img.uploadedUrl || null;
          return false;
        }
        return true;
      });
      remaining = nextImages.length;
      return {
        ...prev,
        images: nextImages,
      };
    });
    if ((removedUploadedUrl && removedUploadedUrl === primaryImageUrl) || remaining === 0) {
      setPrimaryImageUrl(null);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 2:
        if (formData.budgetMin >= formData.budgetMax) {
          newErrors.budget = 'Minimum budget must be less than maximum';
        }
        if (!formData.condition) newErrors.condition = 'Condition preference is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 3:
        // Images are optional, no validation needed
        break;
      case 4:
        if (formData.duration < 1 || formData.duration > 30) {
          newErrors.duration = 'Duration must be between 1 and 30 days';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastSaved(new Date());
      console.log('Draft saved:', formData);
      // Show success message
    } catch (error) {
      console.error('Save draft failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLot = async () => {
    // Validate all steps
    let isValid = true;
    for (let i = 1; i <= steps.length; i++) {
      if (!validateStep(i)) {
        isValid = false;
        setCurrentStep(i);
        break;
      }
    }

    if (!isValid) return;

    if (formData.images.some((image) => image.uploading)) {
      setErrors((prev) => ({
        ...prev,
        submit: 'Please wait for the image upload to finish before publishing.',
      }));
      return;
    }

    setIsPublishing(true);
    setErrors((prev) => ({ ...prev, submit: '' }));
    try {
      const payload = {
        title: formData.title.trim(),
        budgetAmount: Math.max(Number(formData.budgetMax) || 0, Number(formData.budgetMin) || 0),
        currencyCode: (formData.currency || 'USD').toUpperCase(),
      };

      if (formData.category) {
        payload.category = formData.category;
      }
      if (formData.location) {
        payload.locationCity = formData.location;
      }
      if (formData.tags?.length) {
        payload.subcategory = formData.tags[0];
      }
      if (Number.isFinite(Number(formData.duration)) && Number(formData.duration) > 0) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + Number(formData.duration));
        payload.deadlineAt = deadline.toISOString();
      }

      const description = formData.description.trim();
      if (description) {
        payload.description = description;
      } else if (requestId) {
        payload.description = null;
      }

      const imageUrl = primaryImageUrl || formData.images.find((img) => img.uploadedUrl)?.uploadedUrl || null;
      if (imageUrl) {
        payload.imageUrl = imageUrl;
      } else if (requestId) {
        payload.imageUrl = null;
      }

      let response;
      if (requestId) {
        response = await updateRequest(requestId, payload);
      } else {
        response = await createRequest(payload);
      }

      setLastSaved(new Date());

      const targetId = requestId || response?.id;
      if (targetId) {
        navigate(`/lot-details-offers?id=${targetId}`, {
          state: {
            message: requestId ? 'Lot updated successfully.' : 'Lot published successfully! Sellers can now make offers.',
            type: 'success',
          },
        });
      } else {
        navigate('/browse-lots');
      }
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Failed to publish lot. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteLot = async () => {
    if (!requestId) return;
    if (!window.confirm('Are you sure you want to delete this lot? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setErrors((prev) => ({ ...prev, submit: '' }));
    try {
      await deleteRequest(requestId);
      navigate('/browse-lots', {
        replace: true,
        state: {
          message: 'Lot deleted successfully.',
          type: 'success',
        },
      });
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Failed to delete lot. Please try again.';
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsDeleting(false);
    }
  };

  if (initializing || isLoadingRequest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-20 text-center text-text-secondary">
            <Icon name="Loader2" size={36} className="animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading lot details...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                What are you looking for? *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`input-field w-full ${errors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="e.g., iPhone 15 Pro Max 256GB"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-error-500 text-xs mt-1">{errors.title}</p>
              )}
              <p className="text-text-secondary text-xs mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`input-field w-full h-32 resize-none ${errors.description ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Describe exactly what you're looking for, including specific features, brand preferences, and any other requirements..."
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-error-500 text-xs mt-1">{errors.description}</p>
              )}
              <p className="text-text-secondary text-xs mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleInputChange('category', category.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      formData.category === category.value
                        ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-secondary-300 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name={category.icon} size={18} />
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-error-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-4">
                Budget Range *
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label htmlFor="currency" className="text-xs text-text-secondary uppercase tracking-wide">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value.toUpperCase())}
                    className="input-field w-32"
                  >
                    {['USD', 'EUR', 'GBP', 'AUD', 'CAD'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-text-secondary mb-1">Minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                        {formData.currency}
                      </span>
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => handleInputChange('budgetMin', parseInt(e.target.value) || 0)}
                        className="input-field w-full pl-14"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-text-secondary mb-1">Maximum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                        {formData.currency}
                      </span>
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => handleInputChange('budgetMax', parseInt(e.target.value) || 0)}
                        className="input-field w-full pl-14"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                {errors.budget && (
                  <p className="text-error-500 text-xs">{errors.budget}</p>
                )}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Preferred Condition *
              </label>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <label
                    key={condition.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      formData.condition === condition.value
                        ? 'border-primary bg-primary-50' :'border-border hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="mt-1 text-primary focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-text-primary">{condition.label}</div>
                      <div className="text-sm text-text-secondary">{condition.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.condition && (
                <p className="text-error-500 text-xs mt-1">{errors.condition}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-2">
                Location *
              </label>
              <div className="relative">
                <Icon name="MapPin" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`input-field w-full pl-10 ${errors.location ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="City, State or ZIP code"
                />
              </div>
              {errors.location && (
                <p className="text-error-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Images (Optional)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-primary bg-primary-50' :'border-border hover:border-secondary-300'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Icon name="Upload" size={48} className="text-secondary-400 mx-auto mb-4" />
                <p className="text-text-primary font-medium mb-2">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-text-secondary text-sm mb-4">
                  Upload a primary image (JPG, PNG, GIF up to 5MB)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary px-6 py-2 rounded-lg"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">
                  Uploaded Image
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-secondary-100 relative">
                        <Image
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        {image.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                            Uploading...
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Icon name="X" size={14} />
                      </button>
                      <p className="text-xs text-text-secondary mt-1 truncate">
                        {image.name}
                      </p>
                      {image.error && (
                        <p className="text-xs text-error-500 mt-1">{image.error}</p>
                      )}
                    </div>
                  ))}
                </div>
                {imageUploadError && (
                  <div className="status-error mt-4 p-3 rounded-lg">
                    <p className="text-sm">{imageUploadError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-text-primary mb-2">
                Lot Duration
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="duration"
                  min="1"
                  max="30"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="text-sm font-medium text-text-primary min-w-[80px]">
                  {formData.duration} {formData.duration === 1 ? 'day' : 'days'}
                </div>
              </div>
              {errors.duration && (
                <p className="text-error-500 text-xs mt-1">{errors.duration}</p>
              )}
              <p className="text-text-secondary text-xs mt-1">
                How long should sellers be able to make offers?
              </p>
            </div>

            {/* Auto-accept threshold */}
            <div>
              <label htmlFor="autoAccept" className="block text-sm font-medium text-text-primary mb-2">
                Auto-accept Threshold (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  id="autoAccept"
                  value={formData.autoAcceptThreshold}
                  onChange={(e) => handleInputChange('autoAcceptThreshold', parseInt(e.target.value) || 0)}
                  className="input-field w-full pl-8"
                  min="0"
                  placeholder="0"
                />
              </div>
              <p className="text-text-secondary text-xs mt-1">
                Automatically accept offers at or below this price (0 = disabled)
              </p>
            </div>

            {/* Seller Requirements */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Seller Requirements
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.sellerRequirements.verifiedOnly}
                    onChange={(e) => handleNestedInputChange('sellerRequirements', 'verifiedOnly', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-primary">Verified sellers only</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.sellerRequirements.businessSellers}
                    onChange={(e) => handleNestedInputChange('sellerRequirements', 'businessSellers', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-primary">Allow business sellers</span>
                </label>
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-text-primary">Minimum seller rating:</label>
                  <select
                    value={formData.sellerRequirements.minRating}
                    onChange={(e) => handleNestedInputChange('sellerRequirements', 'minRating', parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value={0}>No requirement</option>
                    <option value={3}>3+ stars</option>
                    <option value={4}>4+ stars</option>
                    <option value={5}>5 stars only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    const selectedCategory = categories.find(cat => cat.value === formData.category);
    const selectedCondition = conditions.find(cond => cond.value === formData.condition);

    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Preview</h3>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h4 className="text-xl font-semibold text-text-primary">
              {formData.title || 'Your lot title will appear here'}
            </h4>
            {selectedCategory && (
              <div className="flex items-center space-x-2 mt-2">
                <Icon name={selectedCategory.icon} size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">{selectedCategory.label}</span>
              </div>
            )}
          </div>

          {/* Budget */}
          {(formData.budgetMin > 0 || formData.budgetMax > 0) && (
            <div className="flex items-center space-x-2">
              <Icon name="DollarSign" size={16} className="text-success-500" />
              <span className="text-lg font-semibold text-success-500">
                {`${formatCurrency(formData.budgetMin)} - ${formatCurrency(formData.budgetMax)}`}
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-text-secondary">
              {formData.description || 'Your detailed description will appear here...'}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            {selectedCondition && (
              <div>
                <span className="text-xs text-text-secondary">Condition</span>
                <p className="text-sm font-medium text-text-primary">{selectedCondition.label}</p>
              </div>
            )}
            {formData.location && (
              <div>
                <span className="text-xs text-text-secondary">Location</span>
                <p className="text-sm font-medium text-text-primary">{formData.location}</p>
              </div>
            )}
          </div>

          {/* Images */}
          {(formData.images.length > 0 || primaryImageUrl) && (
            <div>
              <span className="text-xs text-text-secondary">Images</span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.images.slice(0, 3).map((image) => (
                  <div key={image.id} className="aspect-square rounded overflow-hidden bg-secondary-100">
                    <Image
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {primaryImageUrl && formData.images.length === 0 && (
                  <div className="aspect-square rounded overflow-hidden bg-secondary-100">
                    <Image
                      src={primaryImageUrl}
                      alt="Primary lot image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {formData.images.length > 3 && (
                  <div className="aspect-square rounded bg-secondary-100 flex items-center justify-center">
                    <span className="text-xs text-text-secondary">+{formData.images.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loadError && (
            <div className="status-error mb-6 p-4 rounded-lg">
              <p className="text-sm">{loadError}</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Create New Lot</h1>
                <p className="text-text-secondary mt-1">
                  Tell sellers what you're looking for and receive competitive offers
                </p>
              </div>
              
              {/* Auto-save status */}
              <div className="flex items-center space-x-4">
                {lastSaved && (
                  <div className="text-sm text-text-secondary">
                    Last updated: {lastSaved.toLocaleTimeString()}
                  </div>
                )}

                {/* Preview Toggle (Desktop) */}
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="hidden lg:flex items-center space-x-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary-50 transition-colors duration-200"
                >
                  <Icon name="Eye" size={16} />
                  <span>{isPreviewMode ? 'Hide Preview' : 'Show Preview'}</span>
                </button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                      currentStep === step.id
                        ? 'bg-primary text-white'
                        : currentStep > step.id
                        ? 'bg-success-500 text-white' :'bg-secondary-200 text-text-secondary'
                    }`}>
                      {currentStep > step.id ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      currentStep > step.id ? 'bg-success-500' : 'bg-secondary-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className={`${isPreviewMode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="bg-surface rounded-lg border border-border p-6">
                <form onSubmit={(e) => e.preventDefault()}>
                  {renderStepContent()}
                  
                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                      className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Icon name="ChevronLeft" size={16} />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-3">
                      {currentStep < steps.length ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="btn-primary px-6 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <span>Next</span>
                          <Icon name="ChevronRight" size={16} />
                        </button>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {requestId && (
                            <button
                              type="button"
                              onClick={handleDeleteLot}
                              disabled={isDeleting}
                              className="btn-secondary px-6 py-2 rounded-lg flex items-center space-x-2 border-error-300 text-error-600 hover:bg-error-50"
                            >
                              {isDeleting ? (
                                <>
                                  <Icon name="Loader2" size={16} className="animate-spin" />
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Icon name="Trash" size={16} />
                                  <span>Delete Lot</span>
                                </>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handlePublishLot}
                            disabled={isPublishing}
                            className="btn-primary px-6 py-2 rounded-lg flex items-center space-x-2"
                          >
                            {isPublishing ? (
                              <>
                                <Icon name="Loader2" size={16} className="animate-spin" />
                                <span>Publishing...</span>
                              </>
                            ) : (
                              <>
                                <Icon name="Send" size={16} />
                                <span>Publish Lot</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Preview Panel (Desktop) */}
            {isPreviewMode && (
              <div className="hidden lg:block">
                {renderPreview()}
              </div>
            )}
          </div>

          {/* Mobile Preview */}
          <div className="lg:hidden mt-8">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border rounded-lg hover:bg-secondary-50 transition-colors duration-200 mb-4"
            >
              <Icon name="Eye" size={18} />
              <span>{isPreviewMode ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
            
            {isPreviewMode && renderPreview()}
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="mt-6 status-error rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={18} />
                <span>{errors.submit}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLot;