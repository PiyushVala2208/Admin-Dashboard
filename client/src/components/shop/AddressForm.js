"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AddressForm({ onSubmit, onClose, initialData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    house_info: "",
    area_info: "",
    address_type: "Home",
    is_default: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || "",
        phone: initialData.phone || "",
        pincode: initialData.pincode || "",
        house_info: initialData.house_info || "",
        area_info: initialData.area_info || "",
        city: initialData.city || "",
        state: initialData.state || "",
        address_type: initialData.address_type || "Home",
        is_default: initialData.is_default || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone" || name === "pincode") {
      const onlyNums = value.replace(/[^0-9]/g, "");

      if (name === "phone" && onlyNums.length > 10) return;
      if (name === "pincode" && onlyNums.length > 6) return;

      setFormData((prev) => ({
        ...prev,
        [name]: onlyNums,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">
          {initialData ? "Edit" : "Add"} Address
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            placeholder="Receiver's Full Name"
            required
            onChange={handleChange}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none md:col-span-2"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            placeholder="Phone Number"
            required
            onChange={handleChange}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            placeholder="Pincode"
            required
            onChange={handleChange}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <input
            type="text"
            name="house_info"
            value={formData.house_info}
            placeholder="House No., Building Name"
            required
            onChange={handleChange}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none md:col-span-2"
          />
          <input
            type="text"
            name="area_info"
            value={formData.area_info}
            placeholder="Road Name, Area, Colony"
            required
            onChange={handleChange}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none md:col-span-2"
          />
          <input
            type="text"
            name="city"
            value={formData.city}
            placeholder="City"
            required
            onChange={handleChange}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <input
            type="text"
            name="state"
            value={formData.state}
            placeholder="State"
            required
            onChange={handleChange}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none"
          />

          <div className="md:col-span-2 flex items-center gap-4 py-2">
            <span className="text-sm font-bold text-slate-600">
              Address Type:
            </span>
            {["Home", "Work"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="address_type"
                  value={type}
                  checked={formData.address_type === type}
                  onChange={handleChange}
                  className="accent-purple-600"
                />
                <span className="text-sm font-medium">{type}</span>
              </label>
            ))}
          </div>

          <label className="md:col-span-2 flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-purple-600"
            />
            <span className="text-sm font-medium text-slate-500">
              Set as default address
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:col-span-2 bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-purple-600 transition-all mt-4 disabled:bg-slate-300"
          >
            {initialData ? "Update Address" : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}
