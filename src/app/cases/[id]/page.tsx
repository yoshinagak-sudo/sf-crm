import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import DetailField from "@/components/DetailField";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseRecord = await prisma.case.findUnique({
    where: { id },
    include: {
      account: true,
      contact: true,
    },
  });

  if (!caseRecord) return notFound();

  function statusColor(status?: string | null) {
    if (!status) return "bg-gray-100 text-gray-700";
    if (status.includes("Closed") || status.includes("完了"))
      return "bg-green-100 text-green-700";
    if (status.includes("New") || status.includes("新規"))
      return "bg-blue-100 text-blue-700";
    if (status.includes("Working") || status.includes("対応中"))
      return "bg-yellow-100 text-yellow-700";
    if (status.includes("Escalated"))
      return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
    <div>
      <Link
        href="/cases"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={16} />
        ケース一覧に戻る
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {caseRecord.subject || `ケース #${caseRecord.caseNumber}`}
        </h1>
        {caseRecord.status && (
          <span className={`text-sm px-3 py-1 rounded-full font-semibold ${statusColor(caseRecord.status)}`}>
            {caseRecord.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">基本情報</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="ケース番号" value={caseRecord.caseNumber} />
            <DetailField label="件名" value={caseRecord.subject} />
            <DetailField label="種別" value={caseRecord.type} />
            <DetailField label="状況" value={caseRecord.status} />
            <DetailField label="優先度" value={caseRecord.priority} />
            <DetailField label="発生源" value={caseRecord.origin} />
            <DetailField label="原因" value={caseRecord.reason} />
            <DetailField label="完了" value={caseRecord.isClosed ? "はい" : "いいえ"} />
            <DetailField label="エスカレーション" value={caseRecord.isEscalated ? "はい" : "いいえ"} />
            <DetailField
              label="完了日"
              value={caseRecord.closedDate ? format(new Date(caseRecord.closedDate), "yyyy/MM/dd") : null}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">関連情報</h2>
          <DetailField
            label="取引先"
            value={
              caseRecord.account ? (
                <Link href={`/accounts/${caseRecord.account.id}`} className="text-blue-600 hover:underline">
                  {caseRecord.account.name}
                </Link>
              ) : null
            }
          />
          <DetailField
            label="取引先責任者"
            value={
              caseRecord.contact ? (
                <Link href={`/contacts/${caseRecord.contact.id}`} className="text-blue-600 hover:underline">
                  {caseRecord.contact.lastName} {caseRecord.contact.firstName}
                </Link>
              ) : null
            }
          />

          <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-6 border-b pb-2">カスタム項目</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField
              label="対応期限"
              value={caseRecord.closeLimit ? format(new Date(caseRecord.closeLimit), "yyyy/MM/dd") : null}
            />
            <DetailField
              label="発生日"
              value={caseRecord.happeningDate ? format(new Date(caseRecord.happeningDate), "yyyy/MM/dd") : null}
            />
            <DetailField label="所感" value={caseRecord.feeling} />
            <DetailField label="工場名" value={caseRecord.factoryName} />
            <DetailField label="誤出荷先" value={caseRecord.goshitekisya} />
            <DetailField label="原因分類" value={caseRecord.reasonClass} />
            <DetailField label="原因詳細" value={caseRecord.reasonDetail} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">説明</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {caseRecord.description || <span className="text-gray-400">-</span>}
          </p>
          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-x-6">
            <DetailField label="作成日" value={format(caseRecord.createdAt, "yyyy/MM/dd HH:mm")} />
            <DetailField label="更新日" value={format(caseRecord.updatedAt, "yyyy/MM/dd HH:mm")} />
          </div>
        </div>
      </div>
    </div>
  );
}
