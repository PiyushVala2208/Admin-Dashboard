"use client";
import { useEffect, useState, useCallback } from "react";
import { Filter, Loader2, Search, X, Heart } from "lucide-react";
import Pagination from "@/components/Pagination";
import ProductSidebarFilter from "@/components/shop/productSidebarFilter";
import axios from "axios";
import Link from "next/link";

export default function ProductPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  const [wishlist, setWishlist] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(200000);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  const toggleWishlist = (product) => {
    let updatedWishlist;
    const isExist = wishlist.find((item) => item.id === product.id);

    if (isExist) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
    } else {
      updatedWishlist = [...wishlist, product];
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/products", {
        params: {
          page: currentPage,
          limit: limit,
          category:
            selectedCategory.length > 0
              ? selectedCategory.join(",")
              : undefined,
          sortBy: sortBy,
          maxPrice: priceRange,
          search: searchQuery || undefined,
        },
      });

      if (response.data.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, sortBy, priceRange, limit, searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/products/categories",
        );
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Categories fetch failed", err);
      }
    };
    fetchCategories();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 bg-white">
      <header className="flex flex-col gap-6 mb-8 md:mb-12">
        <div className="flex justify-between items-end min-h-15 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif italic text-[#4C1D95]">
              The <span className="text-[#8B5CF6]">Full</span> Curation
            </h1>
          </div>

          <div className="hidden md:flex relative max-w-xs w-full group">
            <Search
              size={16}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? "text-[#7C3AED]" : "text-[#4C1D95]/30"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products..."
              className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl py-3 pl-12 pr-10 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED]/20 focus:bg-white transition-all outline-none placeholder:text-[#4C1D95]/30 text-[#4C1D95]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#DDD6FE] rounded-full text-[#4C1D95]/50"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-[#4C1D95] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
          >
            <Filter size={14} /> Filters
          </button>
        </div>

        <div className="md:hidden relative w-full group">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4C1D95]/30"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products..."
            className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl py-2.5 pl-10 pr-4 text-[11px] outline-none"
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#DDD6FE]/50 pt-6">
          <div className="flex items-center gap-3 md:gap-5 justify-end">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-[#DDD6FE] text-[#4C1D95] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED] outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low-High</option>
              <option value="price_high">Price: High-Low</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-150">
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
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-start justify-center pt-20 transition-opacity">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#7C3AED]" size={48} />
                <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest">
                  Updating Curation...
                </p>
              </div>
            </div>
          )}

          <div
            className={`grid gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16 transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"} grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`}
          >
            {products.length > 0
              ? products.map((product) => {
                  const isInWishlist = wishlist.some(
                    (item) => item.id === product.id,
                  );
                  return (
                    <Link href={`/shop/products/${product.id}`} key={product.id}>
                      <article className="group cursor-pointer relative">
                        <div className="absolute top-4 right-4 z-20 md:top-6 md:right-6">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product);
                            }}
                            className={`p-2.5 md:p-3 backdrop-blur-md rounded-2xl shadow-sm border transition-all duration-300 active:scale-90 ${
                              isInWishlist
                                ? "bg-red-50 border-red-100 text-red-500 shadow-red-100"
                                : "bg-white/90 border-white/50 text-[#4C1D95]/30 hover:text-red-500"
                            }`}
                          >
                            <Heart
                              size={18}
                              className={`${isInWishlist ? "fill-red-500" : "fill-transparent"} transition-all duration-300`}
                            />
                          </button>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-[#F5F3FF] transition-all duration-500 shadow-sm group-hover:shadow-xl aspect-3/4">
                          <img
                            src={
                              product.image ||
                              product.image_url ||
                              `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=400&h=500&auto=format&fit=crop`
                            }
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/400x600?text=Image+Not+Found";
                            }}
                          />
                          <div className="absolute inset-0 bg-[#4C1D95]/0 group-hover:bg-[#4C1D95]/5 transition-colors duration-500" />
                          <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-[#7C3AED] rounded-full shadow-sm z-10">
                            {product.stock <= 5 ? "Low Stock" : "Exclusive"}
                          </span>
                        </div>

                        <div className="mt-5 md:mt-7">
                          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#A78BFA] mb-1.5">
                            {product.category}
                          </p>
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-[#4C1D95] italic text-xl md:text-2xl group-hover:text-[#7C3AED] transition-colors leading-tight">
                              {product.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[#4C1D95] font-bold text-lg tracking-tight">
                              ₹{Number(product.price).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })
              : !loading && (
                  <div className="col-span-full flex flex-col items-center justify-center py-40 border-2 border-dashed border-[#DDD6FE] rounded-[3rem] bg-[#F5F3FF]/30">
                    <p className="font-serif italic text-2xl text-[#4C1D95]/40 mb-2">
                      No items found
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory([]);
                        setPriceRange(200000);
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#4C1D95]/80 hover:text-[#7C3AED] underline underline-offset-4"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
}
