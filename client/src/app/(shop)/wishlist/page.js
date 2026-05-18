"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import WishlistHeader from "@/components/wishlist/WishlistHeader";
import WishlistItemCard from "@/components/wishlist/WishlistItemCard";
import WishlistEmptyState from "@/components/wishlist/WishlistEmptyState";
import WishlistSelectionModal from "@/components/wishlist/WishlistSelectionModal";
import { useCart } from "@/context/CartContext";
import api from "@/app/utils/api";
import {
  dispatchCartSync,
  getCartItemKey,
  getWishlistItemKey,
  loadCart,
  saveCart,
  saveWishlist,
} from "@/app/utils/browserStorage";

export default function WishlistPage() {
  const { wishlistItems } = useCart();
  const [selectionState, setSelectionState] = useState({
    isOpen: false,
    loading: false,
    item: null,
    product: null,
    wishlistKey: null,
  });

  const persistWishlist = (nextItems) => {
    const result = saveWishlist(nextItems);
    if (!result.ok) {
      toast.error("Unable to update wishlist right now.");
      return false;
    }

    dispatchCartSync();
    return true;
  };

  const removeItem = (wishlistKey) => {
    const nextWishlist = wishlistItems.filter(
      (item) => getWishlistItemKey(item) !== wishlistKey,
    );
    persistWishlist(nextWishlist);
  };

  const openSelectionModal = async (item, wishlistKey) => {
    if (!item) return;

    setSelectionState({
      isOpen: true,
      loading: true,
      item,
      product: null,
      wishlistKey,
    });

    try {
      const response = await api.get(`/products/${item.id}`);
      const product = response?.data?.data || response?.data || null;

      setSelectionState((current) => {
        if (!current.isOpen || current.item?.id !== item.id) {
          return current;
        }
        return {
          ...current,
          loading: false,
          product,
        };
      });
    } catch (error) {
      console.error("Wishlist selection load error:", error);
      toast.error("Unable to load product options right now.");
      setSelectionState({
        isOpen: false,
        loading: false,
        item: null,
        product: null,
        wishlistKey: null,
      });
    }
  };

  const closeSelectionModal = () => {
    setSelectionState({
      isOpen: false,
      loading: false,
      item: null,
      product: null,
      wishlistKey: null,
    });
  };

  const moveToCart = (item, wishlistKey) => {
    const variationCount = Number(item.variationAttributeCount ?? 0);
    const selectedCount = Number(item.selectedAttributeCount ?? 0);
    const isSelectionComplete =
      item.isSelectionComplete === true ||
      (variationCount > 0
        ? selectedCount >= variationCount
        : item.variant_id != null || !item.has_variants);
    const needsSelection = Boolean(item.has_variants && !isSelectionComplete);
    if (needsSelection) {
      toast("Please select the remaining options to continue.", {
        icon: "i",
      });
      return;
    }

    const selectedAttributes = Array.isArray(item.selectedAttributes)
      ? item.selectedAttributes
      : [];
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
      selectedAttributes,
      selectedAttributeCount: selectedAttributes.length,
      variationAttributeCount: Number(
        item.variationAttributeCount ?? selectedAttributes.length,
      ),
    };

    const existingIndex = nextCart.findIndex(
      (entry) => getCartItemKey(entry) === getCartItemKey(cartItem),
    );

    if (existingIndex > -1) {
      const nextQuantity = Number(nextCart[existingIndex].quantity || 1) + 1;
      const stockLimit = Math.max(
        1,
        Number(nextCart[existingIndex].stock || 1),
      );
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

    const targetWishlistKey = wishlistKey || getWishlistItemKey(item);
    const nextWishlist = wishlistItems.filter(
      (entry) => getWishlistItemKey(entry) !== targetWishlistKey,
    );

    const wishlistResult = saveWishlist(nextWishlist);
    if (!wishlistResult.ok) {
      toast.error("Cart updated but wishlist sync failed. Please refresh.");
      dispatchCartSync();
      return;
    }

    dispatchCartSync();
    toast.success("Moved to cart.");
  };

  const handleSelectionConfirm = ({
    selectedOptions,
    selectedAttributes,
    matchedVariant,
    variationAttributes,
  }) => {
    const baseItem = selectionState.item;
    if (!baseItem || !matchedVariant) return;

    const matchedPrice = Number(
      matchedVariant.price ??
        matchedVariant.variant_price ??
        baseItem.price ??
        0,
    );
    const matchedStock = Number(
      matchedVariant.stock ??
        matchedVariant.variant_stock ??
        baseItem.stock ??
        0,
    );
    const matchedImage =
      matchedVariant.variant_image ||
      (Array.isArray(matchedVariant.images)
        ? matchedVariant.images[0]
        : null) ||
      baseItem.variant_image ||
      baseItem.image ||
      null;

    const colorAttribute = variationAttributes.find((attribute) =>
      /color|colour/i.test(attribute.name || ""),
    );
    const sizeAttribute = variationAttributes.find((attribute) =>
      /size/i.test(attribute.name || ""),
    );

    const selectedColor = colorAttribute
      ? selectedOptions[colorAttribute.attributeId]
      : baseItem.selectedColor;
    const selectedSize = sizeAttribute
      ? selectedOptions[sizeAttribute.attributeId]
      : baseItem.selectedSize;

    const updatedItem = {
      ...baseItem,
      variant_id: matchedVariant.id ?? baseItem.variant_id ?? null,
      selectedColor: selectedColor || null,
      selectedSize: selectedSize || null,
      selectedAttributes,
      selectedAttributeCount: selectedAttributes.length,
      variationAttributeCount: variationAttributes.length,
      isSelectionComplete: true,
      variant_price: matchedPrice,
      variant_stock: matchedStock,
      variant_image: matchedImage,
      price: matchedPrice,
      stock: matchedStock,
      image: matchedImage,
    };

    moveToCart(updatedItem, selectionState.wishlistKey);
    closeSelectionModal();
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
              const isOutOfStock =
                Number(item.variant_stock ?? item.stock ?? 0) <= 0;
              const variationCount = Number(item.variationAttributeCount ?? 0);
              const selectedCount = Number(item.selectedAttributeCount ?? 0);
              const isSelectionComplete =
                item.isSelectionComplete === true ||
                (variationCount > 0
                  ? selectedCount >= variationCount
                  : item.variant_id != null || !item.has_variants);
              const needsSelection = Boolean(
                item.has_variants && !isSelectionComplete,
              );

              return (
                <WishlistItemCard
                  key={wishlistKey}
                  item={item}
                  price={price}
                  needsSelection={needsSelection}
                  isOutOfStock={isOutOfStock}
                  onMoveToCart={() =>
                    needsSelection
                      ? openSelectionModal(item, wishlistKey)
                      : moveToCart(item, wishlistKey)
                  }
                  onRemove={() => removeItem(wishlistKey)}
                />
              );
            })}
          </div>
        ) : (
          <WishlistEmptyState />
        )}
      </div>

      <WishlistSelectionModal
        isOpen={selectionState.isOpen}
        loading={selectionState.loading}
        item={selectionState.item}
        product={selectionState.product}
        onClose={closeSelectionModal}
        onConfirm={handleSelectionConfirm}
      />
    </div>
  );
}
