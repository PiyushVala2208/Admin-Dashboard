"use client";

import { memo } from "react";
import { Package2 } from "lucide-react";

// Props: { formData, loading, categories, filteredCategorySuggestions, exactCategoryMatch, onFieldChange, onCategoryInputChange, onChooseSuggestion }
function ProductBasicInfo({
  formData,
  loading,
  categories,
  filteredCategorySuggestions,
  exactCategoryMatch,
  onFieldChange,
  onCategoryInputChange,
  onChooseSuggestion,
}) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
      <div className="mb-6 flex items-center gap-2.5 border-b border-slate-100 pb-5 text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">
        <Package2 size={15} />
        Step 1 - General Information
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Product Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="Enter product name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Category
          </label>
          <input
            type="text"
            list="categories-list"
            value={formData.categoryInput}
            onChange={(event) => onCategoryInputChange(event.target.value)}
            disabled={loading}
            placeholder={
              loading
                ? "Loading categories..."
                : "Type to search and select category"
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <datalist id="categories-list">
            {categories.map((category) => (
              <option key={category.id} value={category.name} />
            ))}
          </datalist>

          {filteredCategorySuggestions.length > 0 && !exactCategoryMatch ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {filteredCategorySuggestions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onChooseSuggestion(category)}
                  className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-[#8b3dff]"
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}
          <p className="text-[11px] font-semibold text-slate-500">
            Select an existing category. New categories are managed from Catalog.
          </p>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Description
          </label>
          <textarea
            rows={8}
            value={formData.description}
            onChange={(event) =>
              onFieldChange("description", event.target.value)
            }
            placeholder="Enter product description"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100 leading-relaxed"
          />
        </div>
      </div>
    </section>
  );
}

export default memo(ProductBasicInfo);
