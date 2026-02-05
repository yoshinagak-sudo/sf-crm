import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function InventoryForecastingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where = search
    ? {
        name: { contains: search, mode: "insensitive" as const },
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.inventoryForecasting.findMany({
      where,
      orderBy: { centerDeliveryDate: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.inventoryForecasting.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const spObj: Record<string, string> = {};
  if (search) spObj.search = search;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">在庫予測</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchBar defaultValue={search} placeholder="名前で検索" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">名前</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">センター納品日</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">個数</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">追加収穫</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">在庫追加</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.name || item.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.centerDeliveryDate
                      ? format(new Date(item.centerDeliveryDate), "yyyy/MM/dd")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {item.pieceQuantity != null ? item.pieceQuantity.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {item.additionalHarvest != null ? item.additionalHarvest.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {item.stockAddition != null ? item.stockAddition.toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
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
            basePath="/inventory-forecasting"
            searchParams={spObj}
          />
        </div>
      </div>
    </div>
  );
}
