"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Package, Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import EditInventoryModal from "@/components/EditInventoryModal";
import SidebarFilter from "@/components/InvantorySidebarFilter";
import Pagination from "@/components/Pagination";
import InventoryTable from "@/components/InventoryTable";
import InventoryCard from "@/components/InventoryCard";
import InventoryEmptyState from "@/components/InventoryEmptyState";
import { useSettings } from "@/context/SettingsContext";

export default function AllItemsPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const calculateTotalStock = useCallback((item) => {
    if (item.variants && item.variants.length > 0) {
      return item.variants.reduce(
        (acc, curr) => acc + (parseInt(curr.variant_stock) || 0),
        0,
      );
    }
    return 0;
  }, []);

  const getDisplayPrice = useCallback((item) => {
    if (item.variants && item.variants.length > 0) {
      const prices = item.variants
        .map((v) => Number(v.variant_price))
        .filter((p) => p > 0);
      return prices.length > 0 ? Math.min(...prices) : 0;
    }
    return 0;
  }, []);

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

  const fetchData = async () => {
    try {
      setLoading(true);

      const inventoryUrl = activeFilters.criticalOnly
        ? "/inventory?filter=critical"
        : "/inventory";

      const [invRes, catRes] = await Promise.all([
        api.get(inventoryUrl),
        api.get("/categories"),
      ]);

      const inventoryData = Array.isArray(invRes.data) ? invRes.data : [];
      setInventory(inventoryData);

      const dbCatNames = Array.isArray(catRes.data)
        ? catRes.data.map((c) => c.name)
        : [];

      const inventoryCats = inventoryData
        .map((item) => item.category)
        .filter(Boolean);

      const combinedCategories = [
        ...new Set([...dbCatNames, ...inventoryCats]),
      ];

      setCategories(combinedCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeFilters.criticalOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilters]);

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const totalStock = calculateTotalStock(item);
      const itemName = item.name?.toLowerCase() || "";
      const itemCat = item.category?.toLowerCase() || "";
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        itemName.includes(searchTerm) || itemCat.includes(searchTerm);

      const matchesCategory =
        activeFilters.category.length === 0 ||
        activeFilters.category.includes(item.category);

      const matchesCritical = activeFilters.criticalOnly
        ? item.has_critical === true || item.has_critical === "true"
        : true;

      return matchesSearch && matchesCategory && matchesCritical;
    });
  }, [inventory, search, activeFilters, calculateTotalStock]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredItems]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure? This will delete the product and all its variants forever.",
      )
    )
      return;
    try {
      await api.delete(`/inventory/${id}`);
      setInventory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete item.");
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchData();
    setIsModalOpen(false);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="font-bold text-slate-600">Syncing Inventory...</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Package size={14} /> Stock Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Inventory Items
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and track your stock levels across all variants in real-time.
          </p>
        </div>
        <button
          onClick={() => router.push("/inventory/add")}
          className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-purple-600 transition-all duration-300 font-bold shadow-xl active:scale-95 w-full md:w-auto"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          Add New Item
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-64 shrink-0">
          <div className="sticky top-8">
            <SidebarFilter
              categories={categories}
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
              onChange={(e) => setSearch(e.target.value)}
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
                calculateTotalStock={calculateTotalStock}
                getDisplayPrice={getDisplayPrice}
              />
            ) : (
              <InventoryEmptyState />
            )}
          </div>

          <div className="xl:hidden">
            {currentTableData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTableData.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    router={router}
                    calculateTotalStock={calculateTotalStock}
                    getDisplayPrice={getDisplayPrice}
                    getStatus={getStatus}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100">
                <InventoryEmptyState message="No stock found" />
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
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}
