"use client";
import { PackagePlus, RotateCcw, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import api from "@/app/utils/api";
import { useRouter } from "next/navigation";

export default function AddItemPage() {
  const router = useRouter();

  const initialState = {
    name: "",
    category: "",
    stock: "",
    price: "",
    description: "",
    status: "In Stock",
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/inventory", {
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        description: formData.description,
      });

      alert("Item Added Successfully!!");
      setFormData(initialState);
      router.push("/inventory/all");
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item. Check server logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl">
          <PackagePlus size={28} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Add New Item
          </h1>
          <p className="text-sm text-slate-500">
            Create a new entry in your inventory system
          </p>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-2 block group-focus-within:text-blue-600 transition-colors">
              Item Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Wireless Mouse"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-2 block group-focus-within:text-blue-600 transition-colors">
              Category
            </label>
            <input
              type="text"
              name="category"
              required
              placeholder="e.g. Electronics"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Initial Stock
              </label>
              <input
                type="number"
                name="stock"
                required
                value={formData.stock}
                placeholder="0"
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                placeholder="0.00"
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-2 block group-focus-within:text-blue-600 transition-colors">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              required
              value={formData.description}
              placeholder="Enter detailed description of the item..."
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setFormData(initialState)}
              className="order-2 sm:order-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all font-medium text-sm active:scale-95"
            >
              <RotateCcw size={16} />
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold text-sm shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
