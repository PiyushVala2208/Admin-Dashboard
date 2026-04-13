"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import AddressSection from "@/components/shop/AddressSection";
import AddressForm from "@/components/shop/AddressForm";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (savedCart.length === 0) {
      router.push("/cart");
      return;
    }
    setCartItems(savedCart);
    fetchAddresses();
  }, [router]);

  const fetchAddresses = async () => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.get("http://localhost:8000/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (data.success) {
        setAddresses(data.data);
        const defaultAddr = data.data.find((a) => a.is_default) || data.data[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Fetch Address Error:", error);
    }
  };

  const handleAddNewAddress = async (newAddressData) => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        "http://localhost:8000/api/addresses",
        newAddressData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );
      if (data.success) {
        toast.success("Address added!");
        setShowAddressForm(false);
        fetchAddresses();
      }
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = Cookies.get("token");
      await axios.delete(`http://localhost:8000/api/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Address removed");
      fetchAddresses();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleSaveAddress = async (formData) => {
    try {
      const token = Cookies.get("token");
      const url = "http://localhost:8000/api/addresses";

      const response = editingAddress
        ? await axios.put(`${url}/${editingAddress.id}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        : await axios.post(url, formData, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

      if (response.data.success) {
        toast.success(editingAddress ? "Address updated!" : "Address added!");
        setShowAddressForm(false);
        setEditingAddress(null);
        fetchAddresses();
      }
    } catch (error) {
      toast.error("Save failed");
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!selectedAddress) {
      return toast.error("Please select a shipping address");
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const orderData = {
        cartItems: cartItems.map((item) => ({
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.image_url,
        })),
        shippingAddress: {
          fullName: selectedAddress.full_name,
          address: `${selectedAddress.house_info}, ${selectedAddress.area_info}`,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
          phone: selectedAddress.phone,
        },
        totalAmount: total,
        paymentMethod: paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
      };

      const response = await axios.post(
        "http://localhost:8000/api/orders/place",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success("Order Placed! 🥂");
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));
        router.replace("/my-orders");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] py-12 px-4 md:px-10">
      {showAddressForm && (
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleSaveAddress}
          onClose={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
        />
      )}

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
          <div className="lg:col-span-7 space-y-8">
            <AddressSection
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelect={setSelectedAddress}
              onAddNew={() => {
                setEditingAddress(null);
                setShowAddressForm(true);
              }}
              onEdit={(addr) => {
                setEditingAddress(addr);
                setShowAddressForm(true);
              }}
              onDelete={handleDeleteAddress}
            />

            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Payment Method
              </h2>
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-purple-600 bg-purple-50/30" : "border-slate-100"}`}
              >
                <p className="font-bold text-slate-900">Cash on Delivery</p>
                <p className="text-xs text-slate-500">
                  Pay when you receive the package
                </p>
              </div>
            </section>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:bg-purple-600 transition-all shadow-xl shadow-purple-200/20 active:scale-[0.98] disabled:bg-slate-300"
            >
              {loading
                ? "Processing..."
                : `Complete Order • ₹${total.toLocaleString()}`}
            </button>
          </div>

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
                  Your transaction is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
