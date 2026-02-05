interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
}

export default function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-sm text-gray-900">{value || <span className="text-gray-400">-</span>}</dd>
    </div>
  );
}
