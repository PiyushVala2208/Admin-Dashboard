import Image from "next/image";
import { Pencil, Trash2, Package } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function InventoryTable({
  data,
  getStatus,
  handleEdit,
  handleDelete,
  router,
}) {
  const { currencySymbol } = useSettings();

  return (
    <div className="hidden md:block bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 overflow-hidden transition-all min-h-146.25">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
          <tr>
            <th className="p-4 font-semibold uppercase tracking-wider w-24">
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
            const totalStock =
              item.has_variants && item.variants?.length > 0
                ? item.variants.reduce(
                    (acc, curr) => acc + (Number(curr.variant_stock) || 0),
                    0,
                  )
                : Number(item.stock) || 0;

            const status = getStatus(totalStock);

            let displayPrice = 0;
            if (item.has_variants && item.variants?.length > 0) {
              // Variants mein se sabse minimum price nikal rahe hain (Starting price)
              const variantPrices = item.variants
                .map((v) => Number(v.variant_price))
                .filter((p) => p > 0);
              displayPrice =
                variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
            } else {
              displayPrice = Number(item.base_price || item.price || 0);
            }

            const variantImages = item.has_variants
              ? item.variants.map((v) => v.variant_image).filter((img) => img)
              : [];

            const displayImages = variantImages.slice(0, 3);
            const remainingCount = variantImages.length - 3;

            return (
              <tr
                key={item.id}
                onClick={() => router.push(`/inventory/info/${item.id}`)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center">
                    {item.has_variants && variantImages.length > 0 ? (
                      <div className="flex -space-x-5 isolate">
                        {displayImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-10 h-10 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-slate-50 transition-all duration-300 hover:scale-125 hover:z-50 hover:shadow-lg"
                            style={{ zIndex: 10 - idx }}
                          >
                            <Image
                              src={img}
                              alt="variant"
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ))}
                        {remainingCount > 0 && (
                          <div className="relative w-10 h-10 rounded-xl border-2 border-white shadow-sm bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold z-0">
                            +{remainingCount}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm group-hover:border-purple-200 transition-all duration-500 group-hover:scale-110">
                        {item.image ? (
                          <Image
                            src={item.image}
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
                    <span>{item.name}</span>
                    {item.has_variants && (
                      <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">
                        {item.variants?.length} Variants
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-slate-500">{item.category}</td>
                <td className="p-4">
                  <span className="font-mono font-medium">{totalStock}</span>
                </td>
                <td className="p-4 font-bold text-slate-800">
                  <div className="flex flex-col">
                    <span>
                      {currencySymbol}
                      {displayPrice.toLocaleString()}
                    </span>
                    {item.has_variants && (
                      <span className="text-[10px] text-slate-400 font-medium lowercase">
                        (From)
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-[11px] font-bold rounded-full border ${status.color}`}
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
