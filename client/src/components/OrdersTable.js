"use client";
import React from "react";
import {
  Package,
  ExternalLink,
  RefreshCcw,
  MoreVertical,
  ChevronRight,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import Pagination from "@/components/Pagination";

export default function OrdersTable({
  orders,
  onStatusChange,
  router,
  statusOptions,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 8, 
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:hidden min-h-150 content-start">
        {orders && orders.length > 0
          ? orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/orders/details/${order.id}`)}
                className="bg-white p-5 rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/40 active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      {order.items && order.items[0]?.image ? (
                        <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={18} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">#ORD-{order.id}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{order.customer_name}</p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className={`appearance-none px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider outline-none ring-1 ring-inset ${
                        order.status === "DELIVERED" ? "bg-green-50 text-green-600 ring-green-100" : 
                        order.status === "CANCELLED" ? "bg-red-50 text-red-600 ring-red-100" : 
                        order.status === "SHIPPED" ? "bg-orange-50 text-orange-600 ring-orange-100" : 
                        order.status === "PROCESSING" ? "bg-blue-50 text-blue-600 ring-blue-100" : 
                        "bg-slate-50 text-slate-600 ring-slate-100"
                      }`}
                    >
                      {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Amount</p>
                    <p className="font-black text-slate-900 text-base">₹{parseFloat(order.total_amount).toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 text-white rounded-xl"><ChevronRight size={16} /></div>
                </div>
              </div>
            ))
          : null}
      </div>

      <div className="hidden md:block bg-white shadow-2xl shadow-slate-200/60 rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="w-[25%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">Order Info</th>
                <th className="w-[25%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">Items & Inventory</th>
                <th className="w-[20%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">Customer & Billing</th>
                <th className="w-[20%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">Live Status</th>
                <th className="w-[10%] px-8 py-6 text-center text-[11px] font-black uppercase tracking-widest">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders && orders.length > 0 ? (
                <>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/orders/details/${order.id}`)}
                      className="hover:bg-blue-50/30 transition-all duration-300 group cursor-pointer h-[100px]" // Fixed Row Height
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-white border-2 border-slate-50 group-hover:border-blue-200 transition-all shadow-sm">
                            {order.items && order.items[0]?.image ? (
                              <img src={order.items[0].image} alt="Order item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 tracking-tight text-sm">#ORD-{order.id}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                              {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={14} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 truncate">
                              {order.items?.[0]?.name || "No Items Listed"}
                            </span>
                          </div>
                          {order.items?.length > 1 && (
                            <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-flex self-start uppercase">
                              +{order.items.length - 1} more
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 truncate max-w-[150px]">{order.customer_name}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-black text-slate-900 tracking-tighter">₹{parseFloat(order.total_amount).toLocaleString()}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <CreditCard size={12} className="text-slate-400" />
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => onStatusChange(order.id, e.target.value)}
                            className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none border-none cursor-pointer transition-all shadow-sm ring-1 ring-inset ${
                              order.status === "DELIVERED" ? "bg-green-50 text-green-600 ring-green-100" : 
                              order.status === "CANCELLED" ? "bg-red-50 text-red-600 ring-red-100" : 
                              order.status === "SHIPPED" ? "bg-orange-50 text-orange-600 ring-orange-100" : 
                              order.status === "PROCESSING" ? "bg-blue-50 text-blue-600 ring-blue-100" : 
                              "bg-slate-50 text-slate-600 ring-slate-100"
                            }`}
                          >
                            {statusOptions.map((opt) => <option key={opt} value={opt} className="bg-white text-slate-900">{opt}</option>)}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><MoreVertical size={12} /></div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <div className="p-3 bg-slate-50 group-hover:bg-slate-900 text-slate-400 group-hover:text-white rounded-xl transition-all duration-300 inline-block">
                          <ChevronRight size={18} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Empty Rows Filler: Ye height ko constant rakhega */}
                  {orders.length < itemsPerPage && (
                    Array.from({ length: itemsPerPage - orders.length }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-[100px] border-none select-none pointer-events-none">
                        <td colSpan="5">&nbsp;</td>
                      </tr>
                    ))
                  )}
                </>
              ) : (
                <tr>
                  <td colSpan="5" className="h-[800px] text-center text-slate-400">
                    <RefreshCcw size={40} className="mx-auto mb-4 opacity-20 animate-spin-slow" />
                    <p className="font-black tracking-widest uppercase text-xs">No Transactions Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}