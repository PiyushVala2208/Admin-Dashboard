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
  CheckCircle2
} from "lucide-react";
import axios from "axios";

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
          
          const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          setIsWishlisted(savedWishlist.some((item) => item.id === productData.id));

          const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
          setIsAddedToCart(savedCart.some((item) => item.id === productData.id));
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
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = savedCart.findIndex((item) => item.id === product.id);

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-600" size={40} />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 font-serif italic text-2xl">Product not found.</div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 md:py-20 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="space-y-4">
          <div className="aspect-3/4 rounded-[2.5rem] overflow-hidden bg-[#F5F3FF] shadow-inner">
            <img
              src={product.image || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="border-b border-slate-100 pb-6 mb-6">
            <p className="text-purple-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
              {product.category}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif italic text-slate-900 mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-green-50 px-3 py-1 rounded-full text-green-700 text-xs font-bold border border-green-100">
                4.5 <Star size={12} className="fill-green-700 ml-1" />
              </div>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-widest border-l pl-4">
                1.2k Ratings
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ₹{Number(product.price).toLocaleString()}
              </span>
              <span className="text-slate-400 line-through text-lg">
                ₹{Number(product.price + 500).toLocaleString()}
              </span>
              <span className="text-orange-500 font-bold text-sm">(OFFER)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button 
              onClick={addToCart}
              className={`flex-2 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
                isAddedToCart 
                ? "bg-green-600 text-white shadow-green-100" 
                : "bg-slate-900 text-white hover:bg-purple-600 shadow-slate-200"
              }`}
            >
              {isAddedToCart ? (
                <><CheckCircle2 size={20} /> Added to Bag</>
              ) : (
                <><ShoppingCart size={20} /> Add to Cart</>
              )}
            </button>
            <button
              onClick={toggleWishlist}
              className={`flex-1 border-2 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white border-slate-200 text-slate-700 hover:border-purple-200 hover:text-purple-600"
              }`}
            >
              <Heart size={20} className={isWishlisted ? "fill-red-500" : ""} />
              Wishlist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Truck size={20} /></div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Fast Delivery</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><ShieldCheck size={20} /></div>
              <p className="text-[10px] font-bold uppercase text-slate-500">100% Original</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600"><RotateCcw size={20} /></div>
              <p className="text-[10px] font-bold uppercase text-slate-500">14 Days Return</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}