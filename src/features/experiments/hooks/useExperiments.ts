import { useExperimentStore } from "../store/experimentStore";

export function useExperiments() {
  return useExperimentStore((state) => state.experiments);
}
