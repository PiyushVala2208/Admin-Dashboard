import { Check, XCircle } from "lucide-react";

export default function SidebarFilter({
  categories = [],
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

  const clearFilters = () => {
    setActiveFilters({
      category: [],
      criticalOnly: false,
    });
  };

  const hasActiveFilters =
    activeFilters.category.length > 0 || activeFilters.criticalOnly;

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Quick Alerts
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] flex items-center gap-1 text-red-500 hover:text-red-600 font-bold uppercase transition-colors"
          >
            <XCircle size={12} /> Clear
          </button>
        )}
      </div>

      <div>
        <button
          onClick={() =>
            setActiveFilters((prev) => ({
              ...prev,
              criticalOnly: !prev.criticalOnly,
            }))
          }
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            activeFilters.criticalOnly
              ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
          }`}
        >
          <span className="text-xs font-bold uppercase">Low Stock Only</span>
          <div
            className={`w-8 h-4 rounded-full relative transition-colors ${activeFilters.criticalOnly ? "bg-red-500" : "bg-slate-300"}`}
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
          {categories.map((cat) => {
            const isSelected = activeFilters.category.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`w-full text-left text-xs py-2.5 px-3 rounded-lg flex justify-between items-center transition-all ${
                  isSelected
                    ? "bg-purple-50 text-purple-600 font-bold shadow-sm ring-1 ring-purple-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {cat}
                {isSelected && <Check size={14} className="text-purple-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
