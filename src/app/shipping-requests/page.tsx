import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

export default async function ShippingRequestsPage({
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
          { account: { name: { contains: search, mode: "insensitive" as const } } },
          { productName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [requests, total] = await Promise.all([
    prisma.shippingRequest.findMany({
      where,
      orderBy: { centerDeliveryDate: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { account: true, variety: true },
    }),
    prisma.shippingRequest.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const spObj: Record<string, string> = {};
  if (search) spObj.search = search;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">出荷依頼</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchBar defaultValue={search} placeholder="名前・取引先名・商品名で検索" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">名前</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">品種</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">数量</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">CS</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">状態</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">センター納品日</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">出荷予定日</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">出荷方法</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((sr) => (
                <tr key={sr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/shipping-requests/${sr.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {sr.name || sr.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {sr.account ? (
                      <Link href={`/accounts/${sr.account.id}`} className="text-blue-600 hover:underline">
                        {sr.account.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sr.variety?.name || "-"}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {sr.quantity != null ? sr.quantity.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {sr.cs != null ? sr.cs.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sr.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sr.centerDeliveryDate
                      ? format(new Date(sr.centerDeliveryDate), "yyyy/MM/dd")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sr.expectedShippingDate
                      ? format(new Date(sr.expectedShippingDate), "yyyy/MM/dd")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sr.shippingMethod || "-"}</td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
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
            basePath="/shipping-requests"
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
  if (status.includes("完了") || status.includes("Completed") || status.includes("Shipped"))
    color = "bg-green-100 text-green-700";
  else if (status.includes("新規") || status.includes("New"))
    color = "bg-blue-100 text-blue-700";
  else if (status.includes("処理中") || status.includes("Processing") || status.includes("進行"))
    color = "bg-yellow-100 text-yellow-700";
  else if (status.includes("キャンセル") || status.includes("Cancel"))
    color = "bg-red-100 text-red-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${color}`}>
      {status}
    </span>
  );
}
