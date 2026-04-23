"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/utils/api";
import {
  ArrowLeft,
  IndianRupee,
  Layers,
  History,
  Loader2,
  Package,
  Trash2,
} from "lucide-react";
import EditInventoryModal from "@/components/EditInventoryModal";

export default function ItemInfoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const res = await api.get(`/inventory/${id}`);
        setItem(res.data);

        if (res.data.has_variants && res.data.variants?.length > 0) {
          const defaultVar =
            res.data.variants.find((v) => v.is_default) || res.data.variants[0];
          setSelectedColor(defaultVar.color);
          setSelectedVariant(defaultVar);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const uniqueColors = useMemo(() => {
    if (!item?.variants) return [];
    return [...new Set(item.variants.map((v) => v.color))];
  }, [item?.variants]);

  const availableSizes = useMemo(() => {
    if (!item?.variants || !selectedColor) return [];
    return item.variants.filter((v) => v.color === selectedColor);
  }, [item?.variants, selectedColor]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const firstAvailable = item.variants.find((v) => v.color === color);
    setSelectedVariant(firstAvailable);
  };

  const handleDeleteVariant = async () => {
    if (!selectedVariant) return;
    if (
      !confirm(
        `Delete variant: "${selectedVariant.color} - ${selectedVariant.size}"?`,
      )
    )
      return;

    setIsDeletingVariant(true);
    try {
      await api.delete(`/inventory/variant/${selectedVariant.id}`);
      const updatedVariants = item.variants.filter(
        (v) => v.id !== selectedVariant.id,
      );

      if (updatedVariants.length === 0) {
        setItem({ ...item, variants: [], has_variants: false });
        setSelectedVariant(null);
      } else {
        setItem({ ...item, variants: updatedVariants });
        const nextVar =
          updatedVariants.find((v) => v.color === selectedColor) ||
          updatedVariants[0];
        setSelectedColor(nextVar.color);
        setSelectedVariant(nextVar);
      }
    } catch (err) {
      alert("Failed to delete variant.");
    } finally {
      setIsDeletingVariant(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
      </div>
    );

  if (!item) return <div>Product not found</div>;

  const defaultVariant =
    item.variants?.find((variant) => variant.is_default) ||
    item.variants?.[0] ||
    null;
    
  const activeVariant = selectedVariant || defaultVariant;

  const displayPrice =
    activeVariant?.variant_price ??
    activeVariant?.price ??
    item.base_price ??
    item.price ??
    0;

  const displayStock =
    activeVariant?.variant_stock ??
    activeVariant?.stock ??
    item.base_stock ??
    item.stock ??
    0;

  const displaySKU = activeVariant?.sku || item.base_sku || item.sku || "N/A";

  const displayImage = activeVariant?.variant_image || item.image;

  const displayDescription =
    item.description?.trim() || "No description available for this product.";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <Link
        href="/inventory/all"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">Back to Inventory</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-10 shadow-xl border border-slate-100 rounded-[3rem] relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-full md:w-80 h-80 relative rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <Package size={80} strokeWidth={1} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 py-1.5 px-4 rounded-full mb-4">
                  {item.category}
                </span>
                <h1 className="text-4xl font-black text-slate-900 mb-2">
                  {item.name}
                </h1>
                <p className="text-slate-400 text-[11px] font-mono font-bold tracking-widest mb-6">
                  SKU: {displaySKU}
                </p>

                <div className="mb-6 max-w-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Description
                  </p>
                  <p className="text-sm leading-7 text-slate-600">
                    {displayDescription}
                  </p>
                </div>

                {item.has_variants && uniqueColors.length > 0 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                        Select Color
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {uniqueColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all border-2 ${
                              selectedColor === color
                                ? "border-blue-600 bg-blue-50 text-blue-700 scale-105 shadow-md"
                                : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                        Available Sizes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`min-w-[48px] h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all border-2 ${
                              selectedVariant?.id === v.id
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                : "bg-white text-slate-600 border-slate-100 hover:border-blue-400"
                            }`}
                          >
                            {v.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-slate-50">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    Price
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    ₹{Number(displayPrice).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-600">
                  <Layers size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    Stock
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {displayStock} <span className="text-xs">Units</span>
                  </p>
                </div>
              </div>
            </div>

            {selectedVariant && (
              <div className="mt-8 p-4 bg-red-50/50 rounded-2xl border border-red-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-red-600 uppercase">
                  Manage Selected Variant
                </span>
                <button
                  onClick={handleDeleteVariant}
                  disabled={isDeletingVariant}
                  className="p-2.5 bg-white text-red-500 rounded-xl hover:bg-red-500 hover:text-red-50 shadow-sm transition-all"
                >
                  {isDeletingVariant ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
              <History size={16} className="text-blue-400" /> Activity & Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                  Status
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded ${displayStock > 5 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {displayStock > 5 ? "OPTIMAL" : "CRITICAL"}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                  Total Variants
                </span>
                <span className="text-sm font-bold text-slate-200">
                  {item.variants?.length || 0} items
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
            >
              Update Details
            </button>
            <button
              onClick={() => {
                if (confirm("Delete entire product?"))
                  api
                    .delete(`/inventory/${id}`)
                    .then(() => router.push("/inventory/all"));
              }}
              className="w-full bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>

      <EditInventoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={item}
        onUpdate={(updated) => setItem(updated)}
      />
    </div>
  );
}
