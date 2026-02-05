import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

// ステージ別の色設定
function getStageStyle(stage: string) {
  if (stage.includes("Closed Won") || stage.includes("成立") || stage.includes("受注"))
    return { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" };
  if (stage.includes("Closed Lost") || stage.includes("不成立") || stage.includes("失注"))
    return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" };
  if (stage.includes("Negotiation") || stage.includes("交渉") || stage.includes("提案"))
    return { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" };
  if (stage.includes("Prospecting") || stage.includes("見込") || stage.includes("アプローチ"))
    return { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" };
  return { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-600" };
}

export default async function UserHomePage() {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { account: true },
  });

  // ステージ別にグループ化
  const groupedByStage = opportunities.reduce((acc, opp) => {
    const stage = opp.stageName;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(opp);
    return acc;
  }, {} as Record<string, typeof opportunities>);

  const stageOrder = ["見込", "アプローチ", "提案", "交渉", "受注", "失注", "Prospecting", "Negotiation", "Closed Won", "Closed Lost"];
  const sortedStages = Object.keys(groupedByStage).sort((a, b) => {
    const aIdx = stageOrder.findIndex((s) => a.includes(s));
    const bIdx = stageOrder.findIndex((s) => b.includes(s));
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  return (
    <div>
      {/* 概要 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">商談一覧</h1>
        <p className="text-sm text-gray-500">
          全 {opportunities.length} 件の商談
        </p>
      </div>

      {/* 商談カード一覧 */}
      {sortedStages.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            商談がありません
          </h3>
          <p className="text-gray-500 mb-4">
            最初の商談を登録しましょう
          </p>
          <Link
            href="/u/deals/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            商談を登録する
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedStages.map((stage) => {
            const style = getStageStyle(stage);
            const deals = groupedByStage[stage];
            return (
              <div key={stage}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.badge}`}>
                    {stage}
                  </span>
                  <span className="text-sm text-gray-400">{deals.length}件</span>
                </div>
                <div className="grid gap-3">
                  {deals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/u/deals/${deal.id}`}
                      className={`block ${style.bg} ${style.border} border rounded-xl p-4 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">
                            {deal.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {deal.account?.name || "取引先未設定"}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          {deal.amount != null && (
                            <p className="font-semibold text-gray-800">
                              ¥{deal.amount.toLocaleString()}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(deal.closeDate), "yyyy/MM/dd")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
