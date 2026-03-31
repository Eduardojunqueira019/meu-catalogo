"use client";

import { useState } from "react";
import styles from "./ImageGallery.module.css";

export default function ImageGallery({ images, alt }: { images: string[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className={styles.container}>
      {/* Main Image */}
      <div className={styles.mainWrapper}>
        <img src={images[currentIndex]} alt={`${alt} - Foto ${currentIndex + 1}`} className={styles.mainImage} />
      </div>

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
