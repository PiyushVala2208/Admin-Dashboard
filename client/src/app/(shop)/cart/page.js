"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [cartItems, setCartItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCartItems(loadCart());
    setIsHydrated(true);
  }, []);

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
    const nextCart = cartItems.filter(
      (item) => getCartItemKey(item) !== itemKey,
    );
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
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 1),
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

        {!isHydrated ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed max-w-2xl mx-auto">
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-slate-100 animate-pulse" />
            <p className="text-sm font-semibold text-slate-400">
              Loading your bag...
            </p>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {cartItems.map((item) => {
                const itemKey = getCartItemKey(item);
                return (
                  <CartItemCard
                    key={itemKey}
                    item={item}
                    itemKey={itemKey}
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
