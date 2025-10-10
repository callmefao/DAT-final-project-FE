import { ReactNode } from "react";

type ResultCardProps = {
  title: string;
  subtitle?: string;
  score?: number;
  status: "success" | "error" | "info";
};

const statusStyles: Record<ResultCardProps["status"], string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-600",
  error: "bg-red-50 border-red-200 text-red-600",
  info: "bg-slate-50 border-slate-200 text-slate-600"
};

const icons: Record<ResultCardProps["status"], ReactNode> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 9v4m0 4h.01M10.29 4.86l-6 10.5A2 2 0 006.03 18h11.94a2 2 0 001.74-2.64l-6-10.5a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 8h.01M11 12h1v4h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
};

const ResultCard = ({ title, subtitle, score, status }: ResultCardProps) => {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${statusStyles[status]}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-current/40 bg-white">
        {icons[status]}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-800">
          {title}
        </span>
        {subtitle && <span className="text-xs text-slate-600">{subtitle}</span>}
        {typeof score === "number" && (
          <span className="text-xs text-slate-500">Confidence score: {score.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
