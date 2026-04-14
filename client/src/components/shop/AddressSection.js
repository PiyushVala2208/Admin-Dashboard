"use client";
import { Plus, MapPin, CheckCircle2, Trash2, Pencil } from "lucide-react";

export default function AddressSection({
  addresses,
  selectedAddress,
  onSelect,
  onAddNew,
  onEdit,
  onDelete,
}) {
  return (
    <section className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
            <MapPin size={20} />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
            Delivery Address
          </h2>
        </div>

        <button
          onClick={onAddNew}
          type="button"
          className="flex items-center gap-2 text-purple-600 font-bold text-xs md:text-sm hover:bg-purple-50 px-3 py-2 md:px-4 md:py-2 rounded-xl transition-all border border-purple-100 md:border-none"
        >
          <Plus size={18} />
          <span className="whitespace-nowrap">Add New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => onSelect(addr)}
              className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedAddress?.id === addr.id
                  ? "border-purple-600 bg-purple-50/30"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
              }`}
            >
              {selectedAddress?.id === addr.id && (
                <CheckCircle2
                  className="absolute top-4 right-4 text-purple-600"
                  size={20}
                />
              )}

              <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <div
                  className={`flex gap-2 ${selectedAddress?.id === addr.id ? "mt-8 md:mt-0" : ""}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(addr);
                    }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 md:text-slate-400 hover:text-blue-600 hover:border-blue-100 shadow-sm active:scale-90 transition-transform"
                    aria-label="Edit Address"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(addr.id);
                    }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 md:text-slate-400 hover:text-red-600 hover:border-red-100 shadow-sm active:scale-90 transition-transform"
                    aria-label="Delete Address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-500">
                  {addr.address_type}
                </span>
                {addr.is_default && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                    Default
                  </span>
                )}
              </div>

              <div className="pr-12 md:pr-10">
                <h4 className="font-bold text-slate-900 mb-1 text-sm md:text-base">
                  {addr.full_name}
                </h4>
                <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {addr.house_info}, {addr.area_info}, {addr.city}, {addr.state}{" "}
                  - {addr.pincode}
                </p>
                <p className="text-[11px] md:text-xs font-bold text-slate-700 mt-3">
                  Mobile: {addr.phone}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
            <p className="text-slate-400 text-sm font-medium">
              No addresses saved yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
