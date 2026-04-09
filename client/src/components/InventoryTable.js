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
            <th className="p-4 font-semibold uppercase tracking-wider w-20">
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
            const status = getStatus(item.stock);
            return (
              <tr
                key={item.id}
                onClick={() => router.push(`/inventory/info/${item.id}`)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm group-hover:border-purple-200 transition-colors">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <Package className="text-slate-300" size={20} />
                      </div>
                    )}
                  </div>
                </td>

                <td className="p-4 font-semibold text-slate-700">
                  {item.name}
                </td>
                <td className="p-4 text-slate-500">{item.category}</td>
                <td className="p-4">
                  <span className="font-mono font-medium">{item.stock}</span>
                </td>
                <td className="p-4 font-bold text-slate-800">
                  {currencySymbol} {item.price.toLocaleString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-[11px] font-bold rounded-full border ${status.color}`}
                  >
                    {status.label.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
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
