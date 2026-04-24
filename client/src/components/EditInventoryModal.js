"use client";
import { useState, useEffect } from "react";
import api from "@/app/utils/api";
import { X, Package, CheckCircle2, AlertCircle } from "lucide-react";
import BasicInfoSection from "./EditInventoryBasicInfo";
import VariantSection from "./EditInventoryVariantCard";

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
    base_stock: "",
  });
  const [variants, setVariants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || "",
        category: item.category || "",
        description: item.description || "",
        image: item.image || "",
        base_price: item.base_price || item.price || "",
        base_stock: item.stock || 0,
      });

      const initialVariants =
        item.variants?.map((v) => ({
          id: v.id || null,
          size: v.size || "",
          color: v.color || "",
          price: v.variant_price ?? v.price ?? "",
          stock: v.variant_stock ?? v.stock ?? 0,
          sku: v.sku || "",
          image: v.variant_image ?? v.image ?? "",
        })) || [];

      setVariants(initialVariants);
    }
  }, [item, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalStock =
        variants.length > 0
          ? variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
          : parseInt(formData.base_stock) || 0;

      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        image: formData.image,
        base_price:
          variants.length > 0
            ? parseFloat(variants[0].price)
            : parseFloat(formData.base_price),
        stock: totalStock,
        variants: variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          size: String(v.size),
          color: String(v.color),
          variant_price: parseFloat(v.price) || 0,
          variant_stock: parseInt(v.stock) || 0,
          sku: v.sku,
          variant_image: v.image,
        })),
      };

      const response = await api.put(`/inventory/${item.id}`, payload);

      if (response.status === 200) {
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999 p-2 md:p-6">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/20 flex flex-col max-h-[98vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-6 md:px-10 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-200">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Edit Master Product
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Inventory Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group bg-slate-50 hover:bg-red-50 p-3 rounded-2xl transition-all border border-slate-100"
          >
            <X
              size={20}
              className="text-slate-400 group-hover:text-red-500 transition-colors"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-thin scrollbar-thumb-slate-200">
          <form
            id="luxury-edit-form"
            onSubmit={handleSubmit}
            className="space-y-10"
          >
            <section>
              <BasicInfoSection
                formData={formData}
                setFormData={setFormData}
                hasVariants={variants.length > 0}
              />
            </section>

            <section>
              <VariantSection variants={variants} setVariants={setVariants} />
            </section>

            <section className="bg-white p-6 rounded-4xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-slate-900" />
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                  Final Touchpoints
                </h4>
              </div>
              <textarea
                rows="4"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-slate-900 focus:bg-white transition-all resize-none text-slate-700 font-medium"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Write detailed product story here..."
              />
            </section>
          </form>
        </div>

        <div className="p-6 md:px-10 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 text-slate-600 font-bold hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200 active:scale-95"
          >
            Discard Changes
          </button>
          <button
            form="luxury-edit-form"
            disabled={isSubmitting}
            className="flex-2 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Apply & Sync All Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
