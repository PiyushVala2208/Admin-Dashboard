"use client";
import { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/utils/api";
import {
  ArrowLeft,
  IndianRupee,
  Layers,
  History,
  Loader2,
  Calendar,
  Tag,
} from "lucide-react";
import EditInventoryModal from "@/components/EditInventoryModal";

export default function ItemInfoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const res = await api.get(`/inventory/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (confirm("Sach mein delete karna hai?")) {
      try {
        await api.delete(`/inventory/${id}`);
        router.push("/inventory/all");
      } catch (err) {
        alert("Failed to delete user.");
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
      </div>
    );

  if (!item) return notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <Link
        href="/inventory/all"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">Back to Inventory</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-50 p-6 sm:p-8 shadow-xl border border-slate-100 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 block sm:hidden">
              <Tag size={40} className="text-slate-200 rotate-12" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="w-full sm:w-auto">
                <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 bg-slate-200 py-1.5 px-4 rounded-full mb-3">
                  {item.category}
                </span>
                <h1 className="text-3xl sm:text-5xl font-bold text-blue-500 italic break-words">
                  {item.name}
                </h1>
                <p className="text-slate-400 mt-3 text-[11px] tracking-widest font-mono">
                  ID: #{item.id}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm ${
                  item.stock > 5
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {item.stock > 5 ? "● In Stock" : "● Low Stock"}
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Description
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {item.description ||
                  "No description available for this product."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform">
                  <IndianRupee size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                    Current Price
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                  <Layers size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                    Available Stock
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {item.stock}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      Units
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-black text-white p-6 sm:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <h3 className="flex text-lg font-bold mb-6 items-center gap-2 relative z-10">
              <History size={20} className="text-blue-400" /> Activity Log
            </h3>

            <div className="space-y-5 text-sm relative z-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400">Category</span>
                <span className="font-semibold">{item.category}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400">Last Checked</span>
                <span className="font-semibold flex items-center gap-1">
                  <Calendar size={14} /> Today
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400">Supply Status</span>
                <span
                  className={`font-black ${item.stock > 5 ? "text-green-400" : "text-red-400"}`}
                >
                  {item.stock > 5 ? "OPTIMAL" : "CRITICAL"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
            >
              Edit Item Details
            </button>
            <button
              onClick={handleDelete}
              className="w-full border-2 border-red-50 text-red-500 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all"
            >
              Remove Record
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditInventoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={item}
          onUpdate={(updatedItem) => {
            setItem(updatedItem);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
