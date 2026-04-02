"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ShoppingBag,
  User,
  Menu,
  Heart,
  X,
  ChevronRight,
  LogOut,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const checkAuth = () => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
  };

  const updateCartCount = () => {
    if (typeof window !== "undefined") {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = savedCart.reduce(
        (acc, item) => acc + (item.quantity || 0),
        0,
      );
      setCartCount(total);
    }
  };

  useEffect(() => {
    updateCartCount();
    checkAuth();

    window.addEventListener("storage", () => {
      updateCartCount();
      checkAuth();
    });

    window.addEventListener("cartUpdate", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdate", updateCartCount);
    };
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Collections", href: "/products" },
    { name: "Offers", href: "/offers" },
    { name: "Track Order", href: "/track-order" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-100 w-full bg-white/90 backdrop-blur-xl border-b border-[#F5F3FF] px-4 md:px-10 py-4">
        <div className="max-w-350 mx-auto flex items-center justify-between relative">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-serif italic tracking-tighter text-[#4C1D95] shrink-0"
          >
            D<span className="text-[#8B5CF6]">.</span>SHOP
          </Link>

          <div className="hidden md:flex items-center gap-10 font-bold uppercase text-[10px] tracking-[0.2em] text-[#4C1D95]/70">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-300 relative group ${isActive(link.href) ? "text-[#7C3AED]" : "hover:text-[#7C3AED]"}`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#7C3AED] transition-all duration-300 ${isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"}`}
                ></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 md:gap-6 relative z-110">
            <Link
              href="/wishlist"
              className="p-2 text-[#4C1D95]/70 hover:text-[#A78BFA] transition-all active:scale-90"
            >
              <Heart size={20} strokeWidth={1.5} />
            </Link>

            <Link
              href="/cart"
              className="p-2 text-[#4C1D95] hover:text-[#7C3AED] transition-all relative active:scale-90"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#7C3AED] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="p-2 text-[#4C1D95]/70 border border-[#F5F3FF] rounded-full bg-white shadow-sm hover:text-[#7C3AED]"
                >
                  <User size={18} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-[#F5F3FF] text-[#4C1D95] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7C3AED] hover:text-white transition-all"
              >
                <LogIn size={14} /> Login
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-[#4C1D95] hover:bg-[#F5F3FF] rounded-xl transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-120 md:hidden transition-all duration-500 ${isOpen ? "visible" : "invisible"}`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-500 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="pt-24 px-8 pb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A78BFA]">
              Menu
            </p>
            <h2 className="text-2xl font-serif italic text-[#4C1D95]">
              Explore Boutique
            </h2>
          </div>

          <div className="flex-1 px-4 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isActive(link.href) ? "bg-[#F5F3FF] text-[#7C3AED]" : "text-[#4C1D95]"}`}
              >
                <span className="text-lg italic">{link.name}</span>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>

          <div className="p-8">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg"
              >
                <LogOut size={14} /> Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full bg-[#4C1D95] text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-[#4C1D95]/20"
              >
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
