"use client";

import { memo } from "react";
import Image from "next/image";

function ImageGallery({
  productName,
  displayImage,
  galleryImages,
  activeImageIndex,
  onSelectImage,
  isOutOfStock,
  fallbackImage,
}) {
  const heroImage = displayImage || fallbackImage;

  return (
    <div className="space-y-4">
      <div className="aspect-4/5 relative rounded-4xl overflow-hidden bg-slate-50 shadow-sm border border-slate-100">
        <Image
          src={heroImage}
          alt={productName}
          fill
          priority
          className={`object-cover transition-transform duration-700 ${
            isOutOfStock ? "grayscale opacity-70" : "hover:scale-105"
          }`}
        />
      </div>
    </div>
  );
}

export default memo(ImageGallery);
