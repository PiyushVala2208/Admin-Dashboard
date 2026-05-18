"use client";

import { memo } from "react";
import Image from "next/image";

function ImageGallery({
  productName,
  displayImage,
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
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/15 backdrop-blur-[1px]">
            <span className="rounded-full border border-white/25 bg-black/65 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
              Not Available
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default memo(ImageGallery);
