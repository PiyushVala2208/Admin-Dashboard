"use client";

import {
  Layers,
  Plus,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  ChevronRight,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function VariantSection({ variants, setVariants }) {
  const fileInputRefs = useRef({});
  const lastCardRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      lastCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  if (!mounted) return null;

  const uniqueColors = Array.from(
    new Set(variants.map((v) => v.color || "New Color")),
  );

  const updateVariant = (originalIndex, field, value) => {
    const updated = [...variants];
    updated[originalIndex][field] = value;
    setVariants(updated);
  };

  const handleColorRename = (oldName, newName) => {
    const updated = variants.map((v) =>
      v.color === oldName ? { ...v, color: newName } : v,
    );
    setVariants(updated);
  };

  const addColorGroup = () => {
    setVariants([
      ...variants,
      {
        color: `New Color ${variants.length + 1}`,
        size: "",
        price: "",
        stock: "",
        sku: "",
        image: "",
      },
    ]);
    scrollToBottom();
  };

  const addSizeToColor = (color) => {
    const existingWithImage = variants.find(
      (v) => v.color === color && v.image,
    );
    setVariants([
      ...variants,
      {
        color,
        size: "",
        price: "",
        stock: "",
        sku: "",
        image: existingWithImage ? existingWithImage.image : "",
      },
    ]);
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateVariant(index, "image", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-12 mt-12 max-w-[1200px] mx-auto pb-24 px-4 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Layers size={20} className="text-purple-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500/80">
              Inventory Master
            </span>
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">
            Product Variants
          </h3>
        </div>

        <button
          type="button"
          onClick={addColorGroup}
          className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} className="stroke-[3]" />
          <span>Add Color Group</span>
        </button>
      </div>

      <div className="space-y-16">
        {uniqueColors.map((colorName, idx) => {
          const colorGroup = variants.filter((v) => v.color === colorName);
          const firstImage = colorGroup.find((v) => v.image)?.image;

          return (
            <div
              key={`color-group-${idx}`}
              ref={idx === uniqueColors.length - 1 ? lastCardRef : null}
              className="relative bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-10 py-8 bg-slate-50/30 border-b border-slate-100">
                <div className="flex items-center gap-6 w-full">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-inner ring-1 ring-slate-100">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        className="w-full h-full object-cover rounded-xl"
                        alt="preview"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl">
                        <ImageIcon size={20} className="text-slate-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 w-full max-w-sm">
                    <input
                      className="bg-transparent font-black text-2xl text-slate-800 outline-none focus:text-purple-600 border-b-2 border-transparent focus:border-purple-200 transition-all"
                      value={colorName}
                      onChange={(e) =>
                        handleColorRename(colorName, e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      placeholder="Enter Color"
                    />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {colorGroup.length} Configurations
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-10 py-6 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-4 text-left">Size</th>
                      <th className="px-4 text-left">Price</th>
                      <th className="px-4 text-left">Stock</th>
                      <th className="px-4 text-left">SKU ID</th>
                      <th className="px-4 text-center">Visual</th>
                      <th className="px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colorGroup.map((v) => {
                      const originalIndex = variants.findIndex(
                        (ov) => ov === v,
                      );
                      return (
                        <tr
                          key={`variant-${originalIndex}`}
                          className="group/row"
                        >
                          <td className="py-2 px-2">
                            <input
                              className="w-20 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black focus:bg-white outline-none"
                              value={v.size}
                              onChange={(e) =>
                                updateVariant(
                                  originalIndex,
                                  "size",
                                  e.target.value,
                                )
                              }
                              placeholder="size"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              className="w-28 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-700 focus:bg-white outline-none"
                              value={v.price}
                              onChange={(e) =>
                                updateVariant(
                                  originalIndex,
                                  "price",
                                  e.target.value,
                                )
                              }
                              placeholder="price"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              className="w-24 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 focus:bg-white outline-none"
                              value={v.stock}
                              onChange={(e) =>
                                updateVariant(
                                  originalIndex,
                                  "stock",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              className="w-full max-w-45 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold text-slate-400 uppercase outline-none"
                              value={v.sku}
                              onChange={(e) =>
                                updateVariant(
                                  originalIndex,
                                  "sku",
                                  e.target.value,
                                )
                              }
                              placeholder="SKU code"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRefs.current[originalIndex].click()
                              }
                              className="w-12 h-12 rounded-xl border border-slate-200 bg-white inline-flex items-center justify-center hover:border-purple-400 overflow-hidden"
                            >
                              {v.image ? (
                                <img
                                  src={v.image}
                                  className="w-full h-full object-cover"
                                  alt="v"
                                />
                              ) : (
                                <UploadCloud
                                  size={18}
                                  className="text-slate-300"
                                />
                              )}
                            </button>
                            <input
                              type="file"
                              className="hidden"
                              ref={(el) =>
                                (fileInputRefs.current[originalIndex] = el)
                              }
                              onChange={(e) =>
                                handleImageChange(originalIndex, e)
                              }
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setVariants(
                                  variants.filter(
                                    (_, i) => i !== originalIndex,
                                  ),
                                )
                              }
                              className="p-3 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-10 py-5 bg-slate-50/20 border-t border-slate-50 flex justify-center">
                <button
                  type="button"
                  onClick={() => addSizeToColor(colorName)}
                  className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-purple-600 transition-all"
                >
                  <Plus size={14} className="stroke-3" />
                  Add another variation
                  <ChevronRight
                    size={12}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
