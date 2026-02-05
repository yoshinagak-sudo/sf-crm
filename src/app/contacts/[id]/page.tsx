import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import DetailField from "@/components/DetailField";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      account: true,
      opportunities: {
        take: 20,
        orderBy: { updatedAt: "desc" },
        include: { account: true },
      },
      cases: {
        take: 20,
        orderBy: { updatedAt: "desc" },
        include: { account: true },
      },
    },
  });

  if (!contact) return notFound();

  const fullName = `${contact.lastName} ${contact.firstName || ""}`.trim();

  return (
    <div>
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={16} />
        取引先責任者一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">{fullName}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">基本情報</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="姓" value={contact.lastName} />
            <DetailField label="名" value={contact.firstName} />
            <DetailField label="敬称" value={contact.salutation} />
            <DetailField
              label="取引先"
              value={
                contact.account ? (
                  <Link href={`/accounts/${contact.account.id}`} className="text-blue-600 hover:underline">
                    {contact.account.name}
                  </Link>
                ) : null
              }
            />
            <DetailField label="役職" value={contact.title} />
            <DetailField label="部署" value={contact.department} />
            <DetailField label="ポジション" value={contact.position} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">連絡先</h2>
          <DetailField label="メール" value={contact.email} />
          <DetailField label="電話番号" value={contact.phone} />
          <DetailField label="携帯電話" value={contact.mobilePhone} />
          <DetailField label="FAX" value={contact.fax} />

          <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-6 border-b pb-2">住所</h2>
          <DetailField
            label="郵送先住所"
            value={[contact.mailingPostalCode, contact.mailingState, contact.mailingCity, contact.mailingStreet]
              .filter(Boolean)
              .join(" ")}
          />
          <DetailField label="国" value={contact.mailingCountry} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">その他</h2>
          <div className="grid grid-cols-2 gap-x-6">
            <DetailField label="個人ニーズ" value={contact.personalNeeds} />
            <DetailField label="作成日" value={format(contact.createdAt, "yyyy/MM/dd HH:mm")} />
            <DetailField label="更新日" value={format(contact.updatedAt, "yyyy/MM/dd HH:mm")} />
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">商談 ({contact.opportunities.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">商談名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">フェーズ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">金額</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">完了予定日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contact.opportunities.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/opportunities/${o.id}`} className="text-blue-600 hover:underline">{o.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.account?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{o.stageName}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {o.amount != null ? `¥${o.amount.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{format(new Date(o.closeDate), "yyyy/MM/dd")}</td>
                </tr>
              ))}
              {contact.opportunities.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">データなし</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Cases */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">ケース ({contact.cases.length})</h2>
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
              {contact.cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`} className="text-blue-600 hover:underline">
                      {c.caseNumber || c.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.subject || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{c.status || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.priority || "-"}</td>
                </tr>
              ))}
              {contact.cases.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">データなし</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
