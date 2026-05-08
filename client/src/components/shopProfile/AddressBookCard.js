"use client";

import { memo } from "react";
import { MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";

// Props: { addresses, onAdd, onEdit, onDelete }
function AddressBookCard({ addresses, onAdd, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-4xl md:rounded-[40px] shadow-xl shadow-[#4C1D95]/5 border border-white overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#F5F3FF] flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-serif italic text-[#4C1D95]">
            Shipping Addresses
          </h2>
          <p className="text-[9px] md:text-[10px] text-[#4C1D95]/40 font-bold uppercase tracking-widest mt-1">
            Manage your delivery locations
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4C1D95] transition-all shadow-md shadow-purple-200"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      <div className="divide-y divide-[#F5F3FF]">
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="group p-6 md:p-8 hover:bg-[#FDFCFE] transition-all relative"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className="p-3.5 bg-[#F5F3FF] text-[#A78BFA] rounded-xl md:rounded-2xl group-hover:text-[#8B5CF6] group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                  <MapPin size={20} />
                </div>

                <div className="flex-1 pr-20 md:pr-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-black text-[#A78BFA] uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-100 rounded-md">
                      {addr.address_type}
                    </span>
                    {addr.is_default && (
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-widest px-2 py-0.5 bg-green-50 rounded-md">
                        Default
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm md:text-base font-bold text-[#4C1D95]">
                    {addr.full_name}
                  </h4>
                  <p className="text-xs text-[#4C1D95]/60 mt-1 leading-relaxed max-w-md">
                    {addr.house_info}, {addr.area_info}, {addr.city},
                    {addr.state} -
                    <span className="font-bold">{addr.pincode}</span>
                  </p>
                  <p className="text-[11px] font-bold text-[#8B5CF6] mt-3 flex items-center gap-1.5">
                    <Phone size={12} /> {addr.phone}
                  </p>
                </div>

                <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                  <button
                    onClick={() => onEdit(addr)}
                    className="p-2.5 bg-white border border-[#F5F3FF] text-blue-500 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(addr.id)}
                    className="p-2.5 bg-white border border-[#F5F3FF] text-red-500 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex md:hidden absolute top-6 right-6 gap-2">
                <button
                  onClick={() => onEdit(addr)}
                  className="p-2 bg-[#F5F3FF] text-[#8B5CF6] rounded-lg"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(addr.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center">
            <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest italic">
              No addresses saved yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(AddressBookCard);
