import type { ReactNode } from "react";
import { Card } from "../../../components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
      </div>
    </Card>
  );
}
