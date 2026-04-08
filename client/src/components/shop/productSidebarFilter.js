import { X } from "lucide-react";

export default function ProductSidebarFilter({
  isFilterOpen,
  setIsFilterOpen,
  selectedCategory,
  setSelectedCategory,
  setCurrentPage,
  priceRange,
  setPriceRange,
  categories,
}) {
  const handleCategoryChange = (cat) => {
    const isSelected = selectedCategory.includes(cat);
    let updatedCategories;

    if (isSelected) {
      updatedCategories = selectedCategory.filter((item) => item !== cat);
    } else {
      updatedCategories = [...selectedCategory, cat];
    }

    setSelectedCategory(updatedCategories);
    setCurrentPage(1);
  };

  return (
    <>
      <aside
        className={`
          fixed inset-0 z-110 bg-white p-8 lg:p-0 lg:relative lg:inset-auto lg:z-10 lg:bg-transparent lg:w-64 shrink-0 transition-all duration-300
          ${isFilterOpen ? "translate-x-0 opacity-100" : "-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100"}
        `}
      >
        <div className="flex lg:hidden justify-between items-center mb-8">
          <h2 className="text-xl font-serif italic text-[#4C1D95]">Filters</h2>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="p-2 bg-[#F5F3FF] rounded-full"
          >
            <X size={20} className="text-[#4C1D95]" />
          </button>
        </div>

        <div className="sticky top-32 space-y-10">
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4C1D95] mb-6 flex items-center justify-between">
              Categories
            </h3>
            <div className="space-y-3">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategory.some(
                        (s) => s.toLowerCase() === cat.toLowerCase(),
                      )}
                      onChange={() => handleCategoryChange(cat)}
                      className="w-4 h-4 accent-[#7C3AED] rounded border-gray-300 focus:ring-[#7C3AED]"
                    />
                    <span
                      className={`text-[11px] font-medium transition-colors uppercase tracking-wider ${
                        selectedCategory.includes(cat)
                          ? "text-[#7C3AED] font-bold"
                          : "text-[#4C1D95]/70"
                      } group-hover:text-[#7C3AED]`}
                    >
                      {cat}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-[10px] text-[#A78BFA] italic">
                  Loading categories...
                </p>
              )}

              {selectedCategory.length > 0 && (
                <button
                  onClick={() => setSelectedCategory([])}
                  className="text-[9px] font-bold text-[#A78BFA] uppercase mt-2 hover:text-[#7C3AED] transition-colors underline underline-offset-4"
                >
                  Clear All Filters ({selectedCategory.length})
                </button>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4C1D95] mb-4">
              Max Price:
              <span className="text-[#7C3AED] ml-1">₹{Number(priceRange)}</span>
            </h3>
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full accent-[#7C3AED] h-1.5 bg-[#DDD6FE] rounded-full appearance-none cursor-pointer"
            />
          </section>
        </div>
      </aside>

      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-[#4C1D95]/20 backdrop-blur-md z-100 lg:hidden transition-opacity duration-300"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </>
  );
}
