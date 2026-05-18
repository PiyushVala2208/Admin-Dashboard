"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";

import Pagination from "@/components/Pagination";
import ProductSidebarFilter from "@/components/shop/productSidebarFilter";
import ProductHeader from "@/components/shop/ProductHeader";
import ProductGrid from "@/components/shop/ProductGrid";
import {
  dispatchCartSync,
  getWishlistItemKey,
  loadWishlist,
  saveWishlist,
} from "@/app/utils/browserStorage";

const COLOR_ATTRIBUTE_NAMES = new Set(["color", "colour"]);

const cleanText = (value) => String(value || "").trim();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getVariantColor = (variant = {}) => {
  const directColor = cleanText(variant.color || variant.variant_color);
  if (directColor) return directColor;

  const attributes = Array.isArray(variant.variant_attributes)
    ? variant.variant_attributes
    : [];
  const colorAttribute = attributes.find((entry) => {
    const normalizedName = cleanText(
      entry?.attributeName || entry?.attribute_name || entry?.name,
    ).toLowerCase();
    return COLOR_ATTRIBUTE_NAMES.has(normalizedName);
  });

  return cleanText(colorAttribute?.value);
};

const pickColorRepresentatives = (variants = []) => {
  const map = new Map();

  variants.forEach((variant, index) => {
    const color = getVariantColor(variant);
    const key = color ? color.toLowerCase() : `__variant_${variant?.id || index}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, variant);
      return;
    }

    if (variant?.is_default && !existing?.is_default) {
      map.set(key, variant);
    }
  });

  return Array.from(map.values());
};

const expandProductsToVariantCards = (products = []) =>
  (Array.isArray(products) ? products : []).flatMap((product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (variants.length === 0) {
      return [{ ...product, card_key: `${product.id}-default` }];
    }

    const representativeVariants = pickColorRepresentatives(variants);
    if (representativeVariants.length === 0) {
      return [{ ...product, card_key: `${product.id}-default` }];
    }

    return representativeVariants.map((variant, index) => {
      const variantColor = getVariantColor(variant) || cleanText(product.variant_color);
      const variantImage =
        cleanText(variant?.variant_image) ||
        cleanText(variant?.image) ||
        (Array.isArray(variant?.images)
          ? cleanText(variant.images.find((entry) => cleanText(entry)))
          : "") ||
        cleanText(product.image) ||
        cleanText(product.image_url);

      return {
        ...product,
        card_key: `${product.id}-${variant?.id ?? `${variantColor || "variant"}-${index}`}`,
        variant_id: variant?.id ?? null,
        variant_color: variantColor || null,
        variant_size: cleanText(variant?.size) || null,
        variant_image: variantImage || null,
        image: variantImage || product.image || product.image_url || null,
        variant_price: toNumber(
          variant?.variant_price ?? variant?.price,
          toNumber(product.starting_from_price ?? product.price, 0),
        ),
        variant_stock: toNumber(
          variant?.variant_stock ?? variant?.stock,
          toNumber(product.stock, 0),
        ),
        price: toNumber(
          variant?.variant_price ?? variant?.price,
          toNumber(product.starting_from_price ?? product.price, 0),
        ),
        stock: toNumber(
          variant?.variant_stock ?? variant?.stock,
          toNumber(product.stock, 0),
        ),
        has_variants: false,
        __variant_card: true,
      };
    });
  });

function ProductPageInner() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(1000000);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist = loadWishlist();
    setWishlist(savedWishlist);
  }, []);

  const buildWishlistItem = (product) => {
    const variants = product.variants || [];
    const isVariantCard = Boolean(product.__variant_card && product.variant_id);
    const fallbackVariant =
      (isVariantCard
        ? variants.find(
            (variant) => String(variant?.id) === String(product.variant_id),
          )
        : null) ||
      variants.find((variant) => variant.is_default) ||
      variants[0] ||
      (product.variant_id ||
      product.variant_color ||
      product.variant_size ||
      product.variant_image
        ? {
            id: product.variant_id,
            color: product.variant_color,
            size: product.variant_size,
            variant_image: product.variant_image,
            variant_price: product.default_variant_price ?? product.price,
            variant_stock: product.default_variant_stock ?? product.stock,
          }
        : null);

    const variationAttributesMap = new Map();
    variants.forEach((variant) => {
      (Array.isArray(variant?.variant_attributes)
        ? variant.variant_attributes
        : []
      ).forEach((entry) => {
        const attributeId = Number(entry?.attributeId ?? entry?.attribute_id);
        if (!Number.isInteger(attributeId) || attributeId <= 0) return;

        const fallbackName = COLOR_ATTRIBUTE_NAMES.has(
          cleanText(entry?.attributeName || entry?.attribute_name || entry?.name)
            .toLowerCase(),
        )
          ? "Color"
          : `Attribute ${attributeId}`;

        const attributeName =
          cleanText(entry?.attributeName || entry?.attribute_name || entry?.name) ||
          fallbackName;

        variationAttributesMap.set(attributeId, attributeName);
      });
    });

    const variationAttributeCount =
      variationAttributesMap.size > 0
        ? variationAttributesMap.size
        : variants.length > 1
          ? 2
          : 0;

    const hasVariants = Boolean(
      variationAttributeCount > 0 ||
        product.has_variants ||
        (product.variants?.length || 0) > 1,
    );

    const variantCardSelectedAttributes =
      isVariantCard && product.variant_color
        ? [
            {
              attributeId: -1,
              name: "Color",
              value: product.variant_color,
            },
          ]
        : [];

    const selectedAttributes = hasVariants ? variantCardSelectedAttributes : [];
    const selectedAttributeCount = selectedAttributes.length;
    const isSelectionComplete = hasVariants
      ? variationAttributeCount > 0 &&
        selectedAttributeCount >= variationAttributeCount
      : true;

    const basePrice = Number(
      product.variant_price ?? fallbackVariant?.variant_price ?? product.price ?? 0,
    );
    const baseStock = Number(
      product.variant_stock ?? fallbackVariant?.variant_stock ?? product.stock ?? 0,
    );
    const baseImage =
      product.variant_image ||
      fallbackVariant?.variant_image ||
      product.image ||
      product.image_url;

    return {
      id: product.id,
      name: product.name,
      category_name: product.category_name || product.category,
      image: baseImage,
      price: basePrice,
      stock: baseStock,
      variant_id: isSelectionComplete
        ? product.variant_id || fallbackVariant?.id || null
        : null,
      selectedColor: hasVariants
        ? product.variant_color || fallbackVariant?.color || null
        : null,
      selectedSize: hasVariants
        ? null
        : product.variant_size || fallbackVariant?.size || null,
      has_variants: hasVariants,
      variant_price: basePrice,
      variant_stock: baseStock,
      variant_image: baseImage,
      selectedAttributes,
      selectedAttributeCount,
      variationAttributeCount,
      isSelectionComplete,
      variants: variants
    };
  };

  useEffect(() => {
    if (categoryFilter && categories.length > 0) {
      const rawCategory = decodeURIComponent(categoryFilter)
        .trim()
        .toLowerCase();
      const exactMatch = categories.find((cat) => {
        if (typeof cat === "string") {
          return cat.trim().toLowerCase() === rawCategory;
        }

        if (!cat || typeof cat !== "object") {
          return false;
        }

        const slug =
          typeof cat.slug === "string" ? cat.slug.trim().toLowerCase() : "";
        const name =
          typeof cat.name === "string" ? cat.name.trim().toLowerCase() : "";

        return slug === rawCategory || name === rawCategory;
      });

      const matchedValue =
        typeof exactMatch === "string"
          ? exactMatch
          : exactMatch?.slug || exactMatch?.name || categoryFilter;

      setSelectedCategory([matchedValue]);
      setCurrentPage(1);
    }
  }, [categoryFilter, categories]);

  const hydrateProductsWithVariants = useCallback(async (items = []) => {
    const safeItems = Array.isArray(items) ? items : [];
    const needsHydration = safeItems.filter((item) => {
      if (!item || item.id == null) return false;
      const hasInlineVariants =
        Array.isArray(item.variants) && item.variants.length > 0;
      if (hasInlineVariants) return false;
      return Boolean(item.has_variants || Number(item.variant_count || 0) > 0);
    });

    if (needsHydration.length === 0) {
      return safeItems;
    }

    const detailResponses = await Promise.all(
      needsHydration.map(async (item) => {
        try {
          const detailRes = await api.get(`/products/${item.id}`);
          const detailProduct = detailRes?.data?.data || null;
          const detailVariants = Array.isArray(detailProduct?.variants)
            ? detailProduct.variants
            : [];
          return [String(item.id), detailVariants];
        } catch {
          return [String(item.id), []];
        }
      }),
    );

    const variantMap = new Map(detailResponses);
    return safeItems.map((item) => {
      const inlineVariants = Array.isArray(item.variants) ? item.variants : [];
      if (inlineVariants.length > 0) {
        return item;
      }

      const hydratedVariants = variantMap.get(String(item.id)) || [];
      return {
        ...item,
        variants: hydratedVariants,
      };
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const normalizedSelectedCategories = selectedCategory
        .map((cat) => {
          if (typeof cat === "string") {
            return cat;
          }

          if (cat && typeof cat === "object") {
            return cat.slug || cat.name || "";
          }

          return "";
        })
        .map((cat) => cat.trim())
        .filter(Boolean);

      const response = await api.get("/products", {
        params: {
          page: currentPage,
          limit,
          category:
            normalizedSelectedCategories.length > 0
              ? normalizedSelectedCategories.join(",")
              : undefined,
          sortBy,
          maxPrice: priceRange,
          search: searchQuery || undefined,
          includeVariants: true,
        },
      });

      if (response.data.success) {
        const rawProducts = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        const hydratedProducts = await hydrateProductsWithVariants(rawProducts);
        setProducts(expandProductsToVariantCards(hydratedProducts));
        setTotalPages(Number(response.data.pagination?.totalPages || 1));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    selectedCategory,
    sortBy,
    priceRange,
    limit,
    searchQuery,
    hydrateProductsWithVariants,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchProducts, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories");
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error("Categories fetch failed", err);
        toast.error("Unable to load categories.");
      }
    };
    fetchCategories();
  }, []);

  const toggleWishlist = (product) => {
    const savedWishlist = loadWishlist();
    const wishlistItem = buildWishlistItem(product);
    const wishlistKey = getWishlistItemKey(wishlistItem);
    const hasSameProduct = savedWishlist.some(
      (item) => getWishlistItemKey(item) === wishlistKey,
    );

    let updatedWishlist;
    if (hasSameProduct) {
      updatedWishlist = savedWishlist.filter(
        (item) => getWishlistItemKey(item) !== wishlistKey,
      );
    } else {
      updatedWishlist = [...savedWishlist, wishlistItem];
    }

    const result = saveWishlist(updatedWishlist);
    if (!result.ok) {
      toast.error(
        result.reason === "quota"
          ? "Wishlist storage is full. Please remove a few items and try again."
          : "We could not update your wishlist right now. Please try again.",
      );
      return;
    }

    setWishlist(result.items);
    dispatchCartSync();
  };

  const resetFilters = () => {
    setSelectedCategory([]);
    setPriceRange(1000000);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 bg-white">
      <ProductHeader
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
        setIsFilterOpen={setIsFilterOpen}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <ProductSidebarFilter
          categories={categories}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setCurrentPage={setCurrentPage}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        <main className="flex-1 min-h-125 relative">
          <ProductGrid
            products={products}
            loading={loading}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            resetFilters={resetFilters}
          />

          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 bg-white">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm font-semibold text-slate-500">
            Loading products...
          </div>
        </div>
      }
    >
      <ProductPageInner />
    </Suspense>
  );
}
