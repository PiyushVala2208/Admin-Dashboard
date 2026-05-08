"use client";

import { useCallback, useMemo, useState } from "react";
import { Boxes, Link2, ListChecks } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";
import AttributeActionButtons from "@/components/Attributes/components/AttributeActionButtons";
import AttributeEditDrawer from "@/components/Attributes/components/AttributeEditDrawer";
import AttributeDeleteModal from "@/components/Attributes/components/AttributeDeleteModal";
import {
  buildDependencyInfo,
  createSnapshot,
  normalizeOptions,
} from "@/components/Attributes/attributeUtils";

const formatType = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export default function AttributeList({
  attributes = [],
  onAttributeUpdated,
  onAttributeDelete,
}) {
  const [activeAttribute, setActiveAttribute] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("text");
  const [editIsRequired, setEditIsRequired] = useState(false);
  const [editOptionInput, setEditOptionInput] = useState("");
  const [editOptions, setEditOptions] = useState([]);
  const [editSnapshot, setEditSnapshot] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [dependencyInfo, setDependencyInfo] = useState(buildDependencyInfo());
  const [isDeleting, setIsDeleting] = useState(false);

  const isTypeLocked = Boolean(activeAttribute?.is_in_use);

  const isDirty = useMemo(() => {
    if (!isEditOpen || !activeAttribute) return false;
    const current = createSnapshot({
      name: editName,
      type: editType,
      options: editOptions,
      is_required: editIsRequired,
    });
    return current !== editSnapshot;
  }, [
    activeAttribute,
    isEditOpen,
    editIsRequired,
    editName,
    editOptions,
    editSnapshot,
    editType,
  ]);

  const openEditor = useCallback((attribute) => {
    if (!attribute) return;
    setActiveAttribute(attribute);
    setEditName(String(attribute.name || ""));
    setEditType(String(attribute.type || "text").toLowerCase());
    setEditIsRequired(Boolean(attribute.is_required));
    setEditOptionInput("");
    setEditOptions(normalizeOptions(attribute.options || []));
    setEditSnapshot(createSnapshot(attribute));
    setIsEditOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditOpen(false);
    setActiveAttribute(null);
    setEditSnapshot("");
    setEditOptionInput("");
    setIsSavingEdit(false);
  }, []);

  const addEditOption = useCallback(() => {
    const value = String(editOptionInput || "").trim();
    if (!value) return;
    const exists = editOptions.some(
      (option) => option.toLowerCase() === value.toLowerCase(),
    );
    if (exists) {
      toast.error("This option already exists.");
      return;
    }
    setEditOptions((current) => [...current, value]);
    setEditOptionInput("");
  }, [editOptionInput, editOptions]);

  const removeEditOption = useCallback((value) => {
    setEditOptions((current) => current.filter((item) => item !== value));
  }, []);

  const saveEdit = useCallback(async () => {
    if (!activeAttribute?.id) return;
    if (!isDirty) return;

    const payload = {
      name: String(editName || "").trim(),
      type: String(editType || "").trim().toLowerCase(),
      isRequired: Boolean(editIsRequired),
      options: editType === "select" ? normalizeOptions(editOptions) : [],
    };

    if (!payload.name) {
      toast.error("Attribute name is required.");
      return;
    }

    if (payload.type === "select" && payload.options.length === 0) {
      toast.error("Select type attributes require at least one option.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const response = await api.patch(`/attributes/${activeAttribute.id}`, payload);
      const updated = response.data?.data || null;
      if (updated?.id) {
        onAttributeUpdated?.(updated);
        setEditSnapshot(createSnapshot(updated));
        toast.success("Attribute updated.");
      } else {
        toast.success("Attribute updated.");
      }
      setIsEditOpen(false);
      setActiveAttribute(null);
    } catch (error) {
      toast.error(error?.message || "Unable to update attribute.");
    } finally {
      setIsSavingEdit(false);
    }
  }, [
    activeAttribute?.id,
    editIsRequired,
    editName,
    editOptions,
    editType,
    isDirty,
    onAttributeUpdated,
  ]);

  const openDelete = useCallback(async (attribute) => {
    if (!attribute?.id) return;
    setActiveAttribute(attribute);
    setDependencyInfo(buildDependencyInfo());
    setIsDeleteOpen(true);
    setIsCheckingDependencies(true);

    try {
      const response = await api.get(`/attributes/${attribute.id}/dependencies`);
      setDependencyInfo(buildDependencyInfo(response.data?.data || {}));
    } catch (error) {
      setDependencyInfo(buildDependencyInfo());
      toast.error(error?.message || "Failed to check attribute dependencies.");
    } finally {
      setIsCheckingDependencies(false);
    }
  }, []);

  const closeDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setIsCheckingDependencies(false);
    setIsDeleting(false);
    setDependencyInfo(buildDependencyInfo());
    setActiveAttribute(null);
  }, []);

  const totalUsageCount =
    Number(dependencyInfo?.product_usage_count || 0) +
    Number(dependencyInfo?.variant_usage_count || 0);
  const isDeleteBlocked = totalUsageCount > 0;

  const confirmDelete = useCallback(async () => {
    if (!activeAttribute?.id) return;
    if (typeof onAttributeDelete !== "function") return;

    setIsDeleting(true);
    try {
      await onAttributeDelete(activeAttribute, dependencyInfo);
      setIsDeleteOpen(false);
      setActiveAttribute(null);
    } catch {
      // parent handler already shows toast; keep modal open for user to read dependency info
    } finally {
      setIsDeleting(false);
    }
  }, [activeAttribute, dependencyInfo, onAttributeDelete]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.06 }}
      className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b3dff]">
          <ListChecks size={13} />
          Attribute Registry
        </span>

        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <Boxes size={13} className="text-[#8b3dff]" />
          {attributes.length} total
        </div>
      </div>

      {attributes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          No attributes yet. Create your first attribute to start mapping.
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attribute) => {
            const optionsCount = Array.isArray(attribute.options)
              ? attribute.options.length
              : 0;

            return (
              <article
                key={attribute.id}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-violet-200 hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{attribute.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600">
                        {formatType(attribute.type)}
                      </span>

                      {attribute.type === "select" ? (
                        <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 font-medium text-[#8b3dff]">
                          {optionsCount} options
                        </span>
                      ) : null}

                      <span
                        className={`rounded-full border px-2 py-0.5 font-medium ${
                          attribute.is_required
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {attribute.is_required ? "Required" : "Optional"}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600">
                        <Link2 size={11} />
                        in use: {attribute.is_in_use ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <AttributeActionButtons
                    onEdit={() => openEditor(attribute)}
                    onDelete={() => openDelete(attribute)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AttributeEditDrawer
        isOpen={isEditOpen}
        attributeName={activeAttribute?.name || "Attribute"}
        name={editName}
        type={editType}
        isRequired={editIsRequired}
        options={editOptions}
        optionInput={editOptionInput}
        isTypeLocked={isTypeLocked}
        isDirty={isDirty}
        isSaving={isSavingEdit}
        onClose={closeEditor}
        onNameChange={setEditName}
        onTypeChange={(value) => {
          setEditType(value);
          if (String(value).toLowerCase() !== "select") {
            setEditOptions([]);
            setEditOptionInput("");
          }
        }}
        onToggleRequired={() => setEditIsRequired((current) => !current)}
        onOptionInputChange={setEditOptionInput}
        onAddOption={addEditOption}
        onRemoveOption={removeEditOption}
        onSave={saveEdit}
      />

      <AttributeDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        dependencyInfo={dependencyInfo}
        isCheckingDependencies={isCheckingDependencies}
        totalUsageCount={totalUsageCount}
        isDeleteBlocked={isDeleteBlocked}
        isDeleting={isDeleting}
        onDelete={confirmDelete}
      />
    </motion.section>
  );
}
