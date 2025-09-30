import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ImageCarousel = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-64 lg:h-96 bg-secondary-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Icon name="ImageOff" size={48} className="text-secondary-400 mx-auto mb-2" />
          <p className="text-secondary-500 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 lg:h-96 bg-secondary-100 rounded-lg overflow-hidden group">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <Image
          src={images[currentIndex]}
          alt={`Lot image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay for Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            aria-label="Previous image"
          >
            <Icon name="ChevronLeft" size={20} className="text-text-primary" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            aria-label="Next image"
          >
            <Icon name="ChevronRight" size={20} className="text-text-primary" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Auto-play Control */}
      {images.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute top-4 left-4 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Start slideshow"}
        >
          <Icon name={isAutoPlaying ? "Pause" : "Play"} size={16} />
        </button>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125' :'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Touch/Swipe Indicators for Mobile */}
      <div className="lg:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        <Icon name="Smartphone" size={12} />
        <span>Swipe to navigate</span>
      </div>
    </div>
  );
};

export default ImageCarousel;