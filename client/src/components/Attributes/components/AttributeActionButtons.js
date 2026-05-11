"use client";

import { memo } from "react";
import { Pencil, Trash2 } from "lucide-react";

function AttributeActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-[#8b3dff]"
      >
        <Pencil size={13} />
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
      >
        <Trash2 size={13} />
        Delete
      </button>
    </div>
  );
}

export default memo(AttributeActionButtons);
