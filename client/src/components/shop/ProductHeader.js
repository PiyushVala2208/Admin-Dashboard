import { Search, X, Filter } from "lucide-react";

export default function ProductHeader({
  selectedCategory,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  setIsFilterOpen,
  sortBy,
  setSortBy,
}) {
  return (
    <header className="flex flex-col gap-6 mb-8 md:mb-10">
      <div className="flex justify-between items-end min-h-12 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-[#4C1D95]">
            {selectedCategory.length === 1 ? (
              <>
                The{" "}
                <span className="text-[#8B5CF6] capitalize">
                  {selectedCategory[0]}
                </span>{" "}
                Edit
              </>
            ) : (
              <>
                The <span className="text-[#8B5CF6]">Full</span> Curation
              </>
            )}
          </h1>
        </div>

        <div className="hidden md:flex relative max-w-70 w-full group">
          <Search
            size={14}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              searchQuery ? "text-[#7C3AED]" : "text-[#4C1D95]/30"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products..."
            className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl py-2.5 pl-10 pr-10 text-[11px] font-medium focus:ring-2 focus:ring-[#7C3AED]/20 focus:bg-white transition-all outline-none placeholder:text-[#4C1D95]/30 text-[#4C1D95]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#DDD6FE] rounded-full text-[#4C1D95]/50"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 bg-[#4C1D95] text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md active:scale-95 transition-transform"
        >
          <Filter size={12} /> Filters
        </button>
      </div>

      <div className="md:hidden relative w-full">
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
          className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl py-2 pl-10 pr-4 text-[11px] outline-none"
        />
      </div>

      <div className="flex items-center justify-between border-t border-[#DDD6FE]/50 pt-5">
        <div className="flex items-center gap-3 justify-end w-full">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-[#DDD6FE] text-[#4C1D95] text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg focus:ring-1 focus:ring-[#7C3AED] outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low-High</option>
            <option value="price_high">Price: High-Low</option>
          </select>
        </div>
      </div>
    </header>
  );
}
