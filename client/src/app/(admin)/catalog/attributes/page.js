"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Layers, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import AttributeForm from "@/components/Attributes/AttributeForm";
import AttributeMapping from "@/components/Attributes/AttributeMapping";
import AttributeList from "@/components/Attributes/AttributeList";
import api from "@/app/utils/api";

export default function AttributesPage() {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        Number(item.id) === Number(updatedAttribute.id) ? updatedAttribute : item,
      ),
    );
  }, []);

  const handleAttributeCreated = useCallback((createdAttribute) => {
    if (!createdAttribute?.id) {
      fetchAttributes();
      return;
    }

    setAttributes((current) => {
      const withoutDuplicate = current.filter(
        (item) => Number(item.id) !== Number(createdAttribute.id),
      );
      const next = [createdAttribute, ...withoutDuplicate];
      next.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      return next;
    });
    fetchAttributes();
  }, [fetchAttributes]);

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
        await api.delete(`/attributes/${snapshot.id}`);
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
      toast.error(error?.message || "Failed to load attribute management data.");
      setCategories([]);
      setAttributes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 md:px-6 md:py-8 lg:px-10">
      <section className="mb-7 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
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
              Create global specifications and map them category-wise for a scalable catalog.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <Box size={16} className="text-[#8b3dff]" />
            {attributes.length} Global Attributes
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-slate-100 bg-white px-5 py-20 text-slate-500 shadow-sm">
          <Loader2 size={18} className="mr-2 animate-spin" />
          Loading attribute modules...
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
          <div className="space-y-6">
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
