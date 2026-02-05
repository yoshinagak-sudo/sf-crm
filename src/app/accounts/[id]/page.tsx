import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import DetailField from "@/components/DetailField";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      parent: true,
      contacts: { take: 20, orderBy: { updatedAt: "desc" } },
      opportunities: {
        take: 20,
        orderBy: { updatedAt: "desc" },
        include: { product2: true },
      },
      cases: { take: 20, orderBy: { updatedAt: "desc" } },
      shippingRequests: {
        take: 20,
        orderBy: { updatedAt: "desc" },
        include: { variety: true },
      },
      productMasters: { take: 20, include: { product: true } },
      magistrateMasters: { take: 20 },
    },
  });

  if (!account) return notFound();

  return (
    <div>
      <Link
        href="/accounts"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={16} />
        取引先一覧に戻る
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{account.name}</h1>
        {account.rank && (
          <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
            ランク: {account.rank}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">基本情報</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="取引先名" value={account.name} />
            <DetailField label="種別" value={account.type} />
            <DetailField label="電話番号" value={account.phone} />
            <DetailField label="FAX" value={account.fax} />
            <DetailField label="ウェブサイト" value={account.website} />
            <DetailField label="業種" value={account.industry} />
            <DetailField label="従業員数" value={account.numberOfEmployees?.toLocaleString()} />
            <DetailField label="取引先コード" value={account.accountCode} />
            <DetailField label="ランク" value={account.rank} />
            <DetailField label="取引先ソース" value={account.accountSource} />
            <DetailField
              label="親取引先"
              value={
                account.parent ? (
                  <Link href={`/accounts/${account.parent.id}`} className="text-blue-600 hover:underline">
                    {account.parent.name}
                  </Link>
                ) : null
              }
            />
            <DetailField label="新規/既存" value={account.newExisting} />
          </div>
        </div>

        {/* Custom Fields */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">詳細情報</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="事業種別" value={account.businessType} />
            <DetailField label="単位" value={account.unit} />
            <DetailField label="産地" value={account.land} />
            <DetailField label="官報" value={account.gazette} />
            <DetailField label="包装資材" value={account.packagingMaterial} />
            <DetailField label="荷姿" value={account.packing} />
            <DetailField label="配送方法" value={account.deliveryMethod} />
            <DetailField label="エリア" value={account.area} />
            <DetailField label="ケース数" value={account.packingCase} />
            <DetailField label="店舗数" value={account.shopNumber} />
            <DetailField label="出荷方法" value={account.shippingMethod} />
            <DetailField label="営業" value={account.sales ? "はい" : "いいえ"} />
            <DetailField label="解約" value={account.termination} />
            <DetailField label="納品" value={account.delivery} />
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">請求先住所</h2>
          <DetailField label="住所" value={[account.billingPostalCode, account.billingState, account.billingCity, account.billingStreet].filter(Boolean).join(" ")} />
          <DetailField label="国" value={account.billingCountry} />

          <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-6 border-b pb-2">出荷先住所</h2>
          <DetailField label="住所" value={[account.shippingPostalCode, account.shippingState, account.shippingCity, account.shippingStreet].filter(Boolean).join(" ")} />
          <DetailField label="国" value={account.shippingCountry} />
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">説明</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {account.description || <span className="text-gray-400">-</span>}
          </p>
          <div className="mt-6 pt-4 border-t">
            <DetailField label="作成日" value={format(account.createdAt, "yyyy/MM/dd HH:mm")} />
            <DetailField label="更新日" value={format(account.updatedAt, "yyyy/MM/dd HH:mm")} />
          </div>
        </div>
      </div>

      {/* Related Contacts */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            取引先責任者 ({account.contacts.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">氏名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">部署</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">役職</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">メール</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">電話</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {account.contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${c.id}`} className="text-blue-600 hover:underline">
                      {c.lastName} {c.firstName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.department || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.title || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || "-"}</td>
                </tr>
              ))}
              {account.contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">データなし</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Opportunities */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            商談 ({account.opportunities.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">商談名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">フェーズ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">金額</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">完了予定日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {account.opportunities.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/opportunities/${o.id}`} className="text-blue-600 hover:underline">
                      {o.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={o.stageName} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {o.amount != null ? `¥${o.amount.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {format(new Date(o.closeDate), "yyyy/MM/dd")}
                  </td>
                </tr>
              ))}
              {account.opportunities.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">データなし</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Cases */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            ケース ({account.cases.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ケース番号</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">件名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">状況</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">優先度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {account.cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`} className="text-blue-600 hover:underline">
                      {c.caseNumber || c.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.subject || "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                </tr>
              ))}
              {account.cases.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">データなし</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Shipping Requests */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            出荷依頼 ({account.shippingRequests.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">名前</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">品種</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">数量</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">センター納品日</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {account.shippingRequests.map((sr) => (
                <tr key={sr.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/shipping-requests/${sr.id}`} className="text-blue-600 hover:underline">
                      {sr.name || sr.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sr.variety?.name || "-"}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {sr.quantity != null ? sr.quantity.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sr.centerDeliveryDate ? format(new Date(sr.centerDeliveryDate), "yyyy/MM/dd") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sr.status} />
                  </td>
                </tr>
              ))}
              {account.shippingRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">データなし</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  let color = "bg-gray-100 text-gray-600";
  if (stage.includes("Closed Won") || stage.includes("成立"))
    color = "bg-green-100 text-green-700";
  else if (stage.includes("Closed Lost") || stage.includes("不成立"))
    color = "bg-red-100 text-red-700";
  else if (stage.includes("Negotiation") || stage.includes("交渉") || stage.includes("提案"))
    color = "bg-yellow-100 text-yellow-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{stage}</span>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-gray-400">-</span>;
  let color = "bg-gray-100 text-gray-600";
  if (status.includes("Closed") || status.includes("完了"))
    color = "bg-green-100 text-green-700";
  else if (status.includes("New") || status.includes("新規"))
    color = "bg-blue-100 text-blue-700";
  else if (status.includes("Working") || status.includes("対応中"))
    color = "bg-yellow-100 text-yellow-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{status}</span>
  );
}

function PriorityBadge({ priority }: { priority?: string | null }) {
  if (!priority) return <span className="text-gray-400">-</span>;
  let color = "bg-gray-100 text-gray-600";
  if (priority === "High" || priority === "高") color = "bg-red-100 text-red-700";
  else if (priority === "Medium" || priority === "中") color = "bg-yellow-100 text-yellow-700";
  else if (priority === "Low" || priority === "低") color = "bg-green-100 text-green-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{priority}</span>
  );
}
