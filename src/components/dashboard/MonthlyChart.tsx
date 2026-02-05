"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface MonthlyData {
  month: string; // "2024-01" format
  count: number;
  amount: number;
  wonCount?: number;
  wonAmount?: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
  startDate?: Date;
  endDate?: Date;
  showWon?: boolean;
}

export default function MonthlyChart({
  data,
  showWon = false,
}: MonthlyChartProps) {
  const chartData = data.map((item) => ({
    name: formatMonth(item.month),
    商談数: item.count,
    金額: item.amount,
    ...(showWon && {
      成約数: item.wonCount || 0,
      成約金額: item.wonAmount || 0,
    }),
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(value) => `${value}件`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(value) => formatAmount(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            formatter={(value, name) => {
              const numValue = value as number;
              const strName = name as string;
              if (strName.includes("金額")) {
                return [`¥${numValue.toLocaleString()}`, strName];
              }
              return [`${numValue}件`, strName];
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-slate-600">{value}</span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="商談数"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          {showWon && (
            <Bar
              yAxisId="left"
              dataKey="成約数"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          )}
          <Bar
            yAxisId="right"
            dataKey="金額"
            fill="#F59E0B"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          {showWon && (
            <Bar
              yAxisId="right"
              dataKey="成約金額"
              fill="#06B6D4"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${year}/${m}`;
}

function formatAmount(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(0)}億`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万`;
  }
  return `${value}`;
}
