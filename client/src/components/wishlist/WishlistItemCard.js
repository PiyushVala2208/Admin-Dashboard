"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2 } from "lucide-react";

function WishlistItemCard({
  item,
  price,
  needsSelection,
  isOutOfStock,
  onMoveToCart,
  onRemove,
}) {
  const selectedAttributes = Array.isArray(item.selectedAttributes)
    ? item.selectedAttributes
    : [];
  const filteredAttributes = selectedAttributes.filter(
    (attribute) => !/color|colour/i.test(attribute.name || ""),
  );
  const selectionText = filteredAttributes.length
    ? filteredAttributes
        .map((attribute) => `${attribute.name}: ${attribute.value}`)
        .join(" | ")
    : item.selectedSize
      ? `Size: ${item.selectedSize}`
      : null;

  return (
    <div className="bg-white rounded-4xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 group relative flex flex-col">
      <Link href={`/products/${item.id}`} className="cursor-pointer">
        <div className="relative aspect-4/5 sm:aspect-square overflow-hidden bg-slate-50">
          <Image
            src={
              item.variant_image ||
              item.image ||
              item.image_url ||
              "https://placehold.co/400x600?text=No+Image"
            }
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-md text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
              {item.category_name || item.category}
            </span>

            {item.selectedColor && (
              <span className="bg-white/90 backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded-lg uppercase w-fit border border-slate-100 shadow-sm">
                {item.selectedColor}
              </span>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px] flex items-center justify-center">
              <div className="bg-white text-slate-900 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">
                Waitlist Only
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <Link href={`/products/${item.id}`}>
            <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight mb-1 hover:text-purple-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>

          {selectionText ? (
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse" />
              Selected: {selectionText}
            </p>
          ) : (
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Select options to move to cart
            </p>
          )}

          <p className="text-purple-600 font-black text-xl">
            ₹{Number(price).toLocaleString()}
          </p>
        </div>

        <div className="mt-auto flex flex-col xs:flex-row gap-3">
          <button
            onClick={onMoveToCart}
            disabled={isOutOfStock}
            className="flex-3 bg-slate-900 hover:bg-purple-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200 hover:shadow-purple-200"
          >
            <ShoppingCart size={16} />
            {needsSelection
              ? "Select Options"
              : !isOutOfStock
                ? "Move To Cart"
                : "Out of Stock"}
          </button>
          <button
            onClick={onRemove}
            className="flex-1 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 py-4 rounded-2xl flex items-center justify-center transition-all group/trash shadow-sm"
          >
            <Trash2
              size={20}
              className="group-hover/trash:rotate-12 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(WishlistItemCard);
