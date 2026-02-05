import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where = search
    ? {
        OR: [
          { lastName: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { account: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { account: true },
    }),
    prisma.contact.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const spObj: Record<string, string> = {};
  if (search) spObj.search = search;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">取引先責任者</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchBar defaultValue={search} placeholder="氏名・メール・取引先名で検索" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">氏名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">メール</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">電話番号</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">部署</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">役職</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {contact.lastName} {contact.firstName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {contact.account ? (
                      <Link
                        href={`/accounts/${contact.account.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.account.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contact.email || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{contact.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{contact.department || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{contact.title || "-"}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    データが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/contacts"
            searchParams={spObj}
          />
        </div>
      </div>
    </div>
  );
}
