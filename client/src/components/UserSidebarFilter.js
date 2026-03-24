"use client";

export default function UserSidebarFilter({ activeFilters, setActiveFilters }) {
  const roles = ["Admin", "Manager", "User"];

  const toggleRole = (role) => {
    setActiveFilters((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-8">
      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
          Status Alerts
        </h3>
        <button
          onClick={() =>
            setActiveFilters((prev) => ({
              ...prev,
              inactiveOnly: !prev.inactiveOnly,
            }))
          }
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            activeFilters.inactiveOnly
              ? "bg-red-50 border-red-200 text-red-600 shadow-sm shadow-red-100"
              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-tight">
            Inactive Only
          </span>
          <div
            className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${activeFilters.inactiveOnly ? "bg-red-500" : "bg-slate-300"}`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${activeFilters.inactiveOnly ? "left-[18px]" : "left-0.5"}`}
            />
          </div>
        </button>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Account Roles
        </h3>
        <div className="space-y-1.5">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => toggleRole(role)} 
              className={`w-full text-left text-xs py-2.5 px-3 rounded-xl flex justify-between items-center transition-all ${
                activeFilters.roles.includes(role)
                  ? "bg-blue-50 text-blue-600 font-bold border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <span>{role}</span>
              {activeFilters.roles.includes(role) && (
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {(activeFilters.roles.length > 0 || activeFilters.inactiveOnly) && (
        <button
          onClick={() =>
            setActiveFilters({
              roles: [],
              inactiveOnly: false,
              category: [],
              criticalOnly: false,
            })
          }
          className="text-[10px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-tighter transition-colors"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
