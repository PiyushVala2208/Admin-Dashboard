"use client";
import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
    setLoading(false);
  }, []);

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (id, delta) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;

          if (newQty < 1) {
            return null;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item !== null);

    saveCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    saveCart(updatedCart);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    const token = Cookies.get("token");

    if (!token) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFCFE] py-8 md:py-16 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-200">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Your Bag
          </h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 md:p-6 rounded-4xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row items-center gap-6 group transition-all hover:border-purple-200"
                >
                  <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={item.image || item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 mb-1">
                      {item.category}
                    </p>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      {item.name}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium italic">
                      ₹{Number(item.price).toLocaleString()} each
                    </p>
                  </div>

                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <p className="text-lg font-black text-slate-900 flex-1 sm:flex-none text-left sm:text-right">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-purple-100/20 sticky top-10">
                <h2 className="text-xl font-black text-slate-900 mb-8 border-b pb-4">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span className="text-slate-900">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Shipping</span>
                    <span
                      className={
                        shipping === 0
                          ? "text-green-600 font-bold"
                          : "text-slate-900"
                      }
                    >
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-dashed flex justify-between items-end">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
                      Total Amount
                    </span>
                    <span className="text-3xl font-black text-purple-600">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-purple-600 transition-all shadow-lg hover:shadow-purple-200 active:scale-[0.98] mb-6"
                >
                  Proceed To Checkout <ArrowRight size={18} />
                </button>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={16} className="text-green-500" /> Secure
                    SSL Encryption
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Truck size={16} className="text-blue-500" /> 7-Day Easy
                    Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-16 md:p-24 border border-dashed border-slate-200 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Your cart feels lonely
            </h2>
            <p className="text-slate-500 text-sm mb-10 max-w-xs mx-auto">
              Looks like you haven't added anything to your cart yet. Let's
              change that!
            </p>
            <Link
              href="/products"
              className="inline-flex bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all"
            >
              Go To Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
