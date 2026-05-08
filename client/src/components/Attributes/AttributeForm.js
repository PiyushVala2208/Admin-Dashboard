"use client";

import { useMemo, useState } from "react";
import { Plus, Tag, Trash2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";

const ATTRIBUTE_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
];

export default function AttributeForm({ onCreated }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);
  const [isRequired, setIsRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = name.trim();

  const canSubmit = useMemo(() => {
    if (!trimmedName) return false;
    if (type !== "select") return true;
    return options.length > 0;
  }, [trimmedName, type, options.length]);

  const addOption = (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) return;

    const exists = options.some(
      (option) => option.toLowerCase() === value.toLowerCase(),
    );

    if (exists) {
      toast.error("This option already exists.");
      return;
    }

    setOptions((current) => [...current, value]);
    setOptionInput("");
  };

  const removeOption = (value) => {
    setOptions((current) => current.filter((item) => item !== value));
  };

  const resetForm = () => {
    setName("");
    setType("text");
    setOptionInput("");
    setOptions([]);
    setIsRequired(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: trimmedName,
        type,
        options: type === "select" ? options : [],
      };

      const response = await api.post("/attributes", {
        ...payload,
        isRequired,
      });
      toast.success("Attribute created successfully.");
      resetForm();
      onCreated?.(response?.data?.data || null);
    } catch (error) {
      toast.error(
        error?.message ||
          error?.error ||
          "Unable to create the attribute right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-6 flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b3dff]">
          <Sparkles size={13} />
          Attribute Creator
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-slate-800">Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            placeholder="e.g. RAM, Material, Color"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-slate-800">Type</label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
          >
            {ATTRIBUTE_TYPES.map((attributeType) => (
              <option key={attributeType.value} value={attributeType.value}>
                {attributeType.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-slate-800">Required</label>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-600">
              Mark as mandatory for product specs
            </p>
            <button
              type="button"
              onClick={() => setIsRequired((current) => !current)}
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
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-sm font-semibold text-slate-800">
              Option Manager
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={optionInput}
                onChange={(event) => setOptionInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addOption(optionInput);
                  }
                }}
                type="text"
                placeholder="Type option and press Enter"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
              />

              <button
                type="button"
                onClick={() => addOption(optionInput)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8b3dff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600 active:scale-[0.98]"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {options.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <span
                    key={option}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Tag size={13} className="text-[#8b3dff]" />
                    {option}
                    <button
                      type="button"
                      onClick={() => removeOption(option)}
                      className="text-slate-400 transition hover:text-rose-500"
                      aria-label={`Remove ${option}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No options added yet.</p>
            )}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8b3dff] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Creating Attribute..." : "Create Attribute"}
        </button>
      </form>
    </motion.section>
  );
}
