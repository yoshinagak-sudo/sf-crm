"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  FileWarning,
  Truck,
  Package,
  BarChart3,
  CalendarCheck,
} from "lucide-react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/accounts", label: "取引先", icon: Building2 },
  { href: "/contacts", label: "取引先責任者", icon: Users },
  { href: "/opportunities", label: "商談", icon: Handshake },
  { href: "/cases", label: "ケース", icon: FileWarning },
  { href: "/shipping-requests", label: "出荷依頼", icon: Truck },
  { href: "/products", label: "商品", icon: Package },
  { href: "/inventory-forecasting", label: "在庫予測", icon: BarChart3 },
  { href: "/activities", label: "活動", icon: CalendarCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-800 text-slate-200 flex flex-col z-50">
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wide text-white">SF-CRM</h1>
        <p className="text-xs text-slate-400 mt-0.5">営業管理システム</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-3 border-t border-slate-700 text-xs text-slate-500">
        v0.1.0
      </div>
    </aside>
  );
}
