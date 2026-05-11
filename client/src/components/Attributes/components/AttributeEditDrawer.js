"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Save, Tag, X } from "lucide-react";
import { ATTRIBUTE_TYPES } from "@/components/Attributes/attributeUtils";

function AttributeEditDrawer({
  isOpen,
  attributeName,
  name,
  type,
  isRequired,
  options,
  optionInput,
  isTypeLocked,
  isDirty,
  isSaving,
  onClose,
  onNameChange,
  onTypeChange,
  onToggleRequired,
  onOptionInputChange,
  onAddOption,
  onRemoveOption,
  onSave,
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 bg-black/80"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-120 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Attribute Editor
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Edit {attributeName}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Close editor"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
                  placeholder="Enter attribute name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(event) => onTypeChange(event.target.value)}
                  disabled={isTypeLocked}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {ATTRIBUTE_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {isTypeLocked ? (
                  <p className="text-xs font-medium text-amber-700">
                    Type is locked because this attribute is already in use.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Required
                    </p>
                    <p className="text-xs text-slate-500">
                      Enforce value in product forms
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleRequired}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      isRequired ? "bg-[#8b3dff]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        isRequired ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {type === "select" ? (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Option Manager
                  </p>

                  <div className="flex gap-2">
                    <input
                      value={optionInput}
                      onChange={(event) =>
                        onOptionInputChange(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                          event.preventDefault();
                          onAddOption();
                        }
                      }}
                      type="text"
                      placeholder="Add option"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
                    />
                    <button
                      type="button"
                      onClick={onAddOption}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8b3dff] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-600"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <span
                        key={option}
                        className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <Tag size={12} className="text-[#8b3dff]" />
                        {option}
                        <button
                          type="button"
                          onClick={() => onRemoveOption(option)}
                          className="text-slate-400 transition hover:text-red-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4">
              <button
                type="button"
                onClick={onSave}
                disabled={!isDirty || isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8b3dff] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default memo(AttributeEditDrawer);
