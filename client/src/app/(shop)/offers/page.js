"use client";
import React from "react";
import { TicketPercent, BellRing, Sparkles } from "lucide-react";
import Link from "next/link";

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFE] flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#8B5CF6]/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-white border border-[#DDD6FE] p-8 rounded-[2.5rem] shadow-2xl shadow-purple-100">
            <TicketPercent size={64} className="text-[#7C3AED] stroke-[1.5]" />
            <div className="absolute -top-2 -right-2 bg-[#F5F3FF] border border-[#DDD6FE] p-2 rounded-2xl shadow-sm">
              <Sparkles size={20} className="text-[#A78BFA]" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-serif italic text-[#4C1D95]">
            Exclusive <span className="text-[#8B5CF6]">Offers</span>
          </h1>
          <p className="text-[#4C1D95]/60 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Our curators are currently crafting bespoke deals just for you.
            Quality takes time, and great things are on the way.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 bg-[#F5F3FF] border border-[#DDD6FE] px-6 py-3 rounded-2xl shadow-sm">
          <div className="w-2 h-2 bg-[#A78BFA] rounded-full animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">
            Status: No Active Promotions
          </span>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          
          <Link
            href="/products"
            className="text-[10px] font-bold uppercase tracking-widest text-[#4C1D95]/40 hover:text-[#4C1D95] underline underline-offset-8 transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-linear-to-t from-[#F5F3FF] to-transparent -z-10" />
    </div>
  );
}
