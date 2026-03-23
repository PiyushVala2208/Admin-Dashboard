"use client";
import { useState, useEffect, useMemo } from "react";
import { Package, Search, Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import EditInventoryModal from "@/components/EditInventoryModal";
import SidebarFilter from "@/components/SidebarFilter";
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package size={24} className="text-purple-600" />
            </div>
            Inventory Items
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and track your stock levels
          </p>
        </div>
        <button
          onClick={() => router.push("/inventory/add")}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-200 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 shrink-0">
          <SidebarFilter
            categories={[...new Set(inventory.map((item) => item.category))]}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative mb-6 group max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full bg-white border border-slate-200 pl-11 pr-4 rounded-xl py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <InventoryTable
            data={currentTableData}
            getStatus={getStatus}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            router={router}
          />

          <div className="md:hidden space-y-4">
            {currentTableData.map((item) => {
              const status = getStatus(item.stock);
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/inventory/info/${item.id}`)}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-slate-500 text-xs">{item.category}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[10px] font-black rounded-md border ${status.color}`}
                    >
                      {status.label.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">
                        Stock:{" "}
                        <span className="text-slate-800 font-bold">
                          {item.stock}
                        </span>
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {currencySymbol}
                        {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleEdit(e, item)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Package className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium">
                {search
                  ? `No results for "${search}"`
                  : "Your inventory is empty"}
              </p>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
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
