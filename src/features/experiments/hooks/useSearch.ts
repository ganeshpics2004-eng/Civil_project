import { useMemo, useState } from "react";
import type { ExperimentRecord } from "../../../types/experiment";
import { searchExperiments } from "../utils/experimentUtils";

export function useSearch(experiments: ExperimentRecord[]) {
  const [query, setQuery] = useState("");
  const searchedExperiments = useMemo(() => searchExperiments(experiments, query), [experiments, query]);

  return { query, setQuery, searchedExperiments };
}
