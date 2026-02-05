import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import DetailField from "@/components/DetailField";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      account: true,
      contact: true,
      campaign: true,
      product2: true,
    },
  });

  if (!opportunity) return notFound();

  function stageBadgeColor(stage: string) {
    if (stage.includes("Closed Won") || stage.includes("成立"))
      return "bg-green-100 text-green-700";
    if (stage.includes("Closed Lost") || stage.includes("不成立"))
      return "bg-red-100 text-red-700";
    if (stage.includes("Negotiation") || stage.includes("交渉") || stage.includes("提案"))
      return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  }

  return (
    <div>
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={16} />
        商談一覧に戻る
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{opportunity.name}</h1>
        <span
          className={`text-sm px-3 py-1 rounded-full font-semibold ${stageBadgeColor(opportunity.stageName)}`}
        >
          {opportunity.stageName}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">基本情報</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="商談名" value={opportunity.name} />
            <DetailField label="フェーズ" value={opportunity.stageName} />
            <DetailField
              label="金額"
              value={opportunity.amount != null ? `¥${opportunity.amount.toLocaleString()}` : null}
            />
            <DetailField
              label="完了予定日"
              value={format(new Date(opportunity.closeDate), "yyyy/MM/dd")}
            />
            <DetailField label="種別" value={opportunity.type} />
            <DetailField label="リードソース" value={opportunity.leadSource} />
            <DetailField label="次のステップ" value={opportunity.nextStep} />
            <DetailField label="予測カテゴリ" value={opportunity.forecastCategory} />
            <DetailField label="完了" value={opportunity.isClosed ? "はい" : "いいえ"} />
            <DetailField label="成約" value={opportunity.isWon ? "はい" : "いいえ"} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">関連情報</h2>
          <DetailField
            label="取引先"
            value={
              opportunity.account ? (
                <Link href={`/accounts/${opportunity.account.id}`} className="text-blue-600 hover:underline">
                  {opportunity.account.name}
                </Link>
              ) : null
            }
          />
          <DetailField
            label="取引先責任者"
            value={
              opportunity.contact ? (
                <Link href={`/contacts/${opportunity.contact.id}`} className="text-blue-600 hover:underline">
                  {opportunity.contact.lastName} {opportunity.contact.firstName}
                </Link>
              ) : null
            }
          />
          <DetailField label="キャンペーン" value={opportunity.campaign?.name} />
          <DetailField label="商品" value={opportunity.product2?.name} />
          <DetailField label="状態" value={opportunity.status} />
          <DetailField label="精度" value={opportunity.accuracy} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">営業情報</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="プロセス" value={opportunity.process} />
            <DetailField label="顧客課題" value={opportunity.customerTask} />
            <DetailField label="顧客ソリューション" value={opportunity.customerSolution} />
            <DetailField label="潜在ニーズ" value={opportunity.potentialNeeds} />
            <DetailField label="予算状況" value={opportunity.budgetSituation} />
            <DetailField label="キーマン" value={opportunity.keyman} />
            <DetailField label="競合" value={opportunity.competitor} />
            <DetailField label="バリュープロポジション" value={opportunity.valueProposition} />
            <DetailField label="予算" value={opportunity.budget} />
            <DetailField label="権限" value={opportunity.authority} />
            <DetailField label="ニーズ" value={opportunity.needs} />
            <DetailField label="タイムフレーム" value={opportunity.timeframe} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">結果・数値</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="不成立理由" value={opportunity.lossReason} />
            <DetailField label="失注理由" value={opportunity.lostOrderReason} />
            <DetailField label="受注理由" value={opportunity.orderReason} />
            <DetailField label="受注理由メモ" value={opportunity.orderReasonNote} />
            <DetailField label="成果メモ" value={opportunity.outcomeNote} />
            <DetailField
              label="株数"
              value={opportunity.stocksNumber?.toLocaleString()}
            />
            <DetailField
              label="kg"
              value={opportunity.kg?.toLocaleString()}
            />
            <DetailField
              label="売上金額"
              value={opportunity.salesAmount != null ? `¥${opportunity.salesAmount.toLocaleString()}` : null}
            />
            <DetailField
              label="商談日"
              value={opportunity.opportunityDate ? format(new Date(opportunity.opportunityDate), "yyyy/MM/dd") : null}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">説明</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {opportunity.description || <span className="text-gray-400">-</span>}
          </p>
          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-x-6">
            <DetailField label="作成日" value={format(opportunity.createdAt, "yyyy/MM/dd HH:mm")} />
            <DetailField label="更新日" value={format(opportunity.updatedAt, "yyyy/MM/dd HH:mm")} />
          </div>
        </div>
      </div>
    </div>
  );
}
