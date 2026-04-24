"use client";

import { useState, useRef, useEffect } from "react";
import { Package2, Sparkles, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import VariantManager, {
  createEmptyColorGroup,
} from "@/components/VariantManager";
import { useCategories } from "@/context/CategoryContext";

export default function AddItemPage() {
  const router = useRouter();
  const {
    loading,
    refreshCategories,
    getCategorySuggestions,
    findCategoryByName,
  } = useCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    categoryName: "",
    description: "",
  });

  const [variantGroups, setVariantGroups] = useState([createEmptyColorGroup()]);

  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollAnchorRef.current) {
        scrollAnchorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [variantGroups]);

  const trimmedCategoryName = formData.categoryName.trim();
  const categorySuggestions = getCategorySuggestions(
    formData.categoryName,
  ).slice(0, 6);

  const flatVariants = variantGroups.flatMap((group) =>
    group.sizes.map((sizeOption) => ({
      color: group.color.trim(),
      size: sizeOption.size.trim(),
      price: sizeOption.price,
      stock: sizeOption.stock,
      sku: sizeOption.sku.trim(),
      image: group.image.trim(),
    })),
  );

  const totalVariants = flatVariants.length;

  const handleFieldChange = (field, value) => {
    setFormError("");
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleCategoryPick = (value) => {
    handleFieldChange("categoryName", value);
    setShowSuggestions(false);
  };

  const validatePayload = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!trimmedCategoryName) {
      return "Category is required.";
    }

    for (const group of variantGroups) {
      if (!group.color.trim()) {
        return "Each color group needs a color name.";
      }

      for (const sizeOption of group.sizes) {
        if (!sizeOption.size.trim()) {
          return "Each size row must include a size.";
        }

        if (sizeOption.price === "" || sizeOption.stock === "") {
          return "Each size row must include price and stock.";
        }
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const validationMessage = validatePayload();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        category: trimmedCategoryName,
        description: formData.description.trim(),
        image:
          variantGroups.find((group) => group.image.trim())?.image.trim() ||
          null,
        hasVariants: totalVariants > 1,
        variantGroups: variantGroups.map((group) => ({
          color: group.color.trim(),
          image: group.image.trim() || null,
          sizes: group.sizes.map((sizeOption) => ({
            size: sizeOption.size.trim(),
            price: Number.parseFloat(sizeOption.price) || 0,
            stock: Number.parseInt(sizeOption.stock, 10) || 0,
            sku: sizeOption.sku.trim() || null,
          })),
        })),
      };

      await api.post("/inventory", payload);
      await refreshCategories();
      router.push("/inventory/all");
    } catch (error) {
      setFormError(
        error?.message ||
          error?.error ||
          "Unable to save this product right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] selection:bg-blue-100 px-4 py-8 md:px-6 md:py-10 lg:px-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-400 space-y-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 md:rounded-[2.5rem] shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-4xl space-y-3">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-100 bg-purple-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-purple-500">
                <Sparkles size={14} className="stroke-[2.5]" />
                Catalog Manager
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl lg:leading-tight">
                Add New Product
              </h2>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm">
              <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400 pb-5 border-b border-slate-100 mb-6">
                <Package2 size={15} />
                General Information
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 ml-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      handleFieldChange("name", event.target.value)
                    }
                    placeholder="enter product name..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 ml-1">
                    Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.categoryName}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        window.setTimeout(() => setShowSuggestions(false), 120);
                      }}
                      onChange={(event) =>
                        handleFieldChange("categoryName", event.target.value)
                      }
                      placeholder={
                        loading
                          ? "Loading categories..."
                          : "Type or search existing"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {showSuggestions && categorySuggestions.length > 0 ? (
                      <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5">
                        {categorySuggestions.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryPick(category.name)}
                            className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <span>{category.name}</span>
                            <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              Existing
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 ml-1">
                    Description
                  </label>
                  <textarea
                    rows={8}
                    value={formData.description}
                    onChange={(event) =>
                      handleFieldChange("description", event.target.value)
                    }
                    placeholder="enter product description..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 leading-relaxed"
                  />
                </div>
              </div>
            </section>
          </aside>

          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-2 sm:p-4 md:p-6 shadow-sm overflow-x-auto">
              <VariantManager
                variantGroups={variantGroups}
                setVariantGroups={setVariantGroups}
                productName={formData.name}
              />
              <div ref={scrollAnchorRef} />
            </div>

            {formError ? (
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800 shadow-sm">
                <AlertTriangle size={18} className="text-rose-500" />
                Error: {formError}
              </div>
            ) : null}

            <div className="flex justify-end pt-5 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex min-w-[240px] items-center justify-center gap-3.5 rounded-2xl bg-slate-950 px-8 py-4.5 text-base font-bold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-slate-300 active:scale-95 shadow-lg shadow-slate-950/10"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    Adding Product
                  </>
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
