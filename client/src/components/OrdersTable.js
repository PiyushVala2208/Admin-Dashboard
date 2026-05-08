"use client";
import React from "react";
import Image from "next/image";
import {
  Package,
  RefreshCcw,
  MoreVertical,
  ChevronRight,
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
    <div className="w-full space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 md:hidden min-h-[600px] content-start">
        {orders && orders.length > 0
          ? orders.map((order) => {
              const uniqueImages = Array.from(
                new Set(order.items?.map((i) => i.variant_image || i.image)),
              ).filter(Boolean);

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/details/${order.id}`)}
                  className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 active:scale-[0.98] transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3 isolate">
                        {uniqueImages.slice(0, 2).map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-xl border-2 border-white overflow-hidden shadow-sm bg-slate-50"
                          >
                            <Image
                              src={img}
                              alt="ordered product"
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm uppercase flex items-center gap-1">
                          <Package size={12} className="text-slate-400" /> #ORD-
                          {order.id}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          {order.customer_name}
                        </p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onStatusChange(order.id, e.target.value)
                        }
                        className={`appearance-none px-3 py-1.5 rounded-xl text-[9px] font-black uppercase outline-none ring-1 ring-inset ${
                          order.status === "DELIVERED"
                            ? "bg-green-50 text-green-600 ring-green-100"
                            : order.status === "CANCELLED"
                              ? "bg-red-50 text-red-600 ring-red-100"
                              : "bg-blue-50 text-blue-600 ring-blue-100"
                        }`}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      <p className="font-black text-slate-900 text-base">
                        ₹{parseFloat(order.total_amount).toLocaleString()}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        <CreditCard size={10} /> {order.payment_method}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })
          : null}
      </div>

      <div className="hidden md:block bg-white shadow-2xl shadow-slate-200/60 rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="w-[35%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">
                  Order & Items
                </th>
                <th className="w-[20%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">
                  Customer
                </th>
                <th className="w-[20%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">
                  Billing Info
                </th>
                <th className="w-[15%] px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest">
                  Live Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders && orders.length > 0 ? (
                <>
                  {orders.map((order) => {
                    const uniqueImages = Array.from(
                      new Set(
                        order.items?.map((i) => i.variant_image || i.image),
                      ),
                    ).filter(Boolean);
                    const displayImages = uniqueImages.slice(0, 3);
                    const remainingCount = uniqueImages.length - 3;
                    const totalItemsCount = order.items?.reduce(
                      (sum, item) => sum + (item.quantity || 1),
                      0,
                    );

                    return (
                      <tr
                        key={order.id}
                        onClick={() =>
                          router.push(`/orders/details/${order.id}`)
                        }
                        className="hover:bg-blue-50/30 transition-all group cursor-pointer h-27.5"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="flex -space-x-5 isolate items-center shrink-0">
                              {displayImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-slate-50 transition-all duration-300 hover:scale-125 hover:shadow-2xl hover:-translate-y-1 z-10 hover:z-50"
                                >
                                  <Image
                                    src={img}
                                    alt="ordered product"
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                </div>
                              ))}
                              {remainingCount > 0 && (
                                <div className="relative w-14 h-14 rounded-2xl border-2 border-white shadow-sm bg-slate-900 flex items-center justify-center text-[10px] text-white font-black">
                                  +{remainingCount}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col truncate">
                              <p className="font-black text-slate-900 text-sm truncate uppercase flex items-center gap-1.5">
                                <Package size={14} className="text-slate-400" />{" "}
                                #ORD-{order.id}
                              </p>
                              <span className="text-[10px] text-blue-600 font-extrabold uppercase truncate">
                                {totalItemsCount}{" "}
                                {totalItemsCount > 1 ? "Items" : "Item"} Ordered
                              </span>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                {new Date(order.created_at).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-slate-800 text-sm truncate">
                              {order.customer_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                              ID: {order.user_id || "Guest User"}
                            </span>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 text-base tracking-tighter">
                                ₹
                                {parseFloat(
                                  order.total_amount,
                                ).toLocaleString()}
                              </span>
                              <CreditCard
                                size={14}
                                className="text-slate-300"
                              />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              Via {order.payment_method}
                            </span>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div
                            className="relative inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={order.status}
                              onChange={(e) =>
                                onStatusChange(order.id, e.target.value)
                              }
                              className={`appearance-none pl-4 pr-10 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none ring-1 ring-inset cursor-pointer transition-all ${
                                order.status === "DELIVERED"
                                  ? "bg-green-50 text-green-600 ring-green-100"
                                  : order.status === "CANCELLED"
                                    ? "bg-red-50 text-red-600 ring-red-100"
                                    : order.status === "SHIPPED"
                                      ? "bg-orange-50 text-orange-600 ring-orange-100"
                                      : order.status === "PROCESSING"
                                        ? "bg-blue-50 text-blue-600 ring-blue-100"
                                        : "bg-slate-50 text-slate-600 ring-slate-100"
                              }`}
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                              <MoreVertical size={14} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {orders.length < itemsPerPage &&
                    Array.from({ length: itemsPerPage - orders.length }).map(
                      (_, i) => (
                        <tr
                          key={`empty-${i}`}
                          className="h-[110px] border-none select-none pointer-events-none"
                        >
                          <td colSpan="5">&nbsp;</td>
                        </tr>
                      ),
                    )}
                </>
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="h-[880px] text-center text-slate-400"
                  >
                    <RefreshCcw
                      size={40}
                      className="mx-auto mb-4 opacity-20 animate-spin-slow"
                    />
                    <p className="font-black tracking-widest uppercase text-xs">
                      No Transactions Found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
