"use client";

import { memo } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

// Props: { blockingValidationMessage, isSubmitting, isLoadingSpecs, onClose, onShowValidationMessage }
function EditInventoryFooterActions({
  blockingValidationMessage,
  isSubmitting,
  isLoadingSpecs,
  onClose,
  onShowValidationMessage,
}) {
  return (
    <div className="p-6 md:px-10 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-4 px-6 text-slate-600 font-bold hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200 active:scale-95"
      >
        Discard Changes
      </button>

      {blockingValidationMessage ? (
        <button
          type="button"
          onClick={onShowValidationMessage}
          disabled={isSubmitting || isLoadingSpecs}
          className="flex-2 py-4 px-6 bg-slate-300 text-white rounded-2xl font-black shadow-2xl shadow-slate-300 cursor-not-allowed flex items-center justify-center gap-3"
        >
          Apply & Sync All Changes
        </button>
      ) : (
        <button
          form="luxury-edit-form"
          type="submit"
          disabled={isSubmitting || isLoadingSpecs}
          className="flex-2 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Apply & Sync All Changes
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default memo(EditInventoryFooterActions);
