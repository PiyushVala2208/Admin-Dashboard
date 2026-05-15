"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Heart,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Star,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";
import {
  dispatchCartSync,
  getCartItemKey,
  getWishlistItemKey,
  loadCart,
  loadWishlist,
  saveCart,
  saveWishlist,
} from "@/app/utils/browserStorage";
import ImageGallery from "@/components/shop/ImageGallery";
import VariantPicker from "@/components/shop/VariantPicker";
import SpecificationTable from "@/components/shop/SpecificationTable";
import { normalizeVariant } from "@/app/(shop)/products/[id]/utils";

const getFallbackImage = () =>
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600";

const buildVariationAttributes = (
  variants = [],
  attributeDefinitionMap = new Map(),
) => {
  const optionsById = new Map();

  variants.forEach((variant) => {
    (variant.variant_attributes || []).forEach((entry) => {
      const attributeId = Number(entry.attributeId ?? entry.attribute_id);
      if (!Number.isInteger(attributeId) || attributeId <= 0) return;

      const value = String(entry.value || "").trim();
      if (!value) return;

      if (!optionsById.has(attributeId)) {
        optionsById.set(attributeId, new Set());
      }
      optionsById.get(attributeId).add(value);
    });
  });

  return Array.from(optionsById.entries())
    .map(([attributeId, optionSet]) => {
      const definition = attributeDefinitionMap.get(attributeId);
      return {
        attributeId,
        name: definition?.name || `Attribute ${attributeId}`,
        options: Array.from(optionSet),
      };
    })
    .sort((a, b) => a.attributeId - b.attributeId);
};

const findMatchingVariant = (
  variants,
  selectedOptions,
  variationAttributes,
  preferredVariantId = null,
) => {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  const preferredVariant =
    preferredVariantId == null
      ? null
      : variants.find(
          (variant) =>
            String(variant?.id ?? "") === String(preferredVariantId),
        ) || null;

  if (!Array.isArray(variationAttributes) || variationAttributes.length === 0) {
    return (
      preferredVariant ||
      variants.find((variant) => variant.is_default) ||
      variants[0]
    );
  }

  const fullySelected = variationAttributes.every(
    (attribute) => selectedOptions[attribute.attributeId],
  );

  const matches = variants.filter((variant) => {
    const map = new Map(
      (variant.variant_attributes || []).map((entry) => [
        Number(entry.attributeId ?? entry.attribute_id),
        String(entry.value || "").trim(),
      ]),
    );

    return variationAttributes.every((attribute) => {
      const selectedValue = selectedOptions[attribute.attributeId];
      if (!selectedValue) return true;
      return map.get(attribute.attributeId) === selectedValue;
    });
  });
  const preferredMatch =
    preferredVariant == null
      ? null
      : matches.find(
          (variant) =>
            String(variant?.id ?? "") === String(preferredVariantId),
        ) || null;

  if (fullySelected) {
    return matches[0] || preferredMatch || null;
  }

  if (preferredMatch) {
    return preferredMatch;
  }

  return (
    matches.find((variant) => variant.is_default) ||
    matches[0] ||
    variants.find((variant) => variant.is_default) ||
    variants[0]
  );
};

