"use client";
import React, { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Ghost,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistItems(savedWishlist);
  }, []);

  const moveToCart = (product) => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = savedCart.findIndex(
      (item) => item.id === product.id,
    );

    if (existingItemIndex > -1) {
      savedCart[existingItemIndex].quantity += 1;
    } else {
      savedCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(savedCart));

    removeItem(product.id);

    window.dispatchEvent(new Event("storage"));
  };

  const removeItem = (id) => {
    const updatedWishlist = wishlistItems.filter((item) => item.id !== id);
    setWishlistItems(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-6 md:py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Favorites
              <Heart
                className="fill-purple-600 text-purple-600 mt-2"
                size={32}
              />
            </h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium uppercase tracking-[0.2em]">
              {wishlistItems.length} Items Reserved
            </p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 text-sm font-bold text-slate-700 hover:text-purple-600 transition-all hover:shadow-md"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Continue Shopping
          </Link>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-4xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 group relative flex flex-col"
              >
                <div className="relative aspect-4/5 sm:aspect-square overflow-hidden bg-slate-50">
                  <img
                    src={
                      item.image ||
                      item.image_url ||
                      "https://placehold.co/400x600?text=No+Image"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {item.stock <= 0 && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px] flex items-center justify-center">
                      <div className="bg-white text-slate-900 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">
                        Waitlist Only
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight mb-1 group-hover:text-purple-600 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-purple-600 font-black text-xl">
                        ₹{Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col xs:flex-row gap-3">
                    <button
                      onClick={() => moveToCart(item)}
                      disabled={item.stock <= 0}
                      className="flex-3 bg-slate-900 hover:bg-purple-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200 hover:shadow-purple-200"
                    >
                      <ShoppingCart size={16} />
                      {item.stock > 0 ? "Add To Cart" : "Out of Stock"}
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-1 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 py-4 rounded-2xl flex items-center justify-center transition-all group/trash shadow-sm"
                      title="Remove"
                    >
                      <Trash2
                        size={20}
                        className="group-hover/trash:rotate-12 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 md:p-24 border border-dashed border-slate-200 text-center shadow-sm max-w-3xl mx-auto">
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-4 bg-purple-50 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="relative p-8 bg-slate-50 rounded-[2.5rem] text-slate-300">
                <Ghost size={80} strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Your collection is empty.
            </h2>
            <p className="text-slate-500 text-sm md:text-base mb-10 max-w-sm mx-auto leading-relaxed">
              Find items you love and save them here. They'll be waiting for you
              when you're ready to make them yours.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-purple-600 text-white px-12 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 active:scale-95"
            >
              <Sparkles size={18} /> Discover Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
