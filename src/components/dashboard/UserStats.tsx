"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Users } from "lucide-react";

export type UserStatData = {
  id: string;
  name: string;
  totalCount: number;
  wonCount: number;
  winRate: number;
  totalAmount: number;
};

type SortField = "name" | "totalCount" | "wonCount" | "winRate" | "totalAmount";
type SortOrder = "asc" | "desc";

interface UserStatsProps {
  data: UserStatData[];
  title?: string;
}

export default function UserStats({
  data,
  title = "担当者別商談統計",
}: UserStatsProps) {
  const [sortField, setSortField] = useState<SortField>("totalCount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal, "ja")
          : bVal.localeCompare(aVal, "ja");
      }

      const numA = aVal as number;
      const numB = bVal as number;
      return sortOrder === "asc" ? numA - numB : numB - numA;
    });
  }, [data, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-300">⇅</span>;
    }
    return sortOrder === "asc" ? (
      <ChevronUp size={14} className="ml-1 inline" />
    ) : (
      <ChevronDown size={14} className="ml-1 inline" />
    );
  };

  const totals = useMemo(() => {
    return data.reduce(
      (acc, row) => ({
        totalCount: acc.totalCount + row.totalCount,
        wonCount: acc.wonCount + row.wonCount,
        totalAmount: acc.totalAmount + row.totalAmount,
      }),
      { totalCount: 0, wonCount: 0, totalAmount: 0 }
    );
  }, [data]);

  const overallWinRate =
    totals.totalCount > 0
      ? Math.round((totals.wonCount / totals.totalCount) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Users size={20} className="text-blue-600" />
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-500 ml-auto">
          {data.length}件
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                担当者
                <SortIcon field="name" />
              </th>
              <th
                className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("totalCount")}
              >
                商談数
                <SortIcon field="totalCount" />
              </th>
              <th
                className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("wonCount")}
              >
                成約数
                <SortIcon field="wonCount" />
              </th>
              <th
                className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("winRate")}
              >
                成約率
                <SortIcon field="winRate" />
              </th>
              <th
                className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("totalAmount")}
              >
                合計金額
                <SortIcon field="totalAmount" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {row.totalCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {row.wonCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <WinRateBadge rate={row.winRate} />
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  ¥{row.totalAmount.toLocaleString()}
                </td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-gray-800">合計</td>
                <td className="px-4 py-3 text-right text-gray-800">
                  {totals.totalCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-800">
                  {totals.wonCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <WinRateBadge rate={overallWinRate} />
                </td>
                <td className="px-4 py-3 text-right text-gray-800">
                  ¥{totals.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function WinRateBadge({ rate }: { rate: number }) {
  let colorClass = "bg-gray-100 text-gray-600";
  if (rate >= 70) {
    colorClass = "bg-green-100 text-green-700";
  } else if (rate >= 50) {
    colorClass = "bg-blue-100 text-blue-700";
  } else if (rate >= 30) {
    colorClass = "bg-yellow-100 text-yellow-700";
  } else if (rate > 0) {
    colorClass = "bg-red-100 text-red-700";
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
      {rate}%
    </span>
  );
}
