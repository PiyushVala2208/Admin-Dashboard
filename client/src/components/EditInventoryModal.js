"use client";
import { useState, useEffect } from "react";
import api from "@/app/utils/api";
import {
  X,
  ChevronDown,
  Plus,
  Trash2,
  Link as LinkIcon,
  IndianRupee,
  Image as ImageIcon,
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
    description: "",
    image: "",
    base_price: "",
  });

  const [variants, setVariants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      const priceValue = item.base_price ?? item.basePrice ?? item.price ?? "";

      setFormData({
        name: item.name || "",
        category: item.category || "",
        description: item.description || "",
        image: item.image || "",
        base_price: priceValue,
      });

      if (
        item.variants &&
        Array.isArray(item.variants) &&
        item.variants.length > 0
      ) {
        const mappedVariants = item.variants.map((v) => ({
          id: v.id || null,
          size: v.size || "",
          color: v.color || "",
          price: v.variant_price ?? v.variantPrice ?? v.price ?? "",
          stock: v.variant_stock ?? v.stock ?? 0,
          sku: v.sku || "",
          image: v.variant_image || v.image || "",
        }));
        setVariants(mappedVariants);
      } else {
        setVariants([
          { size: "", color: "", price: "", stock: "", sku: "", image: "" },
        ]);
      }
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleVariantChange = (index, e) => {
    const updatedVariants = [...variants];
    updatedVariants[index][e.target.name] = e.target.value;
    setVariants(updatedVariants);
  };

  const addVariantRow = () => {
    setVariants([
      ...variants,
      { size: "", color: "", price: "", stock: "", sku: "", image: "" },
    ]);
  };

  const removeVariantRow = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        image: formData.image,
        base_price:
          formData.base_price === "" ? 0 : parseFloat(formData.base_price) || 0,
        variants: variants.map((v) => ({
          id: v.id || null,
          size: v.size || "",
          color: v.color || "",
          sku: v.sku || "",
          variant_price: v.price === "" ? 0 : parseFloat(v.price) || 0,
          variant_stock: v.stock === "" ? 0 : parseInt(v.stock) || 0,
          variant_image: v.image || "",
        })),
      };

      const response = await api.put(`/inventory/${item.id}`, updatedData);

      if (response.status >= 200 && response.status < 300) {
        const freshResponse = await api.get(`/inventory/${item.id}`);

        if (onUpdate && freshResponse.data) {
          const sanitizedData = {
            ...freshResponse.data,
            base_price: freshResponse.data.base_price ?? 0,
            variants: freshResponse.data.variants || [],
          };
          onUpdate(sanitizedData);
        }
        onClose();
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999 p-4 ">
      <div className="bg-white rounded-4xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-8 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Edit Product
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Update item info and variants
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-xl"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-8 no-scrollbar">
          <form
            id="edit-inventory-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block group-focus-within:text-purple-600 transition-colors">
                  Item Name
                </label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-500 transition-all font-medium"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-500 transition-all appearance-none cursor-pointer font-medium"
                      value={formData.category || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Base Price
                  </label>
                  <div className="relative">
                    <IndianRupee
                      size={16}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      step="any"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-800 focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-500 transition-all font-medium"
                      value={formData.base_price || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, base_price: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900">
                  Product Variants
                </h3>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
                >
                  <Plus size={14} /> Add New Variant
                </button>
              </div>

              <div className="space-y-6">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm relative group/var"
                  >
                    <button
                      type="button"
                      onClick={() => removeVariantRow(index)}
                      className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50 transition-all border border-slate-100 opacity-0 group-hover/var:opacity-100 z-10"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="flex-1 w-full">
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block tracking-widest">
                            Variant Image URL
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <LinkIcon size={14} className="text-slate-400" />
                            </div>
                            <input
                              type="text"
                              name="image"
                              placeholder="Variant image URL"
                              value={variant.image || ""}
                              onChange={(e) => handleVariantChange(index, e)}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            />
                          </div>
                        </div>

                        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 mb-0.5">
                          {variant.image ? (
                            <img
                              src={variant.image}
                              className="w-full h-full object-cover"
                              alt="Preview"
                              onError={(e) => {
                                e.target.src = "";
                              }}
                            />
                          ) : (
                            <ImageIcon size={18} className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      <input
                        type="text"
                        name="size"
                        placeholder="Size (S, M)"
                        value={variant.size || ""}
                        onChange={(e) => handleVariantChange(index, e)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none placeholder:text-slate-300"
                      />
                      <input
                        type="text"
                        name="color"
                        placeholder="Color"
                        value={variant.color || ""}
                        onChange={(e) => handleVariantChange(index, e)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none placeholder:text-slate-300"
                      />
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={variant.price || ""}
                        onChange={(e) => handleVariantChange(index, e)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none placeholder:text-slate-300"
                      />
                      <input
                        type="number"
                        name="stock"
                        placeholder="Stock"
                        value={variant.stock || ""}
                        onChange={(e) => handleVariantChange(index, e)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none placeholder:text-slate-300"
                      />
                      <input
                        type="text"
                        name="sku"
                        placeholder="SKU Code"
                        value={variant.sku || ""}
                        onChange={(e) => handleVariantChange(index, e)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Description
              </label>
              <textarea
                rows="3"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-500 transition-all resize-none font-medium"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 p-8 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 px-8 py-4 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all font-bold text-sm"
          >
            Discard Changes
          </button>
          <button
            form="edit-inventory-form"
            type="submit"
            disabled={isSubmitting}
            className="flex-1 order-1 sm:order-2 px-8 py-4 bg-slate-900 text-white hover:bg-black rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
