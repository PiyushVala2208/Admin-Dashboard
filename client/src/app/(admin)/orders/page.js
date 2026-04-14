"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import OrdersTable from "@/components/OrdersTable";
import OrdersSidebarFilter from "@/components/OrdersSidebarFilter"; 

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activeFilters, setActiveFilters] = useState({
    status: [],
    highValueOnly: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const statusOptions = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];


  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const res = await axios.get(
        "http://localhost:8000/api/orders/admin/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      toast.error("System Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);


  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        `http://localhost:8000/api/orders/admin/status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        toast.success(`Logistics Updated: ${newStatus}`);
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
      }
    } catch (err) {
      toast.error("Database Update Failed");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toString().includes(search) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      activeFilters.status.length === 0 || activeFilters.status.includes(o.status);

    const matchesValue =
      !activeFilters.highValueOnly || parseFloat(o.total_amount) >= 5000;

    return matchesSearch && matchesStatus && matchesValue;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="font-black text-slate-600 animate-pulse text-sm uppercase tracking-widest">
          Synchronizing Orders...
        </p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Admin Logistics Console
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">
            System Orders
          </h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-tight">
            Monitoring {orders.length} Global Transactions
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        <OrdersSidebarFilter 
          statusOptions={statusOptions}
          activeFilters={activeFilters}
          setActiveFilters={(val) => {
            setActiveFilters(val);
            setCurrentPage(1); 
          }}
        />

        <div className="flex-1 space-y-8">
          <div className="relative group w-full">
            <Search
              size={20}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by Order ID, Name, or Email..."
              className="w-full bg-white border-2 border-slate-100 pl-16 pr-6 rounded-3xl py-5 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-xl shadow-slate-200/40 text-slate-700 font-bold placeholder:text-slate-300 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
            />
          </div>

          <OrdersTable
            orders={currentOrders}
            onStatusChange={handleStatusChange}
            router={router}
            statusOptions={statusOptions}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}