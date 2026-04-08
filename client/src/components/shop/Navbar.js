"use client";
import { useState, useEffect, useRef } from "react";
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
  Settings,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const { cartCount, wishlistCount, refreshData } = useCart();

  const checkAuth = () => {
    const token = Cookies.get("token");
    const userData = Cookies.get("user");

    setIsLoggedIn(!!token);

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        const role = user.role ? user.role.toLowerCase() : "";
        setIsAdmin(role === "admin");
      } catch (err) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    window.addEventListener("storage", () => {
      checkAuth();
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", () => checkAuth());
    };
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsProfileOpen(false);

    refreshData();

    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Collections", href: "/products" },
    { name: "Offers", href: "/offers" },
    { name: "My Orders", href: "/my-orders" },
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

          <div className="flex items-center gap-1 md:gap-4 relative">
            {isAdmin && (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#F5F3FF] text-[#4C1D95] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#8B5CF6] hover:text-white transition-all border border-[#8B5CF6]/20 active:scale-95"
              >
                <LayoutDashboard size={16} strokeWidth={2} />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
            )}

            <Link
              href="/wishlist"
              className={`p-2.5 transition-all duration-300 rounded-full border relative group active:scale-90  ${
                pathname === "/wishlist"
                  ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20"
                  : "bg-white border-[#F5F3FF] text-[#4C1D95]/70 hover:bg-[#8B5CF6] hover:border-[#8B5CF6] hover:text-white hover:shadow-lg hover:shadow-[#8B5CF6]/20 hover:-translate-y-0.5"
              }`}
            >
              <Heart
                size={20}
                strokeWidth={1.5}
                className={`transition-transform duration-300 group-hover:scale-110 ${pathname === "/wishlist" ? "fill-white" : "group-hover:fill-white"}`}
              />
              {wishlistCount > 0 && (
                <span
                  className={`absolute top-1 right-1 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${pathname === "/wishlist" ? "bg-white text-[#8B5CF6]" : "bg-red-500 text-white"}`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className={`p-2.5 transition-all duration-300 rounded-full border relative group active:scale-90  ${
                pathname === "/cart"
                  ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20"
                  : "bg-white border-[#F5F3FF] text-[#4C1D95]/70 hover:bg-[#8B5CF6] hover:border-[#8B5CF6] hover:text-white hover:shadow-lg hover:shadow-[#8B5CF6]/20 hover:-translate-y-0.5"
              }`}
            >
              <ShoppingBag
                size={20}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              {cartCount > 0 && (
                <span
                  className={`absolute top-1 right-1 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                    pathname === "/cart" || isProfileOpen
                      ? "bg-white text-[#8B5CF6]"
                      : "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20 group-hover:bg-white group-hover:text-[#8B5CF6]"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={` p-2.5 transition-all duration-300 rounded-full border group ${
                    isProfileOpen
                      ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20 scale-105"
                      : "bg-white border-[#F5F3FF] text-[#4C1D95]/70 hover:border-[#7C3AED]/30 hover:text-[#7C3AED] hover:bg-[#F5F3FF]/50 hover:-translate-y-0.5"
                  }`}
                >
                  <User
                    size={20}
                    strokeWidth={1.5}
                    className={`transition-transform duration-300 ${isProfileOpen ? "scale-110" : "group-hover:scale-110"}`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-[#F5F3FF] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2">
                      <Link
                        href="/shopProfile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#4C1D95] hover:bg-[#F5F3FF] rounded-2xl transition-all group"
                      >
                        <UserCircle
                          size={18}
                          className="text-[#A78BFA] group-hover:text-[#7C3AED]"
                        />
                        My Profile
                      </Link>
                      <Link
                        href="/shopSettings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#4C1D95] hover:bg-[#F5F3FF] rounded-2xl transition-all group"
                      >
                        <Settings
                          size={18}
                          className="text-[#A78BFA] group-hover:text-[#7C3AED]"
                        />
                        Settings
                      </Link>
                      <div className="h-px bg-[#F5F3FF] my-1 mx-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
                      >
                        <LogOut
                          size={18}
                          className="group-hover:-translate-x-1 transition-transform"
                        />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4C1D95] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7C3AED] hover:scale-105 transition-all shadow-lg shadow-[#4C1D95]/20"
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
        className={`fixed inset-0 z-[120] md:hidden transition-all duration-500 ${isOpen ? "visible" : "invisible"}`}
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
            {isAdmin && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 text-purple-700 mb-2 border border-purple-100"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={20} />
                  <span className="text-lg font-bold italic">Dashboard</span>
                </div>
                <ChevronRight size={18} />
              </Link>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isActive(link.href) ? "bg-[#F5F3FF] text-[#7C3AED]" : "text-[#4C1D95]"}`}
              >
                <span className="text-lg italic">{link.name}</span>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>

          <div className="p-8 border-t border-[#F5F3FF]">
            {isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-[#F5F3FF] text-[#4C1D95] py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <UserCircle size={14} /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
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
