"use client";

import { useState } from "react";
import styles from "./ImageGallery.module.css";
import { ZoomIn, Download, X } from "lucide-react";

export default function ImageGallery({ images, alt }: { images: string[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `carro-${alt.toLowerCase().replace(/\s+/g, '-')}-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback simple link
      window.open(url, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      {/* Main Image */}
      <div className={styles.mainWrapper}>
        <img 
          src={images[currentIndex]} 
          alt={`${alt} - Foto ${currentIndex + 1}`} 
          className={styles.mainImage} 
          onClick={() => setIsZoomed(true)}
          style={{ cursor: "zoom-in" }}
        />
        
        <div className={styles.imageActions}>
          <button className={styles.actionBtn} onClick={() => setIsZoomed(true)} title="Ampliar">
            <ZoomIn size={20} />
          </button>
          <button className={styles.actionBtn} onClick={() => downloadImage(images[currentIndex])} title="Baixar">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className={styles.modalOverlay} onClick={() => setIsZoomed(false)}>
          <button className={styles.modalClose} onClick={() => setIsZoomed(false)}>
            <X size={24} />
          </button>
          <img src={images[currentIndex]} alt={alt} className={styles.modalImage} />
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={styles.thumbnailsWrapper}>
          {images.map((img, i) => (
            <button 
              key={i} 
              type="button" 
              onClick={() => setCurrentIndex(i)} 
              className={`${styles.thumbnailBtn} ${i === currentIndex ? styles.activeThumbnail : ""}`}
            >
              <img src={img} alt={`Miniatura ${i + 1}`} className={styles.thumbnailImg} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
