"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Loader2,
  CheckCircle2,
  Ban, 
} from "lucide-react";
import axios from "axios";
import Image from "next/image";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/products/${id}`);
        if (res.data.success) {
          const productData = res.data.data;
          setProduct(productData);

          const savedWishlist =
            JSON.parse(localStorage.getItem("wishlist")) || [];
          setIsWishlisted(
            savedWishlist.some((item) => item.id === productData.id),
          );

          const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
          setIsAddedToCart(
            savedCart.some((item) => item.id === productData.id),
          );
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    // Prevent adding to cart if out of stock
    if (!product || product.stock === 0) return;

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
    setIsAddedToCart(true);

    window.dispatchEvent(new Event("storage"));

    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    let updated;
    if (isWishlisted) {
      updated = saved.filter((item) => item.id !== product.id);
    } else {
      updated = [...saved, product];
    }
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event("storage"));
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-20 font-serif italic text-2xl text-slate-400">
        Product not found.
      </div>
    );

  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="relative w-full max-w-md mx-auto lg:max-w-none">
          <div className="aspect-4/5 relative rounded-4xl overflow-hidden bg-[#F5F3FF] shadow-sm">
            <Image
              src={
                product.image ||
                product.image_url ||
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600"
              }
              alt={product.name}
              fill
              priority
              className={`object-cover transition-transform duration-700 ${isOutOfStock ? "grayscale opacity-70" : "hover:scale-105"}`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white/90 px-6 py-2 rounded-full text-red-600 font-black uppercase tracking-[0.3em] text-xs shadow-xl border border-red-100">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col pt-2">
          <div className="border-b border-slate-100 pb-5 mb-5">
            <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[9px] mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900 mb-3 leading-tight">
              {product.name}
            </h1>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-5">
              {product.description ||
                "Indulge in premium quality and timeless design. This curated piece brings together modern aesthetics with exceptional craftsmanship for your daily lifestyle."}
            </p>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center bg-green-50 px-2.5 py-0.5 rounded-full text-green-700 text-[10px] font-bold border border-green-100">
                4.5 <Star size={10} className="fill-green-700 ml-1" />
              </div>
              <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest border-l border-slate-200 pl-3">
                1.2k Ratings
              </span>
              {isOutOfStock && (
                <span className="ml-auto text-red-500 font-bold text-[9px] uppercase tracking-widest animate-pulse">
                  Currently Unavailable
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span
                className={`text-2xl font-black tracking-tight ${isOutOfStock ? "text-slate-400" : "text-slate-900"}`}
              >
                ₹{Number(product.price).toLocaleString()}
              </span>
              {!isOutOfStock && (
                <>
                  <span className="text-slate-400 line-through text-base">
                    ₹{Number(product.price + 500).toLocaleString()}
                  </span>
                  <span className="text-orange-500 font-bold text-[11px] uppercase tracking-wider">
                    Special Offer
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={addToCart}
              disabled={isOutOfStock}
              className={`flex-[2] py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                  : isAddedToCart
                    ? "bg-green-600 text-white shadow-green-100 active:scale-95"
                    : "bg-slate-900 text-white hover:bg-purple-600 shadow-slate-200 active:scale-95"
              }`}
            >
              {isOutOfStock ? (
                <>
                  <Ban size={16} /> Out of Stock
                </>
              ) : isAddedToCart ? (
                <>
                  <CheckCircle2 size={16} /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> Add to Cart
                </>
              )}
            </button>
            <button
              onClick={toggleWishlist}
              className={`flex-1 border border-slate-200 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 border-red-100 text-red-500"
                  : "bg-white text-slate-700 hover:border-purple-200 hover:text-purple-600"
              }`}
            >
              <Heart
                size={16}
                className={isWishlisted ? "fill-red-500 text-red-500" : ""}
              />
              Wishlist
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                <Truck size={18} />
              </div>
              <p className="text-[8px] font-bold uppercase text-slate-500 tracking-tighter">
                Fast Delivery
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <ShieldCheck size={18} />
              </div>
              <p className="text-[8px] font-bold uppercase text-slate-500 tracking-tighter">
                100% Original
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
                <RotateCcw size={18} />
              </div>
              <p className="text-[8px] font-bold uppercase text-slate-500 tracking-tighter">
                14 Days Return
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
