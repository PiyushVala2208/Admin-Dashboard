"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/app/utils/api";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/";

  const syncGuestData = async (userToken) => {
    try {
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      const guestWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      if (guestCart.length > 0 || guestWishlist.length > 0) {
        await api.post(
          "/auth/merge",
          { cart: guestCart, wishlist: guestWishlist },
          { headers: { Authorization: `Bearer ${userToken}` } },
        );
        console.log("Guest data synced successfully!");

        localStorage.removeItem("cart");
      }
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;
      const user = res.data.user;

      Cookies.set("token", token, { expires: 7, path: "/" });
      Cookies.set("user", JSON.stringify(user), { expires: 7, path: "/" });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      await syncGuestData(token);

      const userRole = user.role.toLowerCase();

      if (userRole === "admin") {
        router.replace("/");
      } else {
        router.push(redirectTo); 
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || "Email or Password incorrect!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="max-w-md w-full space-y-8 p-10 bg-slate-50 shadow-xl rounded-[2.5rem] border border-slate-200/50">
        <div className="text-center">
          <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4">
            <h1 className="text-3xl font-black text-blue-600 tracking-tight italic">
              D.SHOP
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-2">
            Sign in to continue your shopping journey.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email..."
                className="mt-1 block w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter your password"
                className="mt-1 block w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-slate-500 font-medium">
            New here?
            <Link
              href="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
