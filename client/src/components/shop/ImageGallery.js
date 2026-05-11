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

      {galleryImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelectImage(index)}
              className={`relative h-18 w-16 shrink-0 overflow-hidden rounded-xl border ${
                activeImageIndex === index
                  ? "border-[#8b3dff]"
                  : "border-slate-200"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} preview ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default memo(ImageGallery);
