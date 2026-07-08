'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageGallery.css';

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
        transform: 'scale(1.8)',
      });
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setZoomStyle({
        transformOrigin: 'center center',
        transform: 'scale(1)',
      });
    }
  };

  const handleClick = () => {
    // Only apply click/tap zoom on mobile
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsZoomed(!isZoomed);
    }
  };

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

export default function ImageGallery({ frontImage, backImage, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef(null);

  const handleScroll = () => {
    if (galleryRef.current) {
      const scrollPosition = galleryRef.current.scrollLeft;
      const width = galleryRef.current.offsetWidth;
      const newIndex = Math.round(scrollPosition / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollTo = (index) => {
    if (galleryRef.current) {
      const width = galleryRef.current.offsetWidth;
      galleryRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  const goNext = () => {
    scrollTo(activeIndex < 1 ? activeIndex + 1 : 0);
  };

  const goPrev = () => {
    scrollTo(activeIndex > 0 ? activeIndex - 1 : 1);
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
      {/* Navigation Arrows */}
      <button
        className="gallery-arrow gallery-arrow-left"
        onClick={goPrev}
        aria-label="Previous image"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        className="gallery-arrow gallery-arrow-right"
        onClick={goNext}
        aria-label="Next image"
      >
        <ChevronRight size={22} />
      </button>

      <div className="swipe-gallery" ref={galleryRef} onScroll={handleScroll}>
        <div className="swipe-item">
          <ImageZoom src={frontImage} alt={`${productName || 'Coffee'} - Front View`} />
        </div>
        <div className="swipe-item">
          <ImageZoom src={backImage} alt={`${productName || 'Coffee'} - Back View`} />
        </div>
      </div>

      <div className="gallery-indicators">
        <button
          className={`indicator ${activeIndex === 0 ? 'active' : ''}`}
          onClick={() => scrollTo(0)}
          aria-label="View front"
        />
        <button
          className={`indicator ${activeIndex === 1 ? 'active' : ''}`}
          onClick={() => scrollTo(1)}
          aria-label="View back"
        />
      </div>
    </div>
  );
}
