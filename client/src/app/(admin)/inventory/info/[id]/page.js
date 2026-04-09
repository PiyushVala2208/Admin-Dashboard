"use client";
import { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/utils/api";
import {
  ArrowLeft,
  IndianRupee,
  Layers,
  History,
  Loader2,
  Calendar,
  Tag,
  Package, 
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
        alert("Failed to delete record.");
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
          <div className="bg-white p-6 sm:p-8 shadow-xl border border-slate-100 rounded-[2.5rem] relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-64 h-64 relative rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-inner group">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <Package size={64} strokeWidth={1} />
                    <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">
                      No Preview
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="w-full sm:w-auto">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 py-1.5 px-4 rounded-full mb-3">
                      {item.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight break-words">
                      {item.name}
                    </h1>
                    <p className="text-slate-400 mt-2 text-[11px] tracking-widest font-mono font-bold">
                      REF: INV-{item.id?.toString().padStart(4, "0")}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm border ${
                      item.stock > 5
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    {item.stock > 5 ? "● In Stock" : "● Low Stock"}
                  </div>
                </div>

                <hr className="my-5 border-slate-100" />

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                    Product Description
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                    {item.description ||
                      "No detailed description available for this premium asset."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group hover:bg-white hover:shadow-md transition-all">
                <div className="p-3 bg-white rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                  <IndianRupee size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                    Price Value
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group hover:bg-white hover:shadow-md transition-all">
                <div className="p-3 bg-white rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                  <Layers size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                    Inventory Level
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {item.stock}{" "}
                    <span className="text-xs font-bold text-slate-400 uppercase ml-1">
                      Units
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-800 to-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

            <h3 className="flex text-sm font-black mb-8 items-center gap-2 relative z-10 uppercase tracking-[0.2em] text-slate-400">
              <History size={16} className="text-blue-400" /> Activity Log
            </h3>

            <div className="space-y-6 text-sm relative z-10">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Registry
                </span>
                <span className="font-semibold text-slate-200">
                  {item.category}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Verification
                </span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Calendar size={14} className="text-blue-500" />{" "}
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Supply Score
                </span>
                <span
                  className={`font-black text-[11px] px-2 py-1 rounded-md ${
                    item.stock > 5
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {item.stock > 5 ? "OPTIMAL" : "CRITICAL"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-100"
            >
              Update Details
            </button>
            <button
              onClick={handleDelete}
              className="w-full bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 active:scale-95 transition-all"
            >
              Purge Record
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
