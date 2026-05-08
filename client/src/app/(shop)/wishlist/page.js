"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import WishlistHeader from "@/components/wishlist/WishlistHeader";
import WishlistItemCard from "@/components/wishlist/WishlistItemCard";
import WishlistEmptyState from "@/components/wishlist/WishlistEmptyState";
import {
  dispatchCartSync,
  getCartItemKey,
  getWishlistItemKey,
  loadCart,
  loadWishlist,
  saveCart,
  saveWishlist,
} from "@/app/utils/browserStorage";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState(() => loadWishlist());

  const persistWishlist = (nextItems) => {
    const result = saveWishlist(nextItems);
    if (!result.ok) {
      toast.error("Unable to update wishlist right now.");
      return false;
    }

    setWishlistItems(result.items);
    dispatchCartSync();
    return true;
  };

  const removeItem = (wishlistKey) => {
    const nextWishlist = wishlistItems.filter(
      (item) => getWishlistItemKey(item) !== wishlistKey,
    );
    persistWishlist(nextWishlist);
  };

  const moveToCart = (item) => {
    const needsSizeSelection = Boolean(item.has_variants && !item.selectedSize);
    if (needsSizeSelection) {
      toast("Please choose a size on the product page first.", { icon: "i" });
      router.push(`/products/${item.id}`);
      return;
    }

    const nextCart = [...loadCart()];
    const cartItem = {
      id: item.id,
      name: item.name,
      category: item.category_name || item.category,
      variant_id: item.variant_id || null,
      selectedColor: item.selectedColor || null,
      selectedSize: item.selectedSize || null,
      price: Number(item.variant_price ?? item.price ?? 0),
      quantity: 1,
      stock: Number(item.variant_stock ?? item.stock ?? 0),
      image: item.variant_image || item.image,
      variant_image: item.variant_image || item.image,
      has_variants: Boolean(item.has_variants),
      variants: Array.isArray(item.variants) ? item.variants : [],
    };

    const existingIndex = nextCart.findIndex(
      (entry) => getCartItemKey(entry) === getCartItemKey(cartItem),
    );

    if (existingIndex > -1) {
      const nextQuantity = Number(nextCart[existingIndex].quantity || 1) + 1;
      const stockLimit = Math.max(1, Number(nextCart[existingIndex].stock || 1));
      nextCart[existingIndex] = {
        ...nextCart[existingIndex],
        quantity: Math.min(nextQuantity, stockLimit),
      };
    } else {
      nextCart.push(cartItem);
    }

    const cartResult = saveCart(nextCart);
    if (!cartResult.ok) {
      toast.error("Unable to move item to cart right now.");
      return;
    }

    const wishlistKey = getWishlistItemKey(item);
    const nextWishlist = wishlistItems.filter(
      (entry) => getWishlistItemKey(entry) !== wishlistKey,
    );

    const wishlistResult = saveWishlist(nextWishlist);
    if (!wishlistResult.ok) {
      toast.error("Cart updated but wishlist sync failed. Please refresh.");
      dispatchCartSync();
      return;
    }

    setWishlistItems(wishlistResult.items);
    dispatchCartSync();
    toast.success("Moved to cart.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] px-4 py-6 md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <WishlistHeader count={wishlistItems.length} />

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => {
              const wishlistKey = getWishlistItemKey(item);
              const price = Number(item.variant_price ?? item.price ?? 0);
              const isOutOfStock = Number(item.variant_stock ?? item.stock ?? 0) <= 0;
              const needsSizeSelection = Boolean(item.has_variants && !item.selectedSize);

              return (
                <WishlistItemCard
                  key={wishlistKey}
                  item={item}
                  price={price}
                  needsSizeSelection={needsSizeSelection}
                  isOutOfStock={isOutOfStock}
                  onMoveToCart={() => moveToCart(item)}
                  onRemove={() => removeItem(wishlistKey)}
                />
              );
            })}
          </div>
        ) : (
          <WishlistEmptyState />
        )}
      </div>
    </div>
  );
}
