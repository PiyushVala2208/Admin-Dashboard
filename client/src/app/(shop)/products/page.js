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
  loadWishlist,
  saveWishlist,
} from "@/app/utils/browserStorage";

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
    const fallbackVariant =
      product.variants?.find((variant) => variant.is_default) ||
      product.variants?.[0] ||
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

    const hasVariants = Boolean(
      product.has_variants || (product.variants?.length || 0) > 1,
    );
    const basePrice = Number(
      fallbackVariant?.variant_price ?? product.price ?? 0,
    );
    const baseStock = Number(
      fallbackVariant?.variant_stock ?? product.stock ?? 0,
    );
    const baseImage =
      fallbackVariant?.variant_image || product.image || product.image_url;

    return {
      id: product.id,
      name: product.name,
      category_name: product.category_name || product.category,
      image: baseImage,
      price: basePrice,
      stock: baseStock,
      variant_id: hasVariants ? null : fallbackVariant?.id || null,
      selectedColor: hasVariants
        ? null
        : fallbackVariant?.color || product.variant_color || null,
      selectedSize: hasVariants
        ? null
        : fallbackVariant?.size || product.variant_size || null,
      has_variants: hasVariants,
      variant_price: basePrice,
      variant_stock: baseStock,
      variant_image: baseImage,
      selectedAttributes: [],
      selectedAttributeCount: 0,
      variationAttributeCount: 0,
      isSelectionComplete: !hasVariants,
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
        },
      });

      if (response.data.success) {
        setProducts(
          Array.isArray(response.data.data) ? response.data.data : [],
        );
        setTotalPages(Number(response.data.pagination?.totalPages || 1));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, sortBy, priceRange, limit, searchQuery]);

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
    const hasSameProduct = savedWishlist.some(
      (item) => String(item.id) === String(product.id),
    );

    let updatedWishlist;
    if (hasSameProduct) {
      updatedWishlist = savedWishlist.filter(
        (item) => String(item.id) !== String(product.id),
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
