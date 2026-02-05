import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// 商談登録アクション
async function createDeal(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const accountId = formData.get("accountId") as string;
  const amount = formData.get("amount") as string;
  const closeDate = formData.get("closeDate") as string;
  const stageName = formData.get("stageName") as string;
  const description = formData.get("description") as string;

  await prisma.opportunity.create({
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

export default async function NewDealPage() {
  // 取引先一覧を取得
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // デフォルトステージ一覧
  const stages = [
    "見込",
    "アプローチ",
    "提案",
    "交渉",
    "受注",
    "失注",
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">商談を登録</h1>

      <form action={createDeal} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="例: 株式会社A様 新規取引"
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
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="0"
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
              defaultValue={today}
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
              defaultValue="見込"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              placeholder="商談に関するメモを入力..."
            />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            登録する
          </button>
          <a
            href="/u"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
          >
            キャンセル
          </a>
        </div>
      </form>
    </div>
  );
}
