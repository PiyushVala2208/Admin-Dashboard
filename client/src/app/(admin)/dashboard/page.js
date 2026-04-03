"use client";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Users,
  ShieldCheck,
  Package2,
  Loader2,
  Banknote,
  Clock,
  UserPlus,
  PackagePlus,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import Link from "next/link";

export default function Home() {
  const { currencySymbol } = useSettings();
  const [counts, setCounts] = useState({
    users: 0,
    items: 0,
    revenue: 0,
    activeUsers: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, inventoryRes] = await Promise.all([
          api.get("/users"),
          api.get("/inventory"),
        ]);

        const userData = Array.isArray(userRes.data) ? userRes.data : [];
        const inventoryData = Array.isArray(inventoryRes.data)
          ? inventoryRes.data
          : [];

        const totalValuation = inventoryData.reduce(
          (acc, item) =>
            acc + (Number(item.price) || 0) * (Number(item.stock) || 0),
          0,
        );

        const currentActiveUser = userData.filter(
          (user) =>
            user && (user.status === "Active" || user.isActive === true),
        ).length;

        const latestUser = userData.map((u) => ({
          id: `user-${u.id}`,
          sortId: u.id,
          user: u.name,
          action: `Account created as ${u.role}`,
          time: "Just now",
          icon: <UserPlus size={16} className="text-blue-600" />,
          bg: "bg-blue-100/50",
          color: "text-blue-600",
        }));

        const inventoryActivities = inventoryData.map((item) => ({
          id: `inv-${item.id}`,
          sortId: item.id,
          user: "Inventory Admin",
          action: `Stock updated: ${item.name}`,
          time: "Recent",
          icon: <PackagePlus size={16} className="text-emerald-600" />,
          bg: "bg-emerald-100/50",
          color: "text-emerald-600",
        }));

        const combinedActivities = [...latestUser, ...inventoryActivities]
          .sort((a, b) => (b.sortId || 0) - (a.sortId || 0))
          .slice(0, 5);

        setActivities(combinedActivities);
        setCounts({
          users: userData.length,
          items: inventoryData.length,
          revenue: totalValuation,
          activeUsers: currentActiveUser,
        });
      } catch (err) {
        console.error("Dashboard Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const stats = [
    {
      title: "Total Users",
      value: counts.users,
      icon: <Users size={22} />,
      light: "bg-blue-50 text-blue-600",
      trend: "+12% this month",
    },
    {
      title: "Inventory",
      value: counts.items,
      icon: <Package2 size={22} />,
      light: "bg-emerald-50 text-emerald-600",
      trend: "Stable stock",
    },
    {
      title: "Active Staff",
      value: counts.activeUsers,
      icon: <ShieldCheck size={22} />,
      light: "bg-purple-50 text-purple-600",
      trend: "85% uptime",
    },
    {
      title: "Total Value",
      value: `${currencySymbol}${counts.revenue.toLocaleString()}`,
      icon: <Banknote size={22} />,
      light: "bg-amber-50 text-amber-600",
      trend: "+5.4% growth",
    },
  ];

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 stroke-[3px]" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">
          Synchronizing Data...
        </p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic">
            DASHBOARD
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            System status: <span className="text-slate-800">Operational</span>
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Clock size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card, index) => (
          <div
            key={index}
            className="group bg-white rounded-4xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-200/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-2xl ${card.light} group-hover:scale-110 transition-transform`}
              >
                {card.icon}
              </div>
              <ArrowUpRight
                size={20}
                className="text-slate-300 group-hover:text-blue-500 transition-colors"
              />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {card.title}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
                {card.value}
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-full border border-slate-100">
                <TrendingUp size={12} className="text-blue-500" /> {card.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-xl">
                <Activity size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
                Recent Activity
              </h2>
            </div>
            <button className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors uppercase">
              View Archive
            </button>
          </div>

          <div className="space-y-6 relative before:absolute before:left-4.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="relative flex items-center gap-6 group pl-1"
              >
                <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-white border-4 border-white shadow-md rounded-2xl group-hover:scale-110 transition-transform">
                  <div
                    className={`p-1.5 rounded-lg ${activity.bg} ${activity.color}`}
                  >
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1 bg-slate-50/50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none">
                      {activity.user}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 w-fit">
                    <Clock size={12} /> {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
