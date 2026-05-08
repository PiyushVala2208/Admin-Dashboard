"use client";
import Image from "next/image";
import { Pencil, Trash2, Package } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function InventoryTable({
  data,
  getStatus,
  handleEdit,
  handleDelete,
  router,
  calculateTotalStock,
  getDisplayPrice,
}) {
  const { currencySymbol } = useSettings();

  return (
    <div className="hidden md:block bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 overflow-hidden transition-all min-h-146.25">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
          <tr>
            <th className="p-4 font-semibold uppercase tracking-wider w-32">
              Preview
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider">
              Item Name
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider">
              Category
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider">
              Stock
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider">
              Price
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => {
            const totalStock = calculateTotalStock(item);
            const displayPrice = getDisplayPrice(item);
            const status = getStatus(totalStock);
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

            const displayImages = uniqueColorImages.slice(0, 3);
            const remainingCount = uniqueColorImages.length - 3;
            const mainDisplayImage =
              item.image ||
              (uniqueColorImages.length > 0 ? uniqueColorImages[0] : null);

            return (
              <tr
                key={item.id}
                onClick={() => router.push(`/inventory/info/${item.id}`)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center">
                    {uniqueColorImages.length > 1 ? (
                      <div className="flex -space-x-5 isolate items-center">
                        {displayImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-slate-50 transition-all duration-300 ease-in-out hover:scale-122 hover:shadow-xl hover:-translate-y-1"
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
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm group-hover:border-blue-200 transition-all duration-500 group-hover:scale-110">
                        {mainDisplayImage ? (
                          <Image
                            src={mainDisplayImage}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Package className="text-slate-300" size={20} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                <td className="p-4 font-semibold text-slate-700">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>

                      {item.has_critical && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      {variantsArray.length > 0 && (
                        <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-tight">
                          {variantDisplayCount} Variants
                        </span>
                      )}

                      {item.has_critical && (
                        <span className="text-[8px] text-red-500 font-black uppercase">
                          {item.critical_variants_count} Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="p-4 text-slate-500 font-medium">
                  {item.category}
                </td>
                <td className="p-4 font-mono font-bold text-slate-600">
                  {totalStock}
                </td>

                <td className="p-4 font-bold text-slate-800">
                  <div className="flex flex-col">
                    <span>
                      {currencySymbol}
                      {displayPrice.toLocaleString()}
                    </span>
                    {variantsArray.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium lowercase">
                        (Starting)
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-full border leading-none ${status.color}`}
                  >
                    {status.label.toUpperCase()}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(e, item);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(e, item.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
