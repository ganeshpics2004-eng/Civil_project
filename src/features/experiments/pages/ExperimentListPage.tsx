import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../components/common/EmptyState";
import { ExperimentCard } from "../components/ExperimentCard";
import { ExperimentFilters } from "../components/ExperimentFilters";
import { useExperiments } from "../hooks/useExperiments";
import { useFilters } from "../hooks/useFilters";
import { useSearch } from "../hooks/useSearch";

export default function ExperimentListPage() {
  const experiments = useExperiments();
  const { query, setQuery, searchedExperiments } = useSearch(experiments);
  const { filters, setFilters, filteredExperiments, resetFilters } = useFilters(searchedExperiments);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Experiments</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {filteredExperiments.length} of {experiments.length} records shown.
          </p>
        </div>
        <Link
          to="/experiments/new"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Add Experiment
        </Link>
      </div>

      <ExperimentFilters
        experiments={experiments}
        query={query}
        setQuery={setQuery}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />

      {filteredExperiments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredExperiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
