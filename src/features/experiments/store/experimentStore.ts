import { create } from "zustand";
import { persist } from "zustand/middleware";
import { experiments as initialExperiments } from "../../../data";
import type { ExperimentRecord } from "../../../types/experiment";

interface ExperimentState {
  experiments: ExperimentRecord[];
  addExperiment: (experiment: ExperimentRecord) => void;
  updateExperiment: (experiment: ExperimentRecord) => void;
  removeExperiment: (id: string) => void;
}

export function getCuringEndDate(curingStartDate: string | null) {
  if (!curingStartDate) {
    return null;
  }

  const date = new Date(`${curingStartDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setDate(date.getDate() + 28);
  return date.toISOString().slice(0, 10);
}

function withComputedCuringEndDate(experiment: ExperimentRecord): ExperimentRecord {
  return {
    ...experiment,
    mixDesign: {
      ...experiment.mixDesign,
      curingEndDate: getCuringEndDate(experiment.mixDesign.curingStartDate),
    },
  };
}

export const useExperimentStore = create<ExperimentState>()(
  persist(
    (set) => ({
      experiments: initialExperiments.map(withComputedCuringEndDate),
      addExperiment: (experiment) =>
        set((state) => ({
          experiments: [...state.experiments.filter((item) => item.id !== experiment.id), withComputedCuringEndDate(experiment)],
        })),
      updateExperiment: (experiment) =>
        set((state) => ({
          experiments: state.experiments.map((item) =>
            item.id === experiment.id ? withComputedCuringEndDate(experiment) : item,
          ),
        })),
      removeExperiment: (id) =>
        set((state) => ({
          experiments: state.experiments.filter((experiment) => experiment.id !== id),
        })),
    }),
    {
      name: "cefp-experiments",
    },
  ),
);
