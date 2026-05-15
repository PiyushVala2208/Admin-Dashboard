"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Layers, Loader2, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import AttributeForm from "@/components/Attributes/AttributeForm";
import AttributeMapping from "@/components/Attributes/AttributeMapping";
import AttributeList from "@/components/Attributes/AttributeList";
import api from "@/app/utils/api";

const normalizeCategoryName = (value = "") =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

export default function AttributesPage() {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const fetchAttributes = useCallback(async () => {
    const response = await api.get("/attributes");
    const nextAttributes = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    setAttributes(nextAttributes);
  }, []);

  const handleAttributeUpdated = useCallback((updatedAttribute) => {
    if (!updatedAttribute?.id) return;

    setAttributes((current) =>
      current.map((item) =>
        Number(item.id) === Number(updatedAttribute.id)
          ? updatedAttribute
          : item,
      ),
    );
  }, []);

  const handleAttributeCreated = useCallback(
    (createdAttribute) => {
      if (!createdAttribute?.id) {
        fetchAttributes();
        return;
      }

      setAttributes((current) => {
        const withoutDuplicate = current.filter(
          (item) => Number(item.id) !== Number(createdAttribute.id),
        );
        const next = [createdAttribute, ...withoutDuplicate];
        next.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        );
        return next;
      });
      fetchAttributes();
    },
    [fetchAttributes],
  );

  const handleAttributeDelete = useCallback(
    async (attribute, dependencyInfo) => {
      if (!attribute?.id) return;

      const snapshot = attribute;
      const totalUsage =
        Number(dependencyInfo?.product_usage_count || 0) +
        Number(dependencyInfo?.variant_usage_count || 0);

      if (totalUsage > 0) {
        const blockError = new Error(
          "This attribute is used by active products and cannot be deleted.",
        );
        blockError.code = "ATTRIBUTE_IN_USE";
        throw blockError;
      }

      setAttributes((current) =>
        current.filter((item) => Number(item.id) !== Number(snapshot.id)),
      );

      try {
        await api.delete(`/attributes/${snapshot.id}`, {
          params: { hard: true },
        });
        toast.success("Attribute deleted successfully.");
      } catch (error) {
        setAttributes((current) => {
          if (current.some((item) => Number(item.id) === Number(snapshot.id))) {
            return current;
          }

          const rolledBack = [...current, snapshot];
          rolledBack.sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || "")),
          );
          return rolledBack;
        });

        if (error?.code === "ATTRIBUTE_IN_USE") {
          const impact = error?.impact || {};
          const productRefs =
            Number(impact.product_usage_count || 0) +
            Number(impact.variant_usage_count || 0);
          toast.error(
            productRefs > 0
              ? `Delete blocked: linked to ${productRefs} active product reference(s).`
              : error?.message || "Delete blocked: attribute is in use.",
          );
        } else {
          toast.error("Delete failed. Changes rolled back.");
        }
        throw error;
      }
    },
    [],
  );

  const fetchBaseData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [categoriesResponse, attributesResponse] = await Promise.all([
        api.get("/categories"),
        api.get("/attributes"),
      ]);

      setCategories(
        Array.isArray(categoriesResponse.data?.data)
          ? categoriesResponse.data.data
          : [],
      );

      setAttributes(
        Array.isArray(attributesResponse.data?.data)
          ? attributesResponse.data.data
          : [],
      );
    } catch (error) {
      toast.error(
        error?.message || "Failed to load attribute management data.",
      );
      setCategories([]);
      setAttributes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  const normalizedCategoryInput = normalizeCategoryName(newCategoryName);

  const exactCategoryMatch = categories.find(
    (category) =>
      normalizeCategoryName(category?.name || "").toLowerCase() ===
      normalizedCategoryInput.toLowerCase(),
  );

  const categorySuggestions = categories
    .filter((category) => {
      const name = normalizeCategoryName(category?.name || "").toLowerCase();
      if (!normalizedCategoryInput) return true;
      return name.includes(normalizedCategoryInput.toLowerCase());
    })
    .slice(0, 8);

  const handleCreateCategory = async () => {
    const nextName = normalizeCategoryName(newCategoryName);

    if (!nextName) {
      toast.error("Category name is required.");
      return;
    }

    if (exactCategoryMatch) {
      toast.error("This category already exists. Select it from suggestions.");
      return;
    }

    setIsCreatingCategory(true);

    try {
      const response = await api.post("/categories", { name: nextName });
      const createdCategory = response?.data?.data;

      if (createdCategory?.id) {
        setCategories((current) => {
          const deduped = [
            createdCategory,
            ...current.filter(
              (category) => Number(category.id) !== Number(createdCategory.id),
            ),
          ];
          deduped.sort((a, b) =>
            String(a?.name || "").localeCompare(String(b?.name || "")),
          );
          return deduped;
        });
      } else {
        await fetchBaseData();
      }

      setNewCategoryName("");
      toast.success("Category created successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to create category right now.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 md:px-6 md:py-8 lg:px-10">
      <section className="mb-7 rounded-4xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b3dff]">
              <Layers size={13} />
              Catalog System
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
              Dynamic Attribute Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Create global specifications and map them category-wise for a
              scalable catalog.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <Box size={16} className="text-[#8b3dff]" />
            {attributes.length} Global Attributes
          </div>
        </div>
      </section>

      <section className="mb-7 rounded-4xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Create Category From Catalog
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add new categories here.
            </p>
          </div>

          <div className="w-full max-w-xl space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Type a category name"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={isCreatingCategory}
                className="inline-flex min-w-42 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8b3dff] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isCreatingCategory ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle size={15} />
                    Create Category
                  </>
                )}
              </button>
            </div>

            {categorySuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categorySuggestions.map((category) => {
                  const isExactMatch =
                    normalizeCategoryName(category?.name || "").toLowerCase() ===
                    normalizedCategoryInput.toLowerCase();

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setNewCategoryName(category.name || "")}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                        isExactMatch
                          ? "border-violet-300 bg-violet-50 text-[#8b3dff]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-4xl border border-slate-100 bg-white px-5 py-20 text-slate-500 shadow-sm">
          <Loader2 size={18} className="mr-2 animate-spin" />
          Loading attribute modules...
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:items-stretch">
          <div className="flex flex-col gap-6">
            <AttributeForm onCreated={handleAttributeCreated} />
            <AttributeList
              attributes={attributes}
              onAttributeUpdated={handleAttributeUpdated}
              onAttributeDelete={handleAttributeDelete}
            />
          </div>
          <AttributeMapping categories={categories} attributes={attributes} />
        </div>
      )}
    </div>
  );
}
