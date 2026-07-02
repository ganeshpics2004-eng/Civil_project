import { RotateCcw, Search } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/Button";
import type { ExperimentFilters as Filters, ExperimentRecord } from "../../../types/experiment";
import { getUniqueDustPercentages, getUniqueMaterials } from "../utils/experimentUtils";

interface ExperimentFiltersProps {
  experiments: ExperimentRecord[];
  query: string;
  setQuery: (value: string) => void;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  resetFilters: () => void;
}

export function ExperimentFilters({
  experiments,
  query,
  setQuery,
  filters,
  setFilters,
  resetFilters,
}: ExperimentFiltersProps) {
  const materials = getUniqueMaterials(experiments);
  const dustPercentages = getUniqueDustPercentages(experiments);

  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1.5fr_1fr_1fr_auto]">
      <label className="relative block">
        <span className="sr-only">Search experiments</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by material, experiment ID, experiment number, or dust percentage"
          className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-900"
        />
      </label>

      <label>
        <span className="sr-only">Material</span>
        <select
          value={filters.material}
          onChange={(event) => setFilters((current) => ({ ...current, material: event.target.value }))}
          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">All materials</option>
          {materials.map((material) => (
            <option key={material} value={material}>
              {material}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Dust percentage</span>
        <select
          value={filters.dustPercentage}
          onChange={(event) => setFilters((current) => ({ ...current, dustPercentage: event.target.value }))}
          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">All dust %</option>
          {dustPercentages.map((dust) => (
            <option key={dust} value={dust}>
              {dust}%
            </option>
          ))}
        </select>
      </label>

      <Button variant="secondary" onClick={resetFilters}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
      </Button>
    </section>
  );
}
