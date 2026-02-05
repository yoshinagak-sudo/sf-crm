import { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  primary: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-700",
  info: "bg-cyan-100 text-cyan-700",
};

// ステージ名に基づいて自動でバリアントを決定するヘルパー
export function getStageVariant(stage: string): BadgeVariant {
  const stageLower = stage.toLowerCase();

  // 商談ステージ
  if (stageLower.includes("成約") || stageLower.includes("won") || stageLower.includes("完了")) {
    return "success";
  }
  if (stageLower.includes("失注") || stageLower.includes("lost") || stageLower.includes("中止")) {
    return "danger";
  }
  if (stageLower.includes("提案") || stageLower.includes("交渉")) {
    return "warning";
  }
  if (stageLower.includes("見込") || stageLower.includes("発掘")) {
    return "info";
  }

  // ケースステータス
  if (stageLower.includes("新規") || stageLower.includes("open")) {
    return "primary";
  }
  if (stageLower.includes("対応中") || stageLower.includes("progress")) {
    return "warning";
  }
  if (stageLower.includes("解決") || stageLower.includes("closed")) {
    return "success";
  }

  return "default";
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
