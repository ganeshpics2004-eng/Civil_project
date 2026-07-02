import { BarChart3, Beaker, Droplets, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { ExperimentCard } from "../components/ExperimentCard";
import { ExperimentFilters } from "../components/ExperimentFilters";
import { StatCard } from "../components/StatCard";
import { useExperiments } from "../hooks/useExperiments";
import { useFilters } from "../hooks/useFilters";
import { useSearch } from "../hooks/useSearch";
import { formatDate, getExperimentStats, getExperimentTitle } from "../utils/experimentUtils";

export default function DashboardPage() {
  const experiments = useExperiments();
  const stats = getExperimentStats(experiments);
  const { query, setQuery, searchedExperiments } = useSearch(experiments);
  const { filters, setFilters, filteredExperiments, resetFilters } = useFilters(searchedExperiments);
  const featuredExperiment = experiments[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Research experiment archive
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
            CEFP Experiment Management System
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
            Browse CEFP experiment records with mix design, water absorption, brick tests, acid curing, and muffle furnace results.
          </p>
        </div>
        {featuredExperiment && (
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-400">Featured Experiment</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{getExperimentTitle(featuredExperiment)}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {formatDate(featuredExperiment.basicInformation.experimentDate)}
            </p>
            <Link
              to={`/experiments/${featuredExperiment.id}`}
              className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Open details
            </Link>
          </Card>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Experiments" value={stats.totalExperiments} icon={<Beaker className="h-5 w-5" />} />
        <StatCard label="Unique Materials" value={stats.uniqueMaterials} icon={<Layers className="h-5 w-5" />} />
        <StatCard label="Dust Percentages" value={stats.dustPercentages} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Average Cement" value={`${stats.averageCement.toFixed(1)} kg`} icon={<Droplets className="h-5 w-5" />} />
      </section>

      <ExperimentFilters
        experiments={experiments}
        query={query}
        setQuery={setQuery}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Recent Experiments</h2>
          <Link to="/experiments" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredExperiments.slice(0, 6).map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      </section>
    </div>
  );
}
