import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Building2,
  Users,
  Handshake,
  FileWarning,
  Truck,
  Package,
  CalendarCheck,
  BarChart3,
  Calendar,
  TrendingUp,
  Banknote,
  UserCheck,
} from "lucide-react";
import { getOpportunityStatsByOwner } from "@/actions/opportunities";

export const dynamic = "force-dynamic";

// 期間プリセット
const PERIOD_PRESETS = [
  { key: "today", label: "今日" },
  { key: "week", label: "今週" },
  { key: "month", label: "今月" },
  { key: "quarter", label: "今四半期" },
  { key: "year", label: "今年" },
  { key: "all", label: "全期間" },
  { key: "custom", label: "カスタム" },
] as const;

type PeriodKey = typeof PERIOD_PRESETS[number]["key"];

// 期間の開始日・終了日を計算
function getDateRange(period: PeriodKey, customStart?: string, customEnd?: string): { start: Date | null; end: Date | null } {
  const now = new Date();

  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return { start: startOfWeek(now, { locale: ja }), end: endOfDay(now) };
    case "month":
      return { start: startOfMonth(now), end: endOfDay(now) };
    case "quarter":
      return { start: startOfQuarter(now), end: endOfDay(now) };
    case "year":
      return { start: startOfYear(now), end: endOfDay(now) };
    case "custom":
      return {
        start: customStart ? new Date(customStart) : null,
        end: customEnd ? endOfDay(new Date(customEnd)) : null,
      };
    case "all":
    default:
      return { start: null, end: null };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as PeriodKey) || "month";
  const customStart = params.start;
  const customEnd = params.end;

  const { start: dateStart, end: dateEnd } = getDateRange(period, customStart, customEnd);

  // 期間フィルター用のwhere条件
  const dateFilter = dateStart || dateEnd ? {
    closeDate: {
      ...(dateStart && { gte: dateStart }),
      ...(dateEnd && { lte: dateEnd }),
    },
  } : {};

  const createdAtFilter = dateStart || dateEnd ? {
    createdAt: {
      ...(dateStart && { gte: dateStart }),
      ...(dateEnd && { lte: dateEnd }),
    },
  } : {};

  const [
    accountCount,
    contactCount,
    opportunityCount,
    opportunityStats,
    caseCount,
    shippingRequestCount,
    productCount,
    taskCount,
    eventCount,
    recentOpportunities,
    recentCases,
    recentShippingRequests,
    ownerStats,
  ] = await Promise.all([
    prisma.account.count(),
    prisma.contact.count(),
    // 期間内の商談数
    prisma.opportunity.count({ where: dateFilter }),
    // 期間内の商談金額集計
    prisma.opportunity.aggregate({
      where: dateFilter,
      _sum: { amount: true },
      _count: true,
    }),
    prisma.case.count({ where: createdAtFilter }),
    prisma.shippingRequest.count({ where: createdAtFilter }),
    prisma.product.count(),
    prisma.sfTask.count({ where: createdAtFilter }),
    prisma.event.count({ where: createdAtFilter }),
    prisma.opportunity.findMany({
      where: dateFilter,
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { account: true },
    }),
    prisma.case.findMany({
      where: createdAtFilter,
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { account: true },
    }),
    prisma.shippingRequest.findMany({
      where: createdAtFilter,
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { account: true },
    }),
    // 担当者別統計
    getOpportunityStatsByOwner(dateStart || undefined, dateEnd || undefined),
  ]);

  const totalAmount = opportunityStats._sum.amount || 0;

  const summaryCards = [
    { label: "取引先", count: accountCount, icon: Building2, href: "/accounts", color: "bg-blue-500" },
    { label: "取引先責任者", count: contactCount, icon: Users, href: "/contacts", color: "bg-indigo-500" },
    { label: "商談", count: opportunityCount, icon: Handshake, href: "/opportunities", color: "bg-emerald-500" },
    { label: "ケース", count: caseCount, icon: FileWarning, href: "/cases", color: "bg-amber-500" },
    { label: "出荷依頼", count: shippingRequestCount, icon: Truck, href: "/shipping-requests", color: "bg-purple-500" },
    { label: "商品", count: productCount, icon: Package, href: "/products", color: "bg-cyan-500" },
    { label: "ToDo", count: taskCount, icon: CalendarCheck, href: "/activities", color: "bg-rose-500" },
    { label: "行動", count: eventCount, icon: BarChart3, href: "/activities", color: "bg-teal-500" },
  ];

  // 期間表示用テキスト
  const periodLabel = PERIOD_PRESETS.find((p) => p.key === period)?.label || "今月";
  const dateRangeText = dateStart && dateEnd
    ? `${format(dateStart, "yyyy/MM/dd")} 〜 ${format(dateEnd, "yyyy/MM/dd")}`
    : dateStart
    ? `${format(dateStart, "yyyy/MM/dd")} 以降`
    : "全期間";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>

        {/* 期間フィルター */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          {PERIOD_PRESETS.filter((p) => p.key !== "custom").map((preset) => (
            <a
              key={preset.key}
              href={`/?period=${preset.key}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                period === preset.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {preset.label}
            </a>
          ))}
        </div>
      </div>

      {/* カスタム期間入力 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="period" value="custom" />
          <div>
            <label className="block text-xs text-gray-500 mb-1">開始日</label>
            <input
              type="date"
              name="start"
              defaultValue={customStart || ""}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">終了日</label>
            <input
              type="date"
              name="end"
              defaultValue={customEnd || ""}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            適用
          </button>
          {period === "custom" && (
            <a
              href="/?period=month"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              リセット
            </a>
          )}
        </form>
        {period !== "all" && (
          <p className="text-xs text-gray-400 mt-2">
            表示期間: {dateRangeText}
          </p>
        )}
      </div>

      {/* 期間内の商談サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">{periodLabel}の商談数</p>
              <p className="text-3xl font-bold mt-1">{opportunityCount.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">{periodLabel}の商談金額</p>
              <p className="text-3xl font-bold mt-1">¥{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Banknote size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {card.count.toLocaleString()}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 担当者別商談統計 */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <UserCheck size={20} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800">担当者別商談統計</h2>
          <span className="text-xs text-gray-400 ml-2">({periodLabel})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">担当者</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">商談数</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">成約数</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">成約率</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">合計金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ownerStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{stat.name}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{stat.totalCount}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{stat.wonCount}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      stat.winRate >= 70 ? "bg-green-100 text-green-700" :
                      stat.winRate >= 50 ? "bg-blue-100 text-blue-700" :
                      stat.winRate >= 30 ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {stat.winRate}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">
                    ¥{stat.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {ownerStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-4 text-center text-gray-400">
                    データなし
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Opportunities */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">最近の商談</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOpportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="block px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {opp.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">
                    {opp.account?.name}
                  </span>
                  <StageBadge stage={opp.stageName} />
                </div>
              </Link>
            ))}
            {recentOpportunities.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">データなし</p>
            )}
          </div>
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">最近のケース</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {c.subject || `ケース #${c.caseNumber}`}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">
                    {c.account?.name}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
            {recentCases.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">データなし</p>
            )}
          </div>
        </div>

        {/* Recent Shipping Requests */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">最近の出荷依頼</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentShippingRequests.map((sr) => (
              <Link
                key={sr.id}
                href={`/shipping-requests/${sr.id}`}
                className="block px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {sr.name || sr.id}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">
                    {sr.account?.name}
                  </span>
                  {sr.centerDeliveryDate && (
                    <span className="text-xs text-gray-400">
                      {format(new Date(sr.centerDeliveryDate), "yyyy/MM/dd")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {recentShippingRequests.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">データなし</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  let color = "bg-gray-100 text-gray-600";
  if (stage.includes("Closed Won") || stage.includes("成立"))
    color = "bg-green-100 text-green-700";
  else if (stage.includes("Closed Lost") || stage.includes("不成立"))
    color = "bg-red-100 text-red-700";
  else if (stage.includes("Negotiation") || stage.includes("交渉") || stage.includes("提案"))
    color = "bg-yellow-100 text-yellow-700";
  else if (stage.includes("Prospecting") || stage.includes("見込"))
    color = "bg-blue-100 text-blue-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {stage}
    </span>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  let color = "bg-gray-100 text-gray-600";
  if (status.includes("Closed") || status.includes("完了"))
    color = "bg-green-100 text-green-700";
  else if (status.includes("New") || status.includes("新規"))
    color = "bg-blue-100 text-blue-700";
  else if (status.includes("Working") || status.includes("対応中") || status.includes("進行"))
    color = "bg-yellow-100 text-yellow-700";
  else if (status.includes("Escalated"))
    color = "bg-red-100 text-red-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {status}
    </span>
  );
}
