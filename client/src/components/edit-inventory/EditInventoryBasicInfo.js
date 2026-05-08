"use client";

import { Info } from "lucide-react";

export default function BasicInfoSection({
  formData,
  setFormData,
  hasVariants,
  categories,
}) {
  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 md:space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Info size={18} className="text-blue-500" />
        </div>
        <span className="text-lg font-black text-slate-800 tracking-tight">
          Basic Information
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">
            Product Name
          </label>
          <input
            placeholder="product name"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700 shadow-sm placeholder:text-slate-300"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">
            Category
          </label>
          <input
            list="category-list"
            placeholder="Type or select category"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700 shadow-sm"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />
          <datalist id="category-list">
            {categories &&
              categories.map((c, index) => (
                <option key={index} value={c.name || c} />
              ))}
          </datalist>
        </div>
      </div>

      {!hasVariants && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-6 border-t border-slate-50">
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">
              Base Price
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                placeholder="price"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-5 py-4 outline-none focus:border-blue-400 font-black text-slate-800"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({ ...formData, base_price: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">
              Stock Units
            </label>
            <input
              type="number"
              placeholder="stock quantity"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 font-black text-slate-800"
              value={formData.base_stock}
              onChange={(e) =>
                setFormData({ ...formData, base_stock: e.target.value })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
