"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Package,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  {
    name: "Users",
    icon: <Users size={20} />,
    submenu: [
      { name: "All Users", path: "/users/all" },
      { name: "Add User", path: "/users/add" },
      { name: "Roles", path: "/users/roles" },
    ],
  },
  {
    name: "Inventory",
    icon: <Package size={20} />,
    submenu: [
      { name: "All Items", path: "/inventory/all" },
      { name: "Add Item", path: "/inventory/add" },
    ],
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    path: "/settings",
  },
];

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const sidebarRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      setUserRole(user.role?.toLowerCase() || "user");
    }
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.clear();
    window.location.replace("/");
  };

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path);
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((i) => i !== menuName)
        : [...prev, menuName],
    );
  };

  if (userRole && userRole !== "admin") return null;

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-5 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-slate-950 text-slate-300 flex flex-col transition-all duration-500 ease-in-out border-r border-slate-800/50
          ${isCollapsed ? "w-20" : "w-72"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-5 h-20 border-b border-slate-800/50">
          {(!isCollapsed || isMobileOpen) && (
            <h1 className="text-xl font-bold tracking-tight text-white animate-in fade-in duration-500">
              Admin<span className="text-blue-500 italic">Core</span>
            </h1>
          )}
          <button
            onClick={() =>
              isMobileOpen
                ? setIsMobileOpen(false)
                : setIsCollapsed(!isCollapsed)
            }
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            {isMobileOpen ? (
              <X size={22} />
            ) : isCollapsed ? (
              <PanelLeftOpen size={22} />
            ) : (
              <PanelLeftClose size={22} />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const hasSubActive = item.submenu?.some((sub) =>
              isActive(sub.path),
            );
            const isMenuOpen = openMenus.includes(item.name);

            return (
              <div key={item.name} className="relative">
                {!item.submenu ? (
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group
                      ${
                        isActive(item.path)
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          : "hover:bg-slate-800/50 hover:text-white"
                      } 
                      ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
                  >
                    <span
                      className={`${isActive(item.path) ? "scale-110" : "group-hover:scale-110"} transition-transform shrink-0`}
                    >
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 group
                        ${hasSubActive ? "text-blue-400 bg-blue-500/5" : "hover:bg-slate-800/50"} 
                        ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="group-hover:scale-110 transition-transform shrink-0">
                          {item.icon}
                        </span>
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="font-medium">{item.name}</span>
                        )}
                      </div>
                      {(!isCollapsed || isMobileOpen) && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out 
                      ${isMenuOpen && (!isCollapsed || isMobileOpen) ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                    >
                      <div className="ml-9 border-l border-slate-800 space-y-1">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className={`block py-2 px-4 rounded-lg text-sm transition-all relative
                              ${
                                isActive(sub.path)
                                  ? "text-blue-400 font-semibold before:content-[''] before:absolute before:left-[-1px] before:w-[2px] before:h-4 before:bg-blue-500 before:top-1/2 before:-translate-y-1/2"
                                  : "text-slate-500 hover:text-slate-200"
                              }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div
            className={`pt-4 ${isCollapsed && !isMobileOpen ? "flex justify-center" : ""}`}
          >
            <Link href="/" className="inline-block w-full">
              <button
                className={`flex items-center bg-slate-800/50 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 group overflow-hidden
                ${isCollapsed && !isMobileOpen ? "p-3 justify-center w-12 h-12" : "px-5 py-3 w-full gap-3"}`}
                title={isCollapsed ? "Visit My Shop" : ""}
              >
                <ShoppingCart
                  size={20}
                  className="shrink-0 group-hover:rotate-12 transition-transform"
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                    Visit My Shop
                  </span>
                )}
                {(!isCollapsed || isMobileOpen) && (
                  <ArrowUpRight
                    size={16}
                    className="ml-auto opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                )}
              </button>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 group
              ${isCollapsed && !isMobileOpen ? "justify-center" : "gap-3"}`}
          >
            <LogOut
              size={20}
              className="shrink-0 group-hover:-translate-x-1 transition-transform"
            />
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
