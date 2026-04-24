"use client";
import Image from "next/image";
import { Package, Pencil, Trash2, Layers } from "lucide-react";

export default function InventoryCard({
  item,
  router,
  calculateTotalStock,
  getDisplayPrice,
  getStatus,
  handleEdit,
  handleDelete,
  currencySymbol,
}) {
  const totalStock = calculateTotalStock(item);
  const status = getStatus(totalStock);
  const displayPrice = getDisplayPrice(item);

  const variantsArray = item.variants || [];

  const colorGroups = {};
  variantsArray.forEach((v) => {
    const colorName = (v.color || "default").trim().toLowerCase();
    if (!colorGroups[colorName]) {
      colorGroups[colorName] = v.variant_image || null;
    }
  });

  const uniqueColorImages = Object.values(colorGroups).filter(
    (img) => img !== null,
  );
  const variantDisplayCount = Object.keys(colorGroups).length;

  const mainDisplayImage =
    item.image || (uniqueColorImages.length > 0 ? uniqueColorImages[0] : null);

  const displayImages = uniqueColorImages.slice(0, 3);
  const remainingCount = uniqueColorImages.length - 3;

  return (
    <div
      onClick={() => router.push(`/inventory/info/${item.id}`)}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center min-w-12">
            {uniqueColorImages.length > 1 ? (
              <div className="flex -space-x-5 isolate items-center">
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-slate-50 transition-all duration-300 ease-in-out hover:scale-125 hover:shadow-xl hover:-translate-y-1"
                    style={{
                      zIndex: 10 - idx,
                      "--hover-z-index": 100,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.zIndex = "100";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.zIndex = `${10 - idx}`;
                    }}
                  >
                    <Image
                      src={img}
                      alt="product color"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ))}

                {remainingCount > 0 && (
                  <div
                    className="relative w-12 h-12 rounded-xl border-2 border-white shadow-sm bg-slate-800 flex items-center justify-center text-[10px] text-white font-black transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg"
                    style={{
                      zIndex: 0,
                      "--hover-z-index": 100,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.zIndex = "100";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.zIndex = "0";
                    }}
                  >
                    +{remainingCount}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-110 transition-transform duration-500">
                {mainDisplayImage ? (
                  <Image
                    src={mainDisplayImage}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <Package className="text-slate-300" size={20} />
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">
              {item.name}
              {item.has_critical && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 text-xs font-medium">
                {item.category}
              </p>
              {variantDisplayCount > 0 && (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                  <Layers size={10} /> {variantDisplayCount} Variants
                </span>
              )}
              {item.has_critical && (
                <span className="text-[9px] font-black text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                  {item.critical_variants_count} Low Stock
                </span>
              )}
            </div>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-[10px] font-black rounded-md border ${status.color}`}
        >
          {status.label.toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Stock Available
        </p>
        <p className="text-sm font-bold text-slate-700">{totalStock} Units</p>
      </div>

      <div className="flex justify-between items-end pt-4 border-t border-slate-50">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {variantDisplayCount > 0 ? "Starting From" : "Price"}
          </p>
          <p className="text-xl font-black text-slate-900">
            {currencySymbol}
            {displayPrice.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(e, item);
            }}
            className="p-3 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(e, item.id);
            }}
            className="p-3 bg-slate-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
