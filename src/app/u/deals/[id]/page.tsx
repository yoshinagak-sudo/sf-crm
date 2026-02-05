import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

// ステージ別の色設定
function getStageStyle(stage: string) {
  if (stage.includes("Closed Won") || stage.includes("成立") || stage.includes("受注"))
    return "bg-green-100 text-green-700";
  if (stage.includes("Closed Lost") || stage.includes("不成立") || stage.includes("失注"))
    return "bg-red-100 text-red-700";
  if (stage.includes("Negotiation") || stage.includes("交渉") || stage.includes("提案"))
    return "bg-yellow-100 text-yellow-700";
  if (stage.includes("Prospecting") || stage.includes("見込") || stage.includes("アプローチ"))
    return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
}

// 商談更新アクション
async function updateDeal(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const accountId = formData.get("accountId") as string;
  const amount = formData.get("amount") as string;
  const closeDate = formData.get("closeDate") as string;
  const stageName = formData.get("stageName") as string;
  const description = formData.get("description") as string;

  await prisma.opportunity.update({
    where: { id },
    data: {
      name,
      accountId: accountId || null,
      amount: amount ? parseFloat(amount) : null,
      closeDate: new Date(closeDate),
      stageName,
      description: description || null,
    },
  });

  redirect("/u");
}

// ステージ更新アクション（クイック更新）
async function updateStage(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const stageName = formData.get("stageName") as string;

  const isClosed = stageName.includes("受注") || stageName.includes("失注") ||
                   stageName.includes("Closed Won") || stageName.includes("Closed Lost");
  const isWon = stageName.includes("受注") || stageName.includes("Closed Won");

  await prisma.opportunity.update({
    where: { id },
    data: {
      stageName,
      isClosed,
      isWon: isClosed && isWon,
    },
  });

  redirect(`/u/deals/${id}`);
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const deal = await prisma.opportunity.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!deal) {
    notFound();
  }

  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const stages = [
    "見込",
    "アプローチ",
    "提案",
    "交渉",
    "受注",
    "失注",
  ];

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/u"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            一覧に戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{deal.name}</h1>
        </div>
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${getStageStyle(deal.stageName)}`}
        >
          {deal.stageName}
        </span>
      </div>

      {/* クイックステージ更新 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">ステージを更新</p>
        <form action={updateStage} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={deal.id} />
          {stages.map((stage) => (
            <button
              key={stage}
              type="submit"
              name="stageName"
              value={stage}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                deal.stageName === stage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {stage}
            </button>
          ))}
        </form>
      </div>

      {/* 詳細情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">詳細情報</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">取引先</dt>
            <dd className="font-medium text-gray-800">
              {deal.account?.name || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">金額</dt>
            <dd className="font-medium text-gray-800">
              {deal.amount != null ? `¥${deal.amount.toLocaleString()}` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">完了予定日</dt>
            <dd className="font-medium text-gray-800">
              {format(new Date(deal.closeDate), "yyyy/MM/dd")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">更新日</dt>
            <dd className="font-medium text-gray-800">
              {format(new Date(deal.updatedAt), "yyyy/MM/dd HH:mm")}
            </dd>
          </div>
        </dl>
        {deal.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <dt className="text-sm text-gray-500 mb-1">説明・メモ</dt>
            <dd className="text-gray-800 whitespace-pre-wrap">
              {deal.description}
            </dd>
          </div>
        )}
      </div>

      {/* 編集フォーム */}
      <details className="bg-white rounded-xl border border-gray-200">
        <summary className="px-6 py-4 cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors font-medium">
          詳細を編集
        </summary>
        <form action={updateDeal} className="p-6 pt-0 space-y-5">
          <input type="hidden" name="id" value={deal.id} />

          {/* 商談名 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              商談名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={deal.name}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* 取引先 */}
          <div>
            <label
              htmlFor="accountId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              取引先
            </label>
            <select
              id="accountId"
              name="accountId"
              defaultValue={deal.accountId || ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            >
              <option value="">選択してください</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* 金額 */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              金額
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                ¥
              </span>
              <input
                type="number"
                id="amount"
                name="amount"
                min="0"
                step="1"
                defaultValue={deal.amount || ""}
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* 完了予定日 */}
          <div>
            <label
              htmlFor="closeDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              完了予定日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="closeDate"
              name="closeDate"
              required
              defaultValue={format(new Date(deal.closeDate), "yyyy-MM-dd")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* ステージ */}
          <div>
            <label
              htmlFor="stageName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ステージ <span className="text-red-500">*</span>
            </label>
            <select
              id="stageName"
              name="stageName"
              required
              defaultValue={deal.stageName}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* 説明 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              説明・メモ
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={deal.description || ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* ボタン */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              更新する
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
