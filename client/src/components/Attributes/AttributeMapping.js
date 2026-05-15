"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Link2, Loader2, RefreshCw, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";

const createDefaultMeta = (index = 0) => ({
  is_required: false,
  sort_order: index,
});

export default function AttributeMapping({ categories = [], attributes = [] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [mappedAttributeIds, setMappedAttributeIds] = useState([]);
  const [mappingMeta, setMappingMeta] = useState({});
  const [isLoadingMapping, setIsLoadingMapping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attributeSearch, setAttributeSearch] = useState("");

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => String(category.id) === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const filteredAttributes = useMemo(() => {
    const term = String(attributeSearch || "")
      .trim()
      .toLowerCase();
    if (!term) return attributes;

    return attributes.filter((attribute) => {
      const name = String(attribute.name || "").toLowerCase();
      const type = String(attribute.type || "").toLowerCase();
      return name.includes(term) || type.includes(term);
    });
  }, [attributeSearch, attributes]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setMappedAttributeIds([]);
      setMappingMeta({});
      return;
    }

    const fetchCategoryMapping = async () => {
      setIsLoadingMapping(true);
      try {
        const response = await api.get(
          `/attributes/category/${selectedCategoryId}`,
        );
        const currentMappings = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const ids = currentMappings.map((item) => Number(item.id));
        const nextMeta = {};

        currentMappings.forEach((item, index) => {
          const id = Number(item.id);
          nextMeta[id] = {
            is_required: Boolean(item.is_required),
            sort_order: Number.isInteger(Number(item.sort_order))
              ? Number(item.sort_order)
              : index,
          };
        });

        setMappedAttributeIds(ids);
        setMappingMeta(nextMeta);
      } catch (error) {
        toast.error(error?.message || "Failed to load category mappings.");
        setMappedAttributeIds([]);
        setMappingMeta({});
      } finally {
        setIsLoadingMapping(false);
      }
    };

    fetchCategoryMapping();
  }, [selectedCategoryId]);

  const mappedSet = useMemo(
    () => new Set(mappedAttributeIds),
    [mappedAttributeIds],
  );

  const toggleAttribute = (attributeId) => {
    setMappedAttributeIds((current) => {
      if (current.includes(attributeId)) {
        setMappingMeta((prev) => {
          const next = { ...prev };
          delete next[attributeId];
          return next;
        });

        return current.filter((id) => id !== attributeId);
      }

      setMappingMeta((prev) => ({
        ...prev,
        [attributeId]: prev[attributeId] || createDefaultMeta(current.length),
      }));

      return [...current, attributeId];
    });
  };

  const updateMeta = (attributeId, nextMeta) => {
    setMappingMeta((prev) => ({
      ...prev,
      [attributeId]: {
        ...createDefaultMeta(),
        ...prev[attributeId],
        ...nextMeta,
      },
    }));
  };

  const saveMapping = async () => {
    if (!selectedCategoryId) {
      toast.error("Select a category before updating mapping.");
      return;
    }

    setIsSaving(true);

    try {
      const attributeMappings = mappedAttributeIds.map(
        (attributeId, index) => ({
          attributeId,
          is_required: Boolean(mappingMeta[attributeId]?.is_required),
          sort_order:
            Number.parseInt(mappingMeta[attributeId]?.sort_order, 10) || index,
        }),
      );

      await api.post("/attributes/map", {
        categoryId: Number(selectedCategoryId),
        attributeMappings,
      });

      toast.success("Category attribute mapping updated.");
    } catch (error) {
      toast.error(error?.message || "Unable to update mapping right now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: 0.04 }}
      className="flex h-full min-h-160 max-h-[calc(200vh-220px)] flex-col rounded-4xl border border-slate-100 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b3dff]">
          <Link2 size={13} />
          Category Mapping
        </span>

        <div className="text-xs font-medium text-slate-500">
          {selectedCategory
            ? `${mappedAttributeIds.length} selected for ${selectedCategory.name}`
            : "Pick a category to begin"}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col space-y-6">
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-slate-800">
            Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
          >
            <option value="">Select category...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          <label
            htmlFor="mapping-search"
            className="text-sm font-semibold text-slate-800"
          >
            Search Attributes
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="mapping-search"
              type="search"
              value={attributeSearch}
              onChange={(event) => setAttributeSearch(event.target.value)}
              placeholder="Search attributes by name or type"
              className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {selectedCategoryId ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingMapping ? (
                <div className="flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 px-4 py-10 text-sm text-slate-500">
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Loading mapped attributes...
                </div>
              ) : attributes.length === 0 ? (
                <div className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No global attributes found. Create attributes first.
                </div>
              ) : filteredAttributes.length === 0 ? (
                <div className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No attributes match your search.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredAttributes.map((attribute, index) => {
                    const attributeId = Number(attribute.id);
                    const selected = mappedSet.has(attributeId);
                    const meta =
                      mappingMeta[attributeId] || createDefaultMeta(index);

                    return (
                      <motion.div
                        layout
                        whileTap={{ scale: 0.98 }}
                        key={attribute.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        onClick={() => toggleAttribute(attributeId)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleAttribute(attributeId);
                          }
                        }}
                        className={`cursor-pointer rounded-3xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 ${
                          selected
                            ? "border-[#8b3dff] bg-[#8b3dff] text-white"
                            : "border-slate-200 bg-slate-50 text-slate-800 hover:border-violet-300 hover:bg-violet-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {attribute.name}
                            </p>
                            <p
                              className={`mt-1 text-xs uppercase tracking-[0.18em] ${
                                selected ? "text-violet-100" : "text-slate-500"
                              }`}
                            >
                              {attribute.type}
                            </p>
                          </div>

                          {selected ? <Check size={16} /> : null}
                        </div>

                        {selected ? (
                          <div
                            className="mt-3 rounded-2xl border border-white/25 bg-white/10 p-3"
                            onClick={(event) => event.stopPropagation()}
                          >

                            <div className="space-y-1.5 flex gap-5">
                              <label className="text-xs font-semibold  text-violet-100">
                                Sort Order
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={meta.sort_order}
                                onChange={(event) =>
                                  updateMeta(attributeId, {
                                    sort_order: event.target.value,
                                  })
                                }
                                className="w-full rounded-xl border border-white/25 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-white"
                              />
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={saveMapping}
              disabled={isSaving || isLoadingMapping}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8b3dff] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Updating Mapping...
                </>
              ) : (
                "Update Mapping"
              )}
            </button>
          </>
        ) : (
          <div className="flex-1 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
            Select a category to map global attributes.
          </div>
        )}
      </div>
    </motion.section>
  );
}
