export default function SidebarFilter({
  categories,
  activeFilters,
  setActiveFilters,
}) {
  const toggleCategory = (cat) => {
    setActiveFilters((prev) => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter((c) => c !== cat)
        : [...prev.category, cat],
    }));
  };

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-8">
      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
          Quick Alerts
        </h3>
        <button
          onClick={() =>
            setActiveFilters((prev) => ({
              ...prev,
              criticalOnly: !prev.criticalOnly,
            }))
          }
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            activeFilters.criticalOnly
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-slate-50 border-slate-100 text-slate-500"
          }`}
        >
          <span className="text-xs font-bold uppercase">Low Stock Only</span>
          <div
            className={`w-8 h-4 rounded-full relative ${activeFilters.criticalOnly ? "bg-red-500" : "bg-slate-300"}`}
          >
            <div
              className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${activeFilters.criticalOnly ? "left-5" : "left-1"}`}
            />
          </div>
        </button>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`w-full text-left text-xs py-2 px-3 rounded-lg flex justify-between items-center transition-all ${
                activeFilters.category.includes(cat)
                  ? "bg-purple-50 text-purple-600 font-bold"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
