import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where = search
    ? {
        OR: [
          { subject: { contains: search, mode: "insensitive" as const } },
          { caseNumber: { contains: search, mode: "insensitive" as const } },
          { account: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { account: true, contact: true },
    }),
    prisma.case.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const spObj: Record<string, string> = {};
  if (search) spObj.search = search;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ケース</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchBar defaultValue={search} placeholder="件名・ケース番号・取引先名で検索" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ケース番号</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">件名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">状況</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">優先度</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">種別</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先責任者</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/cases/${c.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {c.caseNumber || c.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                    {c.subject || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {c.account ? (
                      <Link href={`/accounts/${c.account.id}`} className="text-blue-600 hover:underline">
                        {c.account.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.type || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.contact
                      ? `${c.contact.lastName} ${c.contact.firstName || ""}`
                      : "-"}
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
            basePath="/cases"
            searchParams={spObj}
          />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-gray-400">-</span>;
  let color = "bg-gray-100 text-gray-600";
  if (status.includes("Closed") || status.includes("完了"))
    color = "bg-green-100 text-green-700";
  else if (status.includes("New") || status.includes("新規"))
    color = "bg-blue-100 text-blue-700";
  else if (status.includes("Working") || status.includes("対応中"))
    color = "bg-yellow-100 text-yellow-700";
  else if (status.includes("Escalated"))
    color = "bg-red-100 text-red-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${color}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string | null }) {
  if (!priority) return <span className="text-gray-400">-</span>;
  let color = "bg-gray-100 text-gray-600";
  if (priority === "High" || priority === "高") color = "bg-red-100 text-red-700";
  else if (priority === "Medium" || priority === "中") color = "bg-yellow-100 text-yellow-700";
  else if (priority === "Low" || priority === "低") color = "bg-green-100 text-green-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${color}`}>
      {priority}
    </span>
  );
}
