"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export interface StageData {
  stage: string;
  count: number;
  amount: number;
}

interface StageChartProps {
  data: StageData[];
  startDate?: Date;
  endDate?: Date;
  type?: "count" | "amount";
}

const COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#EC4899", // pink-500
  "#6366F1", // indigo-500
];

export default function StageChart({
  data,
  type = "count",
}: StageChartProps) {
  const chartData = data.map((item) => ({
    name: item.stage,
    value: type === "count" ? item.count : item.amount,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        データがありません
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (type === "amount") {
      return `¥${value.toLocaleString()}`;
    }
    return `${value}件`;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatValue(value as number), ""]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
