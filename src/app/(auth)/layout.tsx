export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SF</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">SF-CRM</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">営業管理システム</p>
        </div>

        {/* コンテンツ */}
        {children}
      </div>
    </div>
  );
}
