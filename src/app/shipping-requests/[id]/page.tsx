import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import DetailField from "@/components/DetailField";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShippingRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sr = await prisma.shippingRequest.findUnique({
    where: { id },
    include: {
      account: true,
      variety: true,
      productMaster: { include: { product: true } },
    },
  });

  if (!sr) return notFound();

  return (
    <div>
      <Link
        href="/shipping-requests"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={16} />
        出荷依頼一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {sr.name || `出荷依頼 ${sr.id.slice(0, 8)}`}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">基本情報</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="名前" value={sr.name} />
            <DetailField
              label="取引先"
              value={
                sr.account ? (
                  <Link href={`/accounts/${sr.account.id}`} className="text-blue-600 hover:underline">
                    {sr.account.name}
                  </Link>
                ) : null
              }
            />
            <DetailField label="品種" value={sr.variety?.name} />
            <DetailField label="商品名" value={sr.productName} />
            <DetailField label="分類" value={sr.classification} />
            <DetailField label="状態" value={sr.status} />
            <DetailField label="依頼者" value={sr.requester} />
            <DetailField label="レポートID" value={sr.reportId} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">数量・金額</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="数量" value={sr.quantity?.toLocaleString()} />
            <DetailField label="CS" value={sr.cs?.toLocaleString()} />
            <DetailField label="ケース数" value={sr.packingCase?.toLocaleString()} />
            <DetailField label="個数換算" value={sr.pieceConversion?.toLocaleString()} />
            <DetailField label="予測数量" value={sr.predictQuantity?.toLocaleString()} />
            <DetailField label="個数換算予測" value={sr.pieceConversionPredict?.toLocaleString()} />
            <DetailField
              label="単価"
              value={sr.unitPrice != null ? `¥${sr.unitPrice.toLocaleString()}` : null}
            />
            <DetailField
              label="売上金額"
              value={sr.salesAmount != null ? `¥${sr.salesAmount.toLocaleString()}` : null}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">出荷詳細</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="産地" value={sr.land} />
            <DetailField label="官報" value={sr.gazette} />
            <DetailField label="殺菌処理" value={sr.sterilizationTreatment} />
            <DetailField label="包装資材" value={sr.packagingMaterial} />
            <DetailField label="荷姿" value={sr.packing} />
            <DetailField label="単位" value={sr.unit} />
            <DetailField label="出荷方法" value={sr.shippingMethod} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">日程</h2>
          <DetailField
            label="センター納品日"
            value={sr.centerDeliveryDate ? format(new Date(sr.centerDeliveryDate), "yyyy/MM/dd") : null}
          />
          <DetailField
            label="出荷予定日"
            value={sr.expectedShippingDate ? format(new Date(sr.expectedShippingDate), "yyyy/MM/dd") : null}
          />

          <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-6 border-b pb-2">関連マスタ</h2>
          <DetailField
            label="商品マスタ"
            value={sr.productMaster?.name}
          />
          <DetailField label="備考" value={sr.note} />
          <div className="mt-4 pt-4 border-t">
            <DetailField label="作成日" value={format(sr.createdAt, "yyyy/MM/dd HH:mm")} />
            <DetailField label="更新日" value={format(sr.updatedAt, "yyyy/MM/dd HH:mm")} />
          </div>
        </div>
      </div>
    </div>
  );
}
