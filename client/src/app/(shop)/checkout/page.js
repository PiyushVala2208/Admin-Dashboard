"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (savedCart.length === 0) {
      router.push("/");
    }
    setCartItems(savedCart);
  }, [router]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to place an order");
        router.push("/login");
        return;
      }

      const orderData = {
        cartItems: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image || item.image_url,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          pincode: formData.zipCode,
          phone: formData.phone,
        },
        totalAmount: total,
        paymentMethod: formData.paymentMethod.toUpperCase(),
      };

      const response = await axios.post(
        "http://localhost:8000/api/orders/place",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success("Order placed successfully! 🎉");

        localStorage.removeItem("cart");
        setCartItems([]);
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          router.push("/my-orders");
        }, 1500);
      }
    } catch (error) {
      console.error("Order Error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Order failed! Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] py-12 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <Link
              href="/cart"
              className="flex items-center gap-2 text-slate-400 hover:text-purple-600 transition-colors mb-4 group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-xs font-bold uppercase tracking-widest">
                Back to Cart
              </span>
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Checkout
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-purple-600">
              <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-sm">
                1
              </span>
              <span className="text-sm font-bold">Cart</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
            <div className="flex items-center gap-2 text-purple-600">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-200">
                2
              </span>
              <span className="text-sm font-bold">Shipping</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Shipping Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  required
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  required
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all md:col-span-2"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all md:col-span-2"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  required
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all md:col-span-2"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all"
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP / Postal Code"
                  required
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all"
                />
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                  <CreditCard size={20} />
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                <label
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === "cod" ? "border-purple-600 bg-purple-50/30" : "border-slate-100"}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="accent-purple-600 w-4 h-4"
                    />

                    <div>
                      <p className="font-bold text-slate-900">
                        Cash on Delivery
                      </p>

                      <p className="text-xs text-slate-500">
                        Pay when you receive the package
                      </p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-50 opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <input type="radio" disabled className="w-4 h-4" />

                    <div>
                      <p className="font-bold text-slate-900">
                        Online Payment (UPI / Cards)
                      </p>

                      <p className="text-xs text-red-400 uppercase font-bold tracking-tighter">
                        Coming Soon
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:bg-purple-600 transition-all shadow-xl shadow-purple-200/20 active:scale-[0.98] disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : `Complete Order • ₹${total.toLocaleString()}`}
            </button>
          </form>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 sticky top-10">
              <h3 className="text-lg font-black text-slate-900 mb-6">
                Order Summary
              </h3>

              <div className="max-h-[300px] overflow-y-auto mb-8 pr-2 space-y-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      <img
                        src={item.image || item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Shipping Fee</span>
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Payable
                  </span>
                  <span className="text-3xl font-black text-purple-600">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="text-green-500 shrink-0" size={20} />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Your transaction is encrypted and secure. By placing an order,
                  you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
