"use client";

import Image from "next/image";
import {
  Boxes,
  Image as ImageIcon,
  Palette,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";

export const createEmptySizeOption = () => ({
  size: "",
  price: "",
  stock: "",
  sku: "",
});

export const createEmptyColorGroup = () => ({
  color: "",
  image: "",
  sizes: [createEmptySizeOption()],
});

export default function VariantManager({
  variantGroups,
  setVariantGroups,
  productName,
}) {
  const updateColorGroup = (groupIndex, field, value) => {
    setVariantGroups((current) =>
      current.map((group, index) =>
        index === groupIndex ? { ...group, [field]: value } : group,
      ),
    );
  };

  const updateSizeOption = (groupIndex, sizeIndex, field, value) => {
    setVariantGroups((current) =>
      current.map((group, index) => {
        if (index !== groupIndex) return group;

        return {
          ...group,
          sizes: group.sizes.map((sizeOption, innerIndex) =>
            innerIndex === sizeIndex
              ? { ...sizeOption, [field]: value }
              : sizeOption,
          ),
        };
      }),
    );
  };

  const addColorGroup = () => {
    setVariantGroups((current) => [...current, createEmptyColorGroup()]);
  };

  const removeColorGroup = (groupIndex) => {
    setVariantGroups((current) => {
      if (current.length === 1) return current;
      return current.filter((_, index) => index !== groupIndex);
    });
  };

  const addSizeOption = (groupIndex) => {
    setVariantGroups((current) =>
      current.map((group, index) =>
        index === groupIndex
          ? { ...group, sizes: [...group.sizes, createEmptySizeOption()] }
          : group,
      ),
    );
  };

  const removeSizeOption = (groupIndex, sizeIndex) => {
    setVariantGroups((current) =>
      current.map((group, index) => {
        if (index !== groupIndex || group.sizes.length === 1) {
          return group;
        }

        return {
          ...group,
          sizes: group.sizes.filter(
            (_, innerIndex) => innerIndex !== sizeIndex,
          ),
        };
      }),
    );
  };

  const handleImageUpload = (groupIndex, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateColorGroup(groupIndex, "image", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const autoFillSkus = (groupIndex) => {
    const safeProduct = productName.trim().toUpperCase().replace(/\s+/g, "-");
    setVariantGroups((current) =>
      current.map((group, index) => {
        if (index !== groupIndex) return group;
        const safeColor = group.color.trim().toUpperCase().replace(/\s+/g, "-");
        return {
          ...group,
          sizes: group.sizes.map((sizeOption, sizeIndex) => {
            if (sizeOption.sku.trim()) return sizeOption;
            const safeSize = sizeOption.size
              .trim()
              .toUpperCase()
              .replace(/\s+/g, "-");
            return {
              ...sizeOption,
              sku: [safeProduct, safeColor, safeSize || `S${sizeIndex + 1}`]
                .filter(Boolean)
                .join("-"),
            };
          }),
        };
      }),
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg">
            <Boxes size={24} />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-slate-950">
              Variant Matrix
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              Manage colors & inventory cards
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addColorGroup}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-6 py-3.5 text-sm font-black text-white transition hover:bg-purple-600 active:scale-95 shadow-lg shadow-purple-100"
        >
          <Plus size={18} strokeWidth={3} />
          ADD VARIANTS
        </button>
      </div>

      <div className="space-y-10">
        {variantGroups.map((group, groupIndex) => (
          <article
            key={`color-group-${groupIndex}`}
            className="overflow-hidden rounded-[3rem] border border-slate-200 bg-white shadow-sm transition-all"
          >
            <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-400 shadow-sm">
                    {groupIndex + 1}
                  </span>
                  <h4 className="text-xl font-black text-slate-950 tracking-tight">
                    {group.color.trim() || "Define Color"}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => autoFillSkus(groupIndex)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50"
                  >
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    Auto SKU
                  </button>
                  <button
                    type="button"
                    onClick={() => removeColorGroup(groupIndex)}
                    disabled={variantGroups.length === 1}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-20"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-10 p-8 lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col gap-6">
                <div className="group relative aspect-square w-full max-w-50 overflow-hidden rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-blue-300 mx-auto lg:mx-0">
                  {group.image ? (
                    <Image
                      src={group.image}
                      alt={group.color}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                      <ImageIcon size={40} strokeWidth={1} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Add Photo
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(event) =>
                      handleImageUpload(groupIndex, event.target.files?.[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                    <Palette size={12} /> Color Name
                  </label>
                  <input
                    type="text"
                    value={group.color}
                    onChange={(e) =>
                      updateColorGroup(groupIndex, "color", e.target.value)
                    }
                    placeholder="enter color"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Inventory Units
                  </h5>
                  <button
                    type="button"
                    onClick={() => addSizeOption(groupIndex)}
                    className="text-[11px] font-black text-purple-600 uppercase tracking-widest hover:text-purple-700 bg-purple-100 rounded-xl px-4 py-2 transition-all  active:scale-95 shadow-sm shadow-purple-200"
                  >
                    Add Size Card
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {group.sizes.map((sizeOption, sizeIndex) => (
                    <div
                      key={`size-${groupIndex}-${sizeIndex}`}
                      className="relative p-6 rounded-4xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                      <button
                        type="button"
                        onClick={() => removeSizeOption(groupIndex, sizeIndex)}
                        disabled={group.sizes.length === 1}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white text-slate-300 hover:text-rose-500 hover:shadow-md transition-all disabled:hidden"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Size
                          </label>
                          <input
                            type="text"
                            value={sizeOption.size}
                            placeholder="enter size"
                            onChange={(e) =>
                              updateSizeOption(
                                groupIndex,
                                sizeIndex,
                                "size",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={sizeOption.price}
                            placeholder="enter price"
                            onChange={(e) =>
                              updateSizeOption(
                                groupIndex,
                                sizeIndex,
                                "price",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={sizeOption.stock}
                            placeholder="enter stock"
                            onChange={(e) =>
                              updateSizeOption(
                                groupIndex,
                                sizeIndex,
                                "stock",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={sizeOption.sku}
                            placeholder="enter SKU code"
                            onChange={(e) =>
                              updateSizeOption(
                                groupIndex,
                                sizeIndex,
                                "sku",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase text-slate-700 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
