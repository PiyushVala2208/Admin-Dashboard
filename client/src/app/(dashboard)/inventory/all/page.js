"use client";
import { useState, useEffect, useMemo } from "react";
import { Package, Search, Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import EditInventoryModal from "@/components/EditInventoryModal";
import SidebarFilter from "@/components/InvantorySidebarFilter";
import Pagination from "@/components/Pagination";
import InventoryTable from "@/components/InventoryTable";
import { useSettings } from "@/context/SettingsContext";

export default function AllItemsPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { currencySymbol } = useSettings();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    criticalOnly: false,
  });

  const getStatus = (stock) => {
    if (stock > 10)
      return {
        label: "In Stock",
        color: "bg-green-100 text-green-700 border-green-200",
      };
    if (stock > 0)
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-700 border-red-200",
    };
  };

  const fetchInventory = async () => {
    try {
      const response = await api.get("/inventory");
      setInventory(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilters]);

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeFilters.category.length === 0 ||
        activeFilters.category.includes(item.category);
      const matchesCritical = activeFilters.criticalOnly
        ? item.stock < 10
        : true;

      return matchesSearch && matchesCategory && matchesCritical;
    });
  }, [inventory, search, activeFilters]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredItems]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(inventory.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete item.");
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="font-bold text-slate-600">Loading Inventory...</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Package size={14} /> Stock Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Inventory Items
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and track your stock levels in real-time.
          </p>
        </div>
        <button
          onClick={() => router.push("/inventory/add")}
          className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-purple-600 transition-all duration-300 font-bold shadow-xl shadow-slate-200 active:scale-95 w-full md:w-auto"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          Add New Item
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-72 shrink-0">
          <div className="sticky top-8">
            <SidebarFilter
              categories={[...new Set(inventory.map((item) => item.category))]}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-8">
          <div className="relative group max-w-md">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or category..."
              className="w-full bg-white border-2 border-slate-100 pl-14 pr-6 rounded-2xl py-4 focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-500 transition-all shadow-sm text-slate-700 font-medium"
            />
          </div>

          <div className="hidden xl:block">
            {currentTableData.length > 0 ? (
              <InventoryTable
                data={currentTableData}
                getStatus={getStatus}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                router={router}
              />
            ) : (
              <div className="bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Item Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Package className="text-slate-300" size={40} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">
                            No items found
                          </h3>
                          <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            We couldn't find any inventory matching "{search}".
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="xl:hidden">
            {currentTableData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTableData.map((item) => {
                  const status = getStatus(item.stock);
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/inventory/info/${item.id}`)}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-slate-500 text-xs mt-1 font-medium">
                            {item.category}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-[10px] font-black rounded-md border ${status.color}`}
                        >
                          {status.label.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Price
                          </p>
                          <p className="text-xl font-black text-slate-900">
                            {currencySymbol}
                            {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleEdit(e, item)}
                            className="p-3 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-50"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-3 bg-slate-50 text-red-600 rounded-xl hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100">
                <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <Package className="text-slate-300" size={32} />
                </div>
                <h3 className="text-md font-bold text-slate-800">
                  No stock found
                </h3>
                <p className="text-slate-500 text-xs mt-1 px-10">
                  Try searching for something else or check your filters.
                </p>
              </div>
            )}
          </div>

          {filteredItems.length > itemsPerPage && (
            <div className="pt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      <EditInventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onUpdate={() => {
          fetchInventory();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
