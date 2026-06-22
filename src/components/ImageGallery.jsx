"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import "./ImageGallery.css";

const ImageZoom = ({ src, alt }) => {
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e) => {
    // Only apply hover zoom on desktop
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      
      setZoomStyle({
        transformOrigin: `${x}% ${y}%`,
        transform: 'scale(1.8)'
      });
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setZoomStyle({
        transformOrigin: 'center center',
        transform: 'scale(1)'
      });
    }
  };

  const handleClick = () => {
    // Only apply click/tap zoom on mobile
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsZoomed(!isZoomed);
    }
  };

  // Safely check for desktop during render using a simple check or defer to CSS.
  // To avoid hydration mismatch, we'll apply zoomStyle universally, but the handlers above restrict it.
  // The state will be empty anyway on mobile because handleMouseMove won't trigger.

  return (
    <div 
      className="image-zoom-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Image 
        src={src} 
        alt={alt} 
        width={500} 
        height={500} 
        className={`zoom-img ${isZoomed ? 'mobile-zoomed' : ''}`} 
        style={zoomStyle}
        priority
      />
    </div>
  );
};

export default function ImageGallery({ frontImage, backImage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef(null);

  const handleScroll = () => {
    if (galleryRef.current) {
      const scrollPosition = galleryRef.current.scrollLeft;
      const width = galleryRef.current.offsetWidth;
      // Calculate which item is mostly in view
      const newIndex = Math.round(scrollPosition / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  // Reset to first image when variant changes
  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft = 0;
      setActiveIndex(0);
    }
  }, [frontImage, backImage]);

  return (
    <div className="gallery-container">
      <div 
        className="swipe-gallery" 
        ref={galleryRef}
        onScroll={handleScroll}
      >
        <div className="swipe-item">
          <ImageZoom src={frontImage} alt="Front View" />
        </div>
        <div className="swipe-item">
          <ImageZoom src={backImage} alt="Back View" />
        </div>
      </div>
      
      <div className="gallery-indicators">
        <div className={`indicator ${activeIndex === 0 ? 'active' : ''}`} />
        <div className={`indicator ${activeIndex === 1 ? 'active' : ''}`} />
      </div>
    </div>
  );
}
