import datasetJson from "./experiments.json";
import type { ExperimentDataset, ExperimentRecord } from "../types/experiment";

export const experimentDataset = datasetJson as ExperimentDataset;
export const experiments: ExperimentRecord[] = experimentDataset.experiments;
export const workbookAnalysis = {
  ...experimentDataset.analysis,
  detectedStructure: {
    ...experimentDataset.analysis.detectedStructure,
    totalExperimentRecords: experiments.length,
    detailedExperimentSections: experiments.length,
  },
};
