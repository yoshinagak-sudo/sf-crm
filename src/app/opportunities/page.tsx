import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const stage = params.stage || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { account: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (stage) {
    where.stageName = stage;
  }

  const [opportunities, total, stageNames] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { account: true, product2: true },
    }),
    prisma.opportunity.count({ where }),
    prisma.opportunity.groupBy({
      by: ["stageName"],
      orderBy: { stageName: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const spObj: Record<string, string> = {};
  if (search) spObj.search = search;
  if (stage) spObj.stage = stage;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">商談</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <SearchBar defaultValue={search} placeholder="商談名・取引先名で検索" />
          <StageFilter stages={stageNames.map((s) => s.stageName)} current={stage} search={search} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">商談名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">フェーズ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">金額</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">完了予定日</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">商品</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {opp.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {opp.account ? (
                      <Link href={`/accounts/${opp.account.id}`} className="text-blue-600 hover:underline">
                        {opp.account.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={opp.stageName} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {opp.amount != null ? `¥${opp.amount.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {format(new Date(opp.closeDate), "yyyy/MM/dd")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {opp.product2?.name || "-"}
                  </td>
                </tr>
              ))}
              {opportunities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    データが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/opportunities"
            searchParams={spObj}
          />
        </div>
      </div>
    </div>
  );
}

function StageFilter({
  stages,
  current,
  search,
}: {
  stages: string[];
  current: string;
  search: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">フェーズ:</span>
      <div className="flex flex-wrap gap-1">
        <a
          href={`/opportunities?page=1${search ? `&search=${encodeURIComponent(search)}` : ""}`}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !current
              ? "bg-blue-600 text-white border-blue-600"
              : "text-gray-600 border-gray-300 hover:bg-gray-100"
          }`}
        >
          すべて
        </a>
        {stages.map((s) => (
          <a
            key={s}
            href={`/opportunities?page=1&stage=${encodeURIComponent(s)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              current === s
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {s}
          </a>
        ))}
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
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${color}`}>
      {stage}
    </span>
  );
}
