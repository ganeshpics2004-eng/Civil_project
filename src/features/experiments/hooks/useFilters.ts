import { useMemo, useState } from "react";
import type { ExperimentFilters, ExperimentRecord } from "../../../types/experiment";
import { filterExperiments } from "../utils/experimentUtils";

const defaultFilters: ExperimentFilters = {
  material: "",
  dustPercentage: "",
};

export function useFilters(experiments: ExperimentRecord[]) {
  const [filters, setFilters] = useState<ExperimentFilters>(defaultFilters);
  const filteredExperiments = useMemo(() => filterExperiments(experiments, filters), [experiments, filters]);

  const resetFilters = () => setFilters(defaultFilters);

  return { filters, setFilters, filteredExperiments, resetFilters };
}
