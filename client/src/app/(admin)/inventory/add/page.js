"use client";
import {
  PackagePlus,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import api from "@/app/utils/api";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Electronics", "Accessories", "Furniture", "Clothing"];

export default function AddItemPage() {
  const router = useRouter();

  const initialState = {
    name: "",
    category: "",
    stock: "",
    price: "",
    description: "",
    status: "In Stock",
    imageUrl: "",
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

    if (!CATEGORIES.includes(formData.category)) {
      alert("Please select a valid category");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/inventory", {
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        description: formData.description,
        image: formData.imageUrl,
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
        </div>
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Product Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-slate-700 mb-2 self-start">
                Preview
              </span>
              <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "";
                      alert("Invalid Image URL");
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon size={24} />
                    <span className="text-[10px] mt-1">No Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

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
            <div className="relative">
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
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
                Price
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
              rows="3"
              required
              value={formData.description}
              placeholder="Detailed description..."
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setFormData(initialState)}
              className="order-2 sm:order-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all font-medium text-sm"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold text-sm shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70"
            >
              {isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <CheckCircle2 size={18} /> Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
