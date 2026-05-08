"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, ShieldAlert, Trash2 } from "lucide-react";

// Props: { isOpen, onClose, dependencyInfo, isCheckingDependencies, totalUsageCount, isDeleteBlocked, isDeleting, onDelete }
function AttributeDeleteModal({
  isOpen,
  onClose,
  dependencyInfo,
  isCheckingDependencies,
  totalUsageCount,
  isDeleteBlocked,
  isDeleting,
  onDelete,
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-130 bg-slate-900/45"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-140 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-red-100 bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
              <ShieldAlert size={13} />
              Danger Zone
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Delete Attribute?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure? This will remove this specification from linked
              categories.
            </p>

            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <div className="mb-3 flex items-center gap-2 font-semibold text-red-700">
                <AlertTriangle size={15} />
                Dependency Warning
              </div>

              {isCheckingDependencies ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Checking linked records...
                </div>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  <li>
                    Mapped Categories: {dependencyInfo.mapped_categories_count}
                  </li>
                  <li>
                    Product Specs Usage: {dependencyInfo.product_usage_count}
                  </li>
                  <li>
                    Variant Matrix Usage: {dependencyInfo.variant_usage_count}
                  </li>
                  <li className="pt-1 font-semibold">
                    Total Linked References: {totalUsageCount}
                  </li>
                </ul>
              )}
            </div>

            {!isCheckingDependencies &&
            dependencyInfo.mapped_categories?.length > 0 ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">
                  Mapped Categories
                </p>
                <p className="mt-1">
                  {dependencyInfo.mapped_categories
                    .slice(0, 3)
                    .map((item) => item.name)
                    .join(", ")}
                  {dependencyInfo.mapped_categories.length > 3 ? " ..." : ""}
                </p>
              </div>
            ) : null}

            {!isCheckingDependencies &&
            dependencyInfo.product_spec_usage?.length > 0 ? (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">
                  Products Using This Spec
                </p>
                <p className="mt-1">
                  {dependencyInfo.product_spec_usage
                    .slice(0, 3)
                    .map((item) => item.name)
                    .join(", ")}
                  {dependencyInfo.product_spec_usage.length > 3 ? " ..." : ""}
                </p>
              </div>
            ) : null}

            {!isCheckingDependencies &&
            dependencyInfo.product_variant_usage?.length > 0 ? (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">
                  Products Using This In Variants
                </p>
                <p className="mt-1">
                  {dependencyInfo.product_variant_usage
                    .slice(0, 3)
                    .map((item) => item.name)
                    .join(", ")}
                  {dependencyInfo.product_variant_usage.length > 3
                    ? " ..."
                    : ""}
                </p>
              </div>
            ) : null}

            {isDeleteBlocked ? (
              <p className="mt-3 text-xs font-semibold text-red-600">
                Deletion blocked: this attribute is used by active products.
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting || isDeleteBlocked}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete Attribute
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default memo(AttributeDeleteModal);
