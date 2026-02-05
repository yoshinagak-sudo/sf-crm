import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AccountsPage({
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
          { name: { contains: search, mode: "insensitive" as const } },
          { accountCode: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.account.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const spObj: Record<string, string> = {};
  if (search) spObj.search = search;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">取引先</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchBar defaultValue={search} placeholder="取引先名・コード・電話で検索" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">種別</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">電話番号</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">業種</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ランク</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">コード</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/accounts/${account.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {account.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{account.type || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{account.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{account.industry || "-"}</td>
                  <td className="px-4 py-3">
                    {account.rank ? (
                      <RankBadge rank={account.rank} />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                    {account.accountCode || "-"}
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
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
            basePath="/accounts"
            searchParams={spObj}
          />
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: string }) {
  let color = "bg-gray-100 text-gray-700";
  if (rank === "A" || rank === "S") color = "bg-green-100 text-green-700";
  else if (rank === "B") color = "bg-blue-100 text-blue-700";
  else if (rank === "C") color = "bg-yellow-100 text-yellow-700";
  else if (rank === "D") color = "bg-red-100 text-red-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>
      {rank}
    </span>
  );
}
