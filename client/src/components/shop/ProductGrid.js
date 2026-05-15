import { Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import { getWishlistItemKey } from "@/app/utils/browserStorage";

export default function ProductGrid({
  products,
  loading,
  wishlist,
  toggleWishlist,
  resetFilters,
}) {
  return (
    <>
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-start justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#7C3AED]" size={40} />
            <p className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-widest">
              Updating Curation...
            </p>
          </div>
        </div>
      )}

      <div
        className={`grid gap-x-6 gap-y-10 transition-opacity duration-300 ${
          loading ? "opacity-30" : "opacity-100"
        } grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`}
      >
        {products.length > 0
          ? products.map((product) => {
              const productWishlistKey = getWishlistItemKey({
                id: product.id,
                variant_id: product.variant_id ?? null,
                selectedColor: product.variant_color || null,
                selectedSize: product.variant_size || null,
              });

              return (
                <ProductCard
                  key={
                    product.card_key ||
                    `${product.id}-${product.variant_id || "default"}`
                  }
                  product={product}
                  isInWishlist={wishlist.some(
                    (item) => getWishlistItemKey(item) === productWishlistKey,
                  )}
                  toggleWishlist={toggleWishlist}
                />
              );
            })
          : !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-32 border-2 border-dashed border-[#DDD6FE] rounded-[2.5rem] bg-[#F5F3FF]/30">
                <p className="font-serif italic text-xl text-[#4C1D95]/40 mb-2">
                  No items found
                </p>
                <button
                  onClick={resetFilters}
                  className="text-[9px] font-bold uppercase tracking-widest text-[#4C1D95]/80 hover:text-[#7C3AED] underline underline-offset-4"
                >
                  Reset Filters
                </button>
              </div>
            )}
      </div>
    </>
  );
}
