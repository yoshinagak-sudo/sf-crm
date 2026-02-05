import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-600">
        {totalPages} ページ中 {currentPage} ページ目
      </p>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
          >
            <ChevronLeft size={16} />
          </Link>
        ) : (
          <span className="p-2 text-gray-300">
            <ChevronLeft size={16} />
          </span>
        )}
        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                p === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </Link>
          )
        )}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
          >
            <ChevronRight size={16} />
          </Link>
        ) : (
          <span className="p-2 text-gray-300">
            <ChevronRight size={16} />
          </span>
        )}
      </div>
    </div>
  );
}