const getMatchingVariants = (variants, selectedOptions, variationAttributes) => {
  if (!Array.isArray(variants) || variants.length === 0) return [];
  if (!Array.isArray(variationAttributes) || variationAttributes.length === 0) {
    return variants;
  }

  return variants.filter((variant) => {
    const map = new Map(
      (variant.variant_attributes || []).map((entry) => [
        Number(entry.attributeId ?? entry.attribute_id),
        String(entry.value || "").trim(),
      ]),
    );

    return variationAttributes.every((attribute) => {
      const selectedValue = selectedOptions[attribute.attributeId];
      if (!selectedValue) return true;
      return map.get(attribute.attributeId) === selectedValue;
    });
  });
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const preferredVariantId = useMemo(() => {
    const rawVariant = String(searchParams.get("variant") || "").trim();
    return rawVariant || null;
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchProduct = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/products/${id}`);
        const nextProduct = response.data?.data || response.data;

        if (!active) return;
        setProduct(nextProduct || null);

        const wishlistItems = loadWishlist();
        setIsWishlisted(
          wishlistItems.some(
            (item) => String(item.id) === String(nextProduct?.id),
          ),
        );
      } catch (error) {
        if (!active) return;
        toast.error(error?.message || "Unable to load product details.");
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const normalizedVariants = useMemo(() => {
    if (!Array.isArray(product?.variants)) return [];
    return product.variants.map((variant, index) =>
      normalizeVariant(variant, index),
    );
  }, [product?.variants]);

  const attributeDefinitionMap = useMemo(
    () =>
      new Map(
        (product?.attribute_definitions || []).map((definition) => [
          Number(definition.id),
          definition,
        ]),
      ),
    [product?.attribute_definitions],
  );

  const variationAttributes = useMemo(
    () => buildVariationAttributes(normalizedVariants, attributeDefinitionMap),
    [attributeDefinitionMap, normalizedVariants],
  );

  const preferredVariant = useMemo(() => {
    if (!preferredVariantId) return null;
    return (
      normalizedVariants.find(
        (variant) => String(variant?.id ?? "") === String(preferredVariantId),
      ) || null
    );
  }, [normalizedVariants, preferredVariantId]);

  const optionAvailability = useMemo(() => {
    const availability = {};
    variationAttributes.forEach((attribute) => {
      const optionMap = {};
      attribute.options.forEach((option) => {
        optionMap[option] = false;
      });
      availability[attribute.attributeId] = optionMap;
    });

    normalizedVariants.forEach((variant) => {
      if (Number(variant.stock) <= 0) return;
      const attributeMap = new Map(
        (variant.variant_attributes || []).map((entry) => [
          Number(entry.attributeId ?? entry.attribute_id),
          String(entry.value || "").trim(),
        ]),
      );

      variationAttributes.forEach((attribute) => {
        const optionValue = attributeMap.get(attribute.attributeId);
        if (!optionValue) return;

        const matchesSelection = variationAttributes.every((other) => {
          if (other.attributeId === attribute.attributeId) return true;
          const selectedValue = selectedOptions[other.attributeId];
          if (!selectedValue) return true;
          return attributeMap.get(other.attributeId) === selectedValue;
        });

        if (matchesSelection && availability[attribute.attributeId]) {
          availability[attribute.attributeId][optionValue] = true;
        }
      });
    });

    return availability;
  }, [normalizedVariants, selectedOptions, variationAttributes]);

  const isSizeAttribute = (name = "") => /size/i.test(String(name || ""));
  const isColorAttribute = (name = "") =>
    /color|colour/i.test(String(name || ""));

  useEffect(() => {
    if (!product) return;

    if (variationAttributes.length === 0) {
      setSelectedOptions({});
      return;
    }

    const defaultVariant =
      preferredVariant ||
      normalizedVariants.find((variant) => variant.is_default) ||
      normalizedVariants[0];

    const nextOptions = {};
    variationAttributes.forEach((attribute) => {
      if (!isColorAttribute(attribute.name)) return;
      const matched = (defaultVariant?.variant_attributes || []).find(
        (entry) =>
          Number(entry.attributeId ?? entry.attribute_id) ===
          attribute.attributeId,
      );
      if (matched?.value) {
        nextOptions[attribute.attributeId] = String(matched.value);
      }
    });

    setSelectedOptions(nextOptions);
  }, [product, normalizedVariants, preferredVariant, variationAttributes]);

  const activeVariant = useMemo(
    () =>
      findMatchingVariant(
        normalizedVariants,
        selectedOptions,
        variationAttributes,
        preferredVariantId,
      ),
    [normalizedVariants, preferredVariantId, selectedOptions, variationAttributes],
  );

  const isSelectionComplete = useMemo(
    () =>
      variationAttributes.length === 0 ||
      variationAttributes.every(
        (attribute) => Boolean(selectedOptions[attribute.attributeId]),
      ),
    [selectedOptions, variationAttributes],
  );

  const matchingVariants = useMemo(
    () =>
      getMatchingVariants(
        normalizedVariants,
        selectedOptions,
        variationAttributes,
      ),
    [normalizedVariants, selectedOptions, variationAttributes],
  );

  const variantSpecificStock = Number(activeVariant?.stock ?? 0);
  const aggregateMatchingStock = matchingVariants.reduce(
    (sum, variant) => sum + Math.max(0, Number(variant?.stock ?? 0)),
    0,
  );
  const displayPrice = Number(
    activeVariant?.price ?? product?.starting_from_price ?? product?.price ?? 0,
  );
  const displayStock = Number(
    variationAttributes.length > 0
      ? isSelectionComplete
        ? variantSpecificStock
        : aggregateMatchingStock
      : activeVariant?.stock ?? product?.stock ?? 0,
  );
  const isOutOfStock = displayStock <= 0;
  const showVariantLowStock = isSelectionComplete && variationAttributes.length > 0;
  const isLowStock =
    showVariantLowStock &&
    variantSpecificStock > 0 &&
    variantSpecificStock <= 5;

  const galleryImages = useMemo(() => {
    const normalizeList = (list = []) =>
      list.map((entry) => String(entry || "").trim()).filter(Boolean);

    const activeVariantImages = normalizeList([
      ...(Array.isArray(activeVariant?.images) ? activeVariant.images : []),
      activeVariant?.variant_image,
    ]);

    const allVariantImages = normalizedVariants.flatMap((variant) =>
      normalizeList([
        ...(Array.isArray(variant?.images) ? variant.images : []),
        variant?.variant_image,
      ]),
    );

    const fallbackList = normalizeList([product?.image, product?.image_url]);

    const merged = [
      ...new Set([...activeVariantImages, ...allVariantImages, ...fallbackList]),
    ];
    return merged.length > 0 ? merged : [getFallbackImage()];
  }, [
    activeVariant?.images,
    activeVariant?.variant_image,
    normalizedVariants,
    product?.image,
    product?.image_url,
  ]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [activeVariant?.id]);

  useEffect(() => {
    setSelectedQuantity(1);
  }, [activeVariant?.id, id]);

  useEffect(() => {
    if (!product) return;

    const wishlistItems = loadWishlist();
    const selectedVariantId = activeVariant?.id ?? null;
    setIsWishlisted(
      wishlistItems.some((item) => {
        if (String(item.id) !== String(product.id)) return false;
        if (item.variant_id == null) return true;
        if (selectedVariantId == null) return true;
        return String(item.variant_id ?? "") === String(selectedVariantId);
      }),
    );
  }, [activeVariant?.id, product]);

  const technicalSpecs = useMemo(() => {
    const specifications = Array.isArray(product?.specifications)
      ? product.specifications
      : [];
    const variationIdSet = new Set(
      variationAttributes.map((entry) => entry.attributeId),
    );

    return specifications.filter(
      (entry) =>
        !variationIdSet.has(Number(entry.attributeId ?? entry.attribute_id)),
    );
  }, [product?.specifications, variationAttributes]);

  const handleOptionChange = (attributeId, value) => {
    setSelectedOptions((current) => ({
      ...current,
      [attributeId]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    if (!isSelectionComplete) {
      toast.error("Please select all required options first.");
      return;
    }

    const itemKey = getCartItemKey({
      id: product.id,
      variant_id: activeVariant?.id || null,
    });

    const selectedAttributes = variationAttributes
      .map((attribute) => {
        const value = selectedOptions[attribute.attributeId];
        if (!value) return null;
        return {
          attributeId: attribute.attributeId,
          name: attribute.name || `Attribute ${attribute.attributeId}`,
          value: String(value).trim(),
        };
      })
      .filter(Boolean);

    const nextCart = [...loadCart()];
    const existingIndex = nextCart.findIndex(
      (item) => getCartItemKey(item) === itemKey,
    );

    const nextItem = {
      id: product.id,
      name: product.name,
      category: product.category_name || product.category,
      variant_id: activeVariant?.id || null,
      selectedColor:
        selectedOptions[
          variationAttributes.find((attribute) =>
            ["color", "colour"].includes(attribute.name.toLowerCase()),
          )?.attributeId
        ] || null,
      selectedSize:
        selectedOptions[
          variationAttributes.find((attribute) =>
            isSizeAttribute(attribute.name),
          )?.attributeId
        ] || null,
      price: displayPrice,
      quantity: selectedQuantity,
      stock: displayStock,
      image: galleryImages[0],
      variant_image: galleryImages[0],
      has_variants: variationAttributes.length > 0,
      variants: normalizedVariants,
      selectedAttributes,
      selectedAttributeCount: selectedAttributes.length,
      variationAttributeCount: variationAttributes.length,
    };

    if (existingIndex > -1) {
      const currentQty = Number(nextCart[existingIndex].quantity || 1);
      nextCart[existingIndex] = {
        ...nextCart[existingIndex],
        quantity: Math.min(currentQty + selectedQuantity, displayStock),
      };
    } else {
      nextCart.push(nextItem);
    }

    const result = saveCart(nextCart);
    if (!result.ok) {
      toast.error("Unable to update cart right now.");
      return;
    }

    dispatchCartSync();
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 1600);
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    const baseWishlist = loadWishlist();
    const selectedAttributes = variationAttributes
      .map((attribute) => {
        const value = selectedOptions[attribute.attributeId];
        if (!value) return null;
        return {
          attributeId: attribute.attributeId,
          name: attribute.name || `Attribute ${attribute.attributeId}`,
          value: String(value).trim(),
        };
      })
      .filter(Boolean);
    const variationAttributeCount = variationAttributes.length;
    const selectedAttributeCount = selectedAttributes.length;
    const isWishlistSelectionComplete =
      variationAttributeCount === 0 ||
      selectedAttributeCount >= variationAttributeCount;
    const wishlistEntry = {
      id: product.id,
      name: product.name,
      category_name: product.category_name || product.category,
      image: galleryImages[0],
      price: displayPrice,
      stock: displayStock,
      variant_id: isWishlistSelectionComplete ? activeVariant?.id || null : null,
      selectedColor:
        selectedOptions[
          variationAttributes.find((attribute) =>
            ["color", "colour"].includes(attribute.name.toLowerCase()),
          )?.attributeId
        ] || null,
      selectedSize:
        selectedOptions[
          variationAttributes.find((attribute) =>
            isSizeAttribute(attribute.name),
          )?.attributeId
        ] || null,
      has_variants: variationAttributes.length > 0,
      variant_price: displayPrice,
      variant_stock: displayStock,
      variant_image: galleryImages[0],
      variants: normalizedVariants,
      selectedAttributes,
      selectedAttributeCount,
      variationAttributeCount,
      isSelectionComplete: isWishlistSelectionComplete,
    };

    const targetKey = getWishlistItemKey(wishlistEntry);
    const alreadyExists = baseWishlist.some(
      (entry) => getWishlistItemKey(entry) === targetKey,
    );

    const nextWishlist = alreadyExists
      ? baseWishlist.filter((entry) => getWishlistItemKey(entry) !== targetKey)
      : [
          ...baseWishlist.filter(
            (entry) =>
              !(
                String(entry.id) === String(product.id) &&
                entry.variant_id == null
              ),
          ),
          wishlistEntry,
        ];

    const result = saveWishlist(nextWishlist);
    if (!result.ok) {
      toast.error("Unable to update wishlist right now.");
      return;
    }

    dispatchCartSync();
    setIsWishlisted(
      nextWishlist.some((entry) => {
        if (String(entry.id) !== String(product.id)) return false;
        if (entry.variant_id == null) return true;
        if (activeVariant?.id == null) return true;
        return String(entry.variant_id) === String(activeVariant.id);
      }),
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-2xl font-serif italic text-slate-400">
        Product not found.
      </div>
    );
  }

  const displayImage =
    galleryImages[Math.min(activeImageIndex, galleryImages.length - 1)];

  return (
    <div className="mx-auto max-w-6xl bg-white px-4 py-8 md:px-8 md:py-12">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-purple-600"
      >
        <ArrowLeft size={14} /> Back to Collection
      </button>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <ImageGallery
          productName={product.name}
          displayImage={displayImage}
          galleryImages={galleryImages}
          activeImageIndex={activeImageIndex}
          onSelectImage={setActiveImageIndex}
          isOutOfStock={isOutOfStock}
          fallbackImage={getFallbackImage()}
        />

        <div className="flex flex-col pt-2">
          <div className="mb-5 border-b border-slate-100 pb-5">
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.25em] text-purple-600">
              {product.category_name || product.category}
            </p>
            <h1 className="mb-3 text-3xl leading-tight text-slate-900 md:text-4xl">
              {product.name}
            </h1>

            {isLowStock ? (
              <span className="animate-pulse rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-orange-600">
                Only {variantSpecificStock} left in stock
              </span>
            ) : null}

            <div className="mb-6 mt-3 flex items-baseline gap-3">
              <span
                className={`text-2xl font-black tracking-tight ${
                  isOutOfStock ? "text-slate-400" : "text-slate-900"
                }`}
              >
                Rs {displayPrice.toLocaleString()}
              </span>
            </div>

            <VariantPicker
              variationAttributes={variationAttributes}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
              isOutOfStock={isOutOfStock}
              isSelectionComplete={isSelectionComplete}
              selectedQuantity={selectedQuantity}
              onQuantityChange={setSelectedQuantity}
              displayStock={displayStock}
              optionAvailability={optionAvailability}
            />
          </div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !isSelectionComplete}
              className={`flex flex-[2] items-center justify-center gap-2.5 rounded-xl py-4 text-[11px] font-black uppercase tracking-widest shadow-lg transition-all ${
                isOutOfStock || !isSelectionComplete
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : isAddedToCart
                    ? "bg-green-600 text-white"
                    : "bg-slate-900 text-white hover:bg-purple-600 active:scale-95"
              }`}
            >
              {isOutOfStock ? (
                <>
                  <Ban size={16} /> Sold Out
                </>
              ) : !isSelectionComplete ? (
                <>
                  <Ban size={16} /> Select Options
                </>
              ) : isAddedToCart ? (
                <>
                  <CheckCircle2 size={16} /> Added ({selectedQuantity})
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`flex flex-1 hover:bg-red-50 items-center justify-center gap-2.5 rounded-xl border border-slate-200 py-4 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 text-red-500"
                  : "bg-white text-slate-700"
              }`}
            >
              <Heart size={16} className={isWishlisted ? "fill-red-500" : ""} />
              Wishlist
            </button>
          </div>

          <SpecificationTable
            technicalSpecs={technicalSpecs}
            attributeDefinitionMap={attributeDefinitionMap}
          />

          <div className="mb-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                <Truck size={18} />
              </div>
              <p className="text-[8px] font-bold uppercase tracking-tighter text-slate-500">
                Fast Delivery
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <ShieldCheck size={18} />
              </div>
              <p className="text-[8px] font-bold uppercase tracking-tighter text-slate-500">
                100% Original
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                <RotateCcw size={18} />
              </div>
              <p className="text-[8px] font-bold uppercase tracking-tighter text-slate-500">
                14 Days Return
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
