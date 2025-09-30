import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const MakeOfferModal = ({ lot, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    price: '',
    currency: 'USD',
    description: '',
    deliveryOptions: [
      { type: 'pickup', location: '', timeframe: '', cost: 0 }
    ],
    timeline: '',
    warranty: '',
    paymentTerms: '',
    additionalServices: [],
    images: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDeliveryOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.deliveryOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, deliveryOptions: updatedOptions }));
  };

  const addDeliveryOption = () => {
    setFormData(prev => ({
      ...prev,
      deliveryOptions: [
        ...prev.deliveryOptions,
        { type: 'shipping', location: '', timeframe: '', cost: 0 }
      ]
    }));
  };

  const removeDeliveryOption = (index) => {
    if (formData.deliveryOptions.length > 1) {
      const updatedOptions = formData.deliveryOptions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, deliveryOptions: updatedOptions }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreview.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: updatedImages }));
    setImagePreview(updatedPreviews);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.price || formData.price <= 0) {
        newErrors.price = 'Please enter a valid price';
      }
      if (formData.price > lot.budgetRange.max * 1.5) {
        newErrors.price = 'Price significantly exceeds buyer budget';
      }
      if (!formData.description || formData.description.length < 50) {
        newErrors.description = 'Description must be at least 50 characters';
      }
    }

    if (step === 2) {
      formData.deliveryOptions.forEach((option, index) => {
        if (!option.timeframe) {
          newErrors[`delivery_${index}_timeframe`] = 'Timeframe is required';
        }
        if (option.type === 'pickup' && !option.location) {
          newErrors[`delivery_${index}_location`] = 'Pickup location is required';
        }
      });
      if (!formData.timeline) {
        newErrors.timeline = 'Availability timeline is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const offerData = {
        ...formData,
        lotId: lot.id,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      onSubmit(offerData);
    } catch (error) {
      console.error('Error submitting offer:', error);
      setErrors({ submit: 'Failed to submit offer. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency
    }).format(amount);
  };

  const modalContent = (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-subtle">
      <div className="w-full max-w-2xl bg-surface rounded-xl shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Make an Offer</h2>
            <p className="text-sm text-text-secondary mt-1">{lot.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-secondary-50 border-b border-border">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary text-white' : 'bg-secondary-200'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Offer Details</span>
            </div>
            <div className="flex-1 h-px bg-secondary-200 mx-4" />
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-primary text-white' : 'bg-secondary-200'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Delivery & Terms</span>
            </div>
            <div className="flex-1 h-px bg-secondary-200 mx-4" />
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-primary text-white' : 'bg-secondary-200'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Step 1: Offer Details */}
            {currentStep === 1 && (
              <>
                {/* Budget Reference */}
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-2">Buyer's Budget Range</h3>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(lot.budgetRange.min)} - {formatCurrency(lot.budgetRange.max)}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-text-primary mb-2">
                    Your Offer Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                      $
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`input-field w-full pl-8 ${errors.price ? 'border-error-500' : ''}`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-error-500 text-xs mt-1">{errors.price}</p>
                  )}
                  {formData.price && (
                    <p className="text-xs text-text-secondary mt-1">
                      {formData.price < lot.budgetRange.min 
                        ? 'Below buyer budget range'
                        : formData.price > lot.budgetRange.max
                        ? 'Above buyer budget range' :'Within buyer budget range'
                      }
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                    Offer Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`input-field w-full resize-none ${errors.description ? 'border-error-500' : ''}`}
                    placeholder="Describe what you're offering, condition, specifications, why your offer is competitive..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description && (
                      <p className="text-error-500 text-xs">{errors.description}</p>
                    )}
                    <p className="text-xs text-text-secondary ml-auto">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Product Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Icon name="Upload" size={32} className="text-text-secondary" />
                      <p className="text-sm text-text-secondary">
                        Click to upload images (max 5)
                      </p>
                    </label>
                  </div>
                  
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center text-xs"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {errors.images && (
                    <p className="text-error-500 text-xs mt-1">{errors.images}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Delivery & Terms */}
            {currentStep === 2 && (
              <>
                {/* Delivery Options */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-text-primary">
                      Delivery Options *
                    </label>
                    <button
                      type="button"
                      onClick={addDeliveryOption}
                      className="text-primary hover:underline text-sm flex items-center space-x-1"
                    >
                      <Icon name="Plus" size={14} />
                      <span>Add Option</span>
                    </button>
                  </div>
                  
                  {formData.deliveryOptions.map((option, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <select
                          value={option.type}
                          onChange={(e) => handleDeliveryOptionChange(index, 'type', e.target.value)}
                          className="input-field"
                        >
                          <option value="pickup">Local Pickup</option>
                          <option value="shipping">Shipping</option>
                        </select>
                        
                        {formData.deliveryOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDeliveryOption(index)}
                            className="text-error-500 hover:text-error-600 p-1"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {option.type === 'pickup' && (
                          <input
                            type="text"
                            placeholder="Pickup location"
                            value={option.location}
                            onChange={(e) => handleDeliveryOptionChange(index, 'location', e.target.value)}
                            className={`input-field ${errors[`delivery_${index}_location`] ? 'border-error-500' : ''}`}
                          />
                        )}
                        
                        <input
                          type="text"
                          placeholder="Timeframe (e.g., Same day, 2-3 days)"
                          value={option.timeframe}
                          onChange={(e) => handleDeliveryOptionChange(index, 'timeframe', e.target.value)}
                          className={`input-field ${errors[`delivery_${index}_timeframe`] ? 'border-error-500' : ''}`}
                        />
                        
                        {option.type === 'shipping' && (
                          <input
                            type="number"
                            placeholder="Shipping cost"
                            value={option.cost}
                            onChange={(e) => handleDeliveryOptionChange(index, 'cost', parseFloat(e.target.value) || 0)}
                            className="input-field"
                            min="0"
                            step="0.01"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-text-primary mb-2">
                    Availability Timeline *
                  </label>
                  <input
                    type="text"
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.timeline ? 'border-error-500' : ''}`}
                    placeholder="e.g., Available immediately, Within 24 hours, 2-3 business days"
                  />
                  {errors.timeline && (
                    <p className="text-error-500 text-xs mt-1">{errors.timeline}</p>
                  )}
                </div>

                {/* Warranty */}
                <div>
                  <label htmlFor="warranty" className="block text-sm font-medium text-text-primary mb-2">
                    Warranty/Guarantee (Optional)
                  </label>
                  <input
                    type="text"
                    id="warranty"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="e.g., 30-day return policy, 1-year warranty"
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label htmlFor="paymentTerms" className="block text-sm font-medium text-text-primary mb-2">
                    Payment Terms (Optional)
                  </label>
                  <input
                    type="text"
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="e.g., Full payment on delivery, 50% upfront"
                  />
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary">Review Your Offer</h3>
                
                {/* Offer Summary */}
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-primary">Total Offer</h4>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(parseFloat(formData.price) || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary-700">Buyer Budget</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(lot.budgetRange.min)} - {formatCurrency(lot.budgetRange.max)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Description</h4>
                  <p className="text-sm text-text-secondary bg-secondary-50 p-3 rounded">
                    {formData.description}
                  </p>
                </div>

                {/* Delivery Options Preview */}
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Delivery Options</h4>
                  <div className="space-y-2">
                    {formData.deliveryOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Icon name={option.type === 'pickup' ? 'MapPin' : 'Truck'} size={16} className="text-text-secondary" />
                        <span>
                          {option.type === 'pickup' 
                            ? `Pickup: ${option.location} (${option.timeframe})`
                            : `Shipping: ${option.timeframe} (${formatCurrency(option.cost)})`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                {(formData.timeline || formData.warranty || formData.paymentTerms) && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Additional Details</h4>
                    <div className="space-y-1 text-sm text-text-secondary">
                      {formData.timeline && (
                        <p><strong>Timeline:</strong> {formData.timeline}</p>
                      )}
                      {formData.warranty && (
                        <p><strong>Warranty:</strong> {formData.warranty}</p>
                      )}
                      {formData.paymentTerms && (
                        <p><strong>Payment:</strong> {formData.paymentTerms}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="status-error rounded-lg p-3">
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-secondary-50">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn-secondary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Icon name="ChevronLeft" size={16} />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <span>Next</span>
                  <Icon name="ChevronRight" size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} />
                      <span>Submit Offer</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MakeOfferModal;