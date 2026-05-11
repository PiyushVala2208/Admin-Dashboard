"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";
import EditInventoryModal from "@/components/edit-inventory/EditInventoryModal";
import ProductSummaryCard from "@/components/info-inventory/ProductSummaryCard";
import InventoryActivityCard from "@/components/info-inventory/InventoryActivityCard";
import InventoryActionsCard from "@/components/info-inventory/InventoryActionsCard";
import ProductAttributesCard from "@/components/info-inventory/ProductAttributesCard";

export default function ItemInfoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);
  const [categoryAttributes, setCategoryAttributes] = useState([]);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/inventory/${id}`);
        const nextItem = response.data?.data || response.data;
        if (!active) return;

        setItem(nextItem || null);

        if (
          nextItem?.has_variants &&
          Array.isArray(nextItem?.variants) &&
          nextItem.variants.length > 0
        ) {
          const defaultVariant =
            nextItem.variants.find((variant) => variant.is_default) ||
            nextItem.variants[0];
          setSelectedColor(defaultVariant?.color || "");
          setSelectedVariant(defaultVariant || null);
        } else {
          setSelectedColor("");
          setSelectedVariant(null);
        }
      } catch (error) {
        if (!active) return;
        toast.error(error?.message || "Unable to load inventory item.");
        setItem(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchItem();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!item) {
      setCategoryAttributes([]);
      return;
    }

    let active = true;

    const fetchCategoryAttributes = async () => {
      const rawCategoryId =
        item?.category_id ?? item?.categoryId ?? item?.category?.id ?? null;
      let categoryId = Number.parseInt(rawCategoryId, 10);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        const rawCategoryName =
          item?.category_name ?? item?.category ?? item?.category?.name ?? "";
        const normalizedName = String(rawCategoryName || "")
          .trim()
          .toLowerCase();

        if (normalizedName) {
          try {
            const categoriesResponse = await api.get("/categories");
            const categories = Array.isArray(categoriesResponse.data?.data)
              ? categoriesResponse.data.data
              : [];
            const matched = categories.find((category) => {
              const name = String(category?.name || "")
                .trim()
                .toLowerCase();
              const slug = String(category?.slug || "")
                .trim()
                .toLowerCase();
              return name === normalizedName || slug === normalizedName;
            });
            categoryId = Number.parseInt(matched?.id, 10);
          } catch {
            categoryId = null;
          }
        }
      }

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        if (!active) return;
        setCategoryAttributes([]);
        return;
      }

      try {
        const response = await api.get(`/attributes/category/${categoryId}`);
        const attributes = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        if (!active) return;
        setCategoryAttributes(attributes);
      } catch {
        if (!active) return;
        setCategoryAttributes([]);
      }
    };

    fetchCategoryAttributes();

    return () => {
      active = false;
    };
  }, [
    item,
    item?.category_id,
    item?.categoryId,
    item?.category?.id,
    item?.category,
    item?.category_name,
    item?.category?.name,
  ]);

  const uniqueColors = useMemo(() => {
    if (!Array.isArray(item?.variants)) return [];
    return [
      ...new Set(item.variants.map((variant) => variant.color).filter(Boolean)),
    ];
  }, [item?.variants]);

  const availableSizes = useMemo(() => {
    if (!Array.isArray(item?.variants) || !selectedColor) return [];
    return item.variants.filter((variant) => variant.color === selectedColor);
  }, [item?.variants, selectedColor]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const firstAvailable = item?.variants?.find(
      (variant) => variant.color === color,
    );
    setSelectedVariant(firstAvailable || null);
  };

  const handleDeleteVariant = async () => {
    if (!selectedVariant?.id) return;

    const shouldDelete = window.confirm(
      `Delete variant: \"${selectedVariant.color || "N/A"} - ${selectedVariant.size || "N/A"}\"?`,
    );
    if (!shouldDelete) return;

    setIsDeletingVariant(true);
    try {
      await api.delete(`/inventory/variant/${selectedVariant.id}`);

      setItem((current) => {
        if (!current) return current;

        const nextVariants = (current.variants || []).filter(
          (variant) => variant.id !== selectedVariant.id,
        );

        if (nextVariants.length === 0) {
          setSelectedColor("");
          setSelectedVariant(null);
          return { ...current, variants: [], has_variants: false };
        }

        const nextVariant =
          nextVariants.find((variant) => variant.color === selectedColor) ||
          nextVariants[0];

        setSelectedColor(nextVariant?.color || "");
        setSelectedVariant(nextVariant || null);

        return {
          ...current,
          variants: nextVariants,
          has_variants: nextVariants.length > 0,
        };
      });

      toast.success("Variant deleted.");
    } catch (error) {
      toast.error(error?.message || "Failed to delete variant.");
    } finally {
      setIsDeletingVariant(false);
    }
  };

  const handleUpdateSuccess = (updatedItem) => {
    if (!updatedItem) {
      setIsEditModalOpen(false);
      return;
    }

    const previousColor = selectedColor;
    const previousSize = selectedVariant?.size;

    setItem(updatedItem);

    if (
      updatedItem?.has_variants &&
      Array.isArray(updatedItem?.variants) &&
      updatedItem.variants.length > 0
    ) {
      const matched = updatedItem.variants.find(
        (variant) =>
          variant.color === previousColor && variant.size === previousSize,
      );
      const fallback =
        updatedItem.variants.find((variant) => variant.is_default) ||
        updatedItem.variants[0];
      const target = matched || fallback;
      setSelectedColor(target?.color || "");
      setSelectedVariant(target || null);
    } else {
      setSelectedColor("");
      setSelectedVariant(null);
    }

    setIsEditModalOpen(false);
    toast.success("Product details updated.");
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    const shouldDelete = window.confirm("Delete entire product?");
    if (!shouldDelete) return;

    try {
      await api.delete(`/inventory/${id}`);
      toast.success("Product deleted.");
      router.push("/inventory/all");
    } catch (error) {
      toast.error(error?.message || "Failed to delete product.");
    }
  };

  const productAttributes = useMemo(() => {
    const specMap = new Map(
      (item?.specifications || []).map((entry) => [
        Number(entry.attributeId ?? entry.attribute_id),
        String(entry.value || "").trim(),
      ]),
    );

    if (categoryAttributes.length === 0) {
      return [];
    }

    return categoryAttributes
      .filter((attribute) => {
        const type = String(attribute.type || "").toLowerCase();
        return type === "text" || type === "number";
      })
      .map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        type: attribute.type,
        is_required: Boolean(attribute.is_required),
        value: specMap.get(Number(attribute.id)) || "",
      }));
  }, [categoryAttributes, item?.specifications]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-sm font-semibold text-slate-500">
        Product not found.
      </div>
    );
  }

  const defaultVariant =
    item.variants?.find((variant) => variant.is_default) ||
    item.variants?.[0] ||
    null;

  const activeVariant = selectedVariant || defaultVariant;

  const displayPrice =
    activeVariant?.variant_price ??
    activeVariant?.price ??
    item.base_price ??
    item.price ??
    0;

  const displayStock =
    activeVariant?.variant_stock ??
    activeVariant?.stock ??
    item.base_stock ??
    item.stock ??
    0;

  const displaySKU = activeVariant?.sku || item.base_sku || item.sku || "N/A";
  const displayImage =
    activeVariant?.variant_image || activeVariant?.images?.[0] || item.image;
  const displayDescription =
    item.description?.trim() || "No description available for this product.";

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in p-4 duration-500 sm:p-6 lg:p-8">
      <Link
        href="/inventory/all"
        className="group mb-6 inline-flex items-center gap-2 text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft
          size={20}
          className="transition-transform group-hover:-translate-x-1"
        />
        <span className="font-medium">Back to Inventory</span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProductSummaryCard
            item={item}
            displayImage={displayImage}
            displaySKU={displaySKU}
            displayDescription={displayDescription}
            uniqueColors={uniqueColors}
            selectedColor={selectedColor}
            availableSizes={availableSizes}
            selectedVariant={selectedVariant}
            onColorChange={handleColorChange}
            onSelectVariant={setSelectedVariant}
            isDeletingVariant={isDeletingVariant}
            onDeleteVariant={handleDeleteVariant}
            displayPrice={displayPrice}
            displayStock={displayStock}
          />
        </div>

        <div className="space-y-6">
          <InventoryActivityCard
            displayStock={Number(displayStock) || 0}
            totalVariants={item.variants?.length || 0}
          />

          <ProductAttributesCard attributes={productAttributes} />

          <InventoryActionsCard
            onEdit={() => setIsEditModalOpen(true)}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
      </div>

      <EditInventoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={item}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}
