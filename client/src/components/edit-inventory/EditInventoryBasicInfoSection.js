"use client";

import { memo } from "react";
import { Package } from "lucide-react";

// Props: { formData, categories, categoriesLoading, onFieldChange, onCategoryInputChange }
function EditInventoryBasicInfoSection({
  formData,
  categories,
  categoriesLoading,
  onFieldChange,
  onCategoryInputChange,
}) {
  return (
    <section className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 md:space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Package size={18} className="text-blue-500" />
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
            value={formData.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="Product name"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700 shadow-sm placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">
            Category
          </label>
          <input
            list="edit-category-list"
            value={formData.categoryInput}
            onChange={(event) => onCategoryInputChange(event.target.value)}
            disabled={categoriesLoading}
            placeholder={
              categoriesLoading
                ? "Loading categories..."
                : "Type or select category"
            }
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700 shadow-sm disabled:opacity-70"
          />
          <datalist id="edit-category-list">
            {categories.map((category) => (
              <option key={category.id} value={category.name} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">
          Description
        </label>
        <textarea
          rows={4}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-slate-900 focus:bg-white transition-all resize-none text-slate-700 font-medium"
          value={formData.description}
          onChange={(event) => onFieldChange("description", event.target.value)}
          placeholder="Write detailed product story here..."
        />
      </div>
    </section>
  );
}

export default memo(EditInventoryBasicInfoSection);
