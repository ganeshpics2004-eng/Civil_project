import { SearchX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <SearchX className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No experiments found</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Adjust the search or filters to see more records.</p>
    </div>
  );
}
