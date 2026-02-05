import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const tab = params.tab || "tasks";

  const spObj: Record<string, string> = {};
  if (search) spObj.search = search;
  spObj.tab = tab;

  if (tab === "events") {
    const where = search
      ? {
          OR: [
            { subject: { contains: search, mode: "insensitive" as const } },
            { account: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDateTime: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        include: { account: true },
      }),
      prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / PER_PAGE);

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">活動</h1>
          <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
        </div>

        <TabSwitcher current={tab} search={search} />

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <SearchBar defaultValue={search} placeholder="件名・取引先名で検索" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">件名</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">種別</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">開始日時</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">終了日時</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">場所</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">同行者</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {event.subject || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {event.account ? (
                        <Link href={`/accounts/${event.account.id}`} className="text-blue-600 hover:underline">
                          {event.account.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{event.type || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {event.startDateTime
                        ? format(new Date(event.startDateTime), "yyyy/MM/dd HH:mm")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {event.endDateTime
                        ? format(new Date(event.endDateTime), "yyyy/MM/dd HH:mm")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{event.location || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{event.companion || "-"}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
              basePath="/activities"
              searchParams={spObj}
            />
          </div>
        </div>
      </div>
    );
  }

  // Tasks tab (default)
  const where = search
    ? {
        OR: [
          { subject: { contains: search, mode: "insensitive" as const } },
          { account: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [tasks, total] = await Promise.all([
    prisma.sfTask.findMany({
      where,
      orderBy: { activityDate: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { account: true },
    }),
    prisma.sfTask.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">活動</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} 件</span>
      </div>

      <TabSwitcher current={tab} search={search} />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchBar defaultValue={search} placeholder="件名・取引先名で検索" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">件名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">取引先</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">状況</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">優先度</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">期日</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">同行者</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {task.subject || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {task.account ? (
                      <Link href={`/accounts/${task.account.id}`} className="text-blue-600 hover:underline">
                        {task.account.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {task.activityDate
                      ? format(new Date(task.activityDate), "yyyy/MM/dd")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{task.companion || "-"}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
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
            basePath="/activities"
            searchParams={spObj}
          />
        </div>
      </div>
    </div>
  );
}

function TabSwitcher({ current, search }: { current: string; search: string }) {
  const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
  return (
    <div className="flex gap-1 mb-4">
      <a
        href={`/activities?tab=tasks&page=1${searchQuery}`}
        className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
          current === "tasks"
            ? "bg-white text-blue-600 border border-b-0 border-gray-200"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
      >
        ToDo
      </a>
      <a
        href={`/activities?tab=events&page=1${searchQuery}`}
        className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
          current === "events"
            ? "bg-white text-blue-600 border border-b-0 border-gray-200"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
      >
        行動
      </a>
    </div>
  );
}

function TaskStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-gray-400">-</span>;
  let color = "bg-gray-100 text-gray-600";
  if (status.includes("Completed") || status.includes("完了"))
    color = "bg-green-100 text-green-700";
  else if (status.includes("Not Started") || status.includes("未着手"))
    color = "bg-blue-100 text-blue-700";
  else if (status.includes("In Progress") || status.includes("進行中"))
    color = "bg-yellow-100 text-yellow-700";
  else if (status.includes("Deferred") || status.includes("延期"))
    color = "bg-red-100 text-red-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${color}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string | null }) {
  if (!priority) return <span className="text-gray-400">-</span>;
  let color = "bg-gray-100 text-gray-600";
  if (priority === "High" || priority === "高") color = "bg-red-100 text-red-700";
  else if (priority === "Normal" || priority === "中") color = "bg-yellow-100 text-yellow-700";
  else if (priority === "Low" || priority === "低") color = "bg-green-100 text-green-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${color}`}>
      {priority}
    </span>
  );
}
