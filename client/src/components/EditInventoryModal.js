"use client";
import { useState, useEffect } from "react";
import api from "@/app/utils/api";
import {
  Package,
  X,
  Tag,
  IndianRupee,
  Layers3,
  AlignLeft,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";

const CATEGORIES = ["Electronics", "Accessories", "Furniture", "Clothing"];

export default function EditInventoryModal({
  isOpen,
  onClose,
  item,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: 0,
    price: 0,
    description: "",
    status: "In Stock",
    image: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "",
        stock: item.stock || 0,
        price: item.price || 0,
        description: item.description || "",
        status: item.status || "In Stock",
        image: item.image || item.image_url || "",
      });
    }
  }, [item]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        description: formData.description,
        status: formData.status,
        image: formData.image,
      };

      await api.put(`/inventory/${item.id}`, updatedData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Edit failed!!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999 p-4 ">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Edit Item Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 transition p-1 hover:bg-slate-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 no-scrollbar touch-pan-y">
          <form
            id="edit-inventory-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                <Package size={14} className="text-purple-600" /> Item Name
              </label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                <ImageIcon size={14} className="text-purple-600" /> Image URL
              </label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                  <Tag size={14} className="text-purple-600" /> Category
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                  <IndianRupee size={14} className="text-purple-600" /> Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                  <Layers3 size={14} className="text-purple-600" /> Stock
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                  Status
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                <AlignLeft size={14} className="text-purple-600" /> Description
              </label>
              <textarea
                rows="3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition resize-none"
                placeholder="Item details..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition font-medium"
          >
            Cancel
          </button>
          <button
            form="edit-inventory-form"
            type="submit"
            className="flex-1 order-1 sm:order-2 px-4 py-3 bg-slate-900 text-white hover:bg-black rounded-xl transition font-medium shadow-lg shadow-slate-200 active:scale-95 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
