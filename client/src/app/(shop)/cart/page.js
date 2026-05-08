"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import CartItemCard from "@/components/cart/CartItemCard";
import OrderSummaryCard from "@/components/cart/OrderSummaryCard";
import CheckoutBenefits from "@/components/cart/CheckoutBenefits";
import EmptyCartState from "@/components/cart/EmptyCartState";
import {
  dispatchCartSync,
  getCartItemKey,
  loadCart,
  saveCart,
} from "@/app/utils/browserStorage";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(() => loadCart());

  const persistCart = (nextItems) => {
    const result = saveCart(nextItems);
    if (!result.ok) {
      toast.error("Unable to update cart right now.");
      return false;
    }

    setCartItems(result.items);
    dispatchCartSync();
    return true;
  };

  const updateQuantity = (itemKey, delta) => {
    const nextCart = cartItems
      .map((item) => {
        if (getCartItemKey(item) !== itemKey) return item;

        const currentQty = Number(item.quantity || 1);
        const maxQty = Math.max(1, Number(item.stock || 1));
        const nextQty = currentQty + delta;

        if (nextQty < 1) return null;
        if (nextQty > maxQty) return item;

        return {
          ...item,
          quantity: nextQty,
        };
      })
      .filter(Boolean);

    persistCart(nextCart);
  };

  const removeItem = (itemKey) => {
    const nextCart = cartItems.filter((item) => getCartItemKey(item) !== itemKey);
    persistCart(nextCart);
  };

  const handleSizeChange = (item, nextSize) => {
    const variants = Array.isArray(item.variants) ? item.variants : [];
    if (variants.length === 0) {
      return;
    }

    const targetColor = String(item.selectedColor || "").trim().toLowerCase();
    const matchedVariant =
      variants.find(
        (variant) =>
          String(variant.size || "").trim() === nextSize &&
          String(variant.color || "").trim().toLowerCase() === targetColor,
      ) ||
      variants.find((variant) => String(variant.size || "").trim() === nextSize);

    if (!matchedVariant) {
      toast.error("Selected size is not available.");
      return;
    }

    const nextCart = cartItems.map((entry) => {
      if (getCartItemKey(entry) !== getCartItemKey(item)) return entry;

      const nextStock = Number(matchedVariant.variant_stock ?? matchedVariant.stock ?? 0);
      const nextPrice = Number(matchedVariant.variant_price ?? matchedVariant.price ?? entry.price);
      const nextImage =
        matchedVariant.variant_image ||
        (Array.isArray(matchedVariant.images) ? matchedVariant.images[0] : null) ||
        entry.image;

      return {
        ...entry,
        variant_id: matchedVariant.id || entry.variant_id,
        selectedSize: nextSize,
        price: nextPrice,
        stock: nextStock,
        image: nextImage,
        quantity: Math.min(Number(entry.quantity || 1), Math.max(1, nextStock)),
      };
    });

    persistCart(nextCart);
  };

  const handleCheckout = () => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login?redirect=/checkout");
      return;
    }

    router.push("/checkout");
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [cartItems],
  );

  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 99;

  return (
    <div className="min-h-screen bg-[#FDFCFE] px-4 py-8 md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center gap-4">
          <div className="rounded-2xl bg-purple-600 p-3 text-white shadow-lg shadow-purple-200">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Your Bag
          </h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {cartItems.map((item) => {
                const itemKey = getCartItemKey(item);
                return (
                  <CartItemCard
                    key={itemKey}
                    item={item}
                    itemKey={itemKey}
                    variants={Array.isArray(item.variants) ? item.variants : []}
                    onSizeChange={handleSizeChange}
                    onQuantityChange={updateQuantity}
                    onRemove={removeItem}
                  />
                );
              })}
            </div>

            <div className="space-y-5 lg:col-span-4">
              <OrderSummaryCard
                subtotal={subtotal}
                shipping={shipping}
                onCheckout={handleCheckout}
              />
              <CheckoutBenefits />
            </div>
          </div>
        ) : (
          <EmptyCartState />
        )}
      </div>
    </div>
  );
}
