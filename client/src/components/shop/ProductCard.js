import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function ProductCard({ product, isInWishlist, toggleWishlist }) {
  const displayStock = Number(product.stock || 0);
  const displayPrice = Number(
    product.starting_from_price ?? product.price ?? product.default_variant_price ?? 0,
  );
  const isOutOfStock = displayStock === 0;
  const isLowStock = displayStock > 0 && displayStock <= 5;
  const isFewLeft = displayStock > 5 && displayStock <= 10;

  return (
    <Link href={`/products/${product.id}`}>
      <article className="group cursor-pointer relative">
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`p-2 backdrop-blur-md rounded-xl shadow-sm border transition-all duration-300 active:scale-90 ${
              isInWishlist
                ? "bg-red-50 border-red-100 text-red-500 shadow-red-100"
                : "bg-white/90 border-white/50 text-[#4C1D95]/30 hover:text-red-500"
            }`}
          >
            <Heart
              size={16}
              className={`${isInWishlist ? "fill-red-500" : "fill-transparent"} transition-all duration-300`}
            />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl md:rounded-4xl bg-[#F5F3FF] transition-all duration-500 shadow-sm group-hover:shadow-lg aspect-4/5">
          <Image
            src={
              product.image ||
              product.image_url ||
              "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=400&h=500&auto=format&fit=crop"
            }
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
              isOutOfStock ? "grayscale opacity-60" : ""
            }`}
          />
          <div className="absolute inset-0 bg-[#4C1D95]/0 group-hover:bg-[#4C1D95]/5 transition-colors duration-500" />

          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest rounded-full shadow-sm z-10 backdrop-blur-md ${
              isOutOfStock
                ? "bg-red-500 text-white"
                : isLowStock
                  ? "bg-orange-100 text-orange-600 border border-orange-200 animate-pulse"
                  : "bg-white/95 text-[#7C3AED]"
            }`}
          >
            {isOutOfStock
              ? "Sold Out"
              : isLowStock
                ? `Only ${displayStock} Left`
                : isFewLeft
                  ? "Limited Edition"
                  : "Exclusive"}
          </span>

          {isOutOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
              <span className="bg-black/60 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                Check Back Later
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#A78BFA] mb-1">
            {product.category_name || product.category}
          </p>
          <h3 className="text-[#4C1D95] italic text-lg group-hover:text-[#7C3AED] transition-colors leading-tight truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Starting From
            </span>
            <span
              className={`font-bold text-base tracking-tight ${
                isOutOfStock ? "text-[#4C1D95]/40 line-through" : "text-[#4C1D95]"
              }`}
            >
              Rs {displayPrice.toLocaleString()}
            </span>
            {isLowStock ? (
              <span className="text-orange-500 text-[9px] font-bold italic animate-bounce">
                Selling Fast!
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
