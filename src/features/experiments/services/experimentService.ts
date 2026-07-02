import { experiments, workbookAnalysis } from "../../../data";
import type { ExperimentRecord } from "../../../types/experiment";

export function getAllExperiments(): ExperimentRecord[] {
  return experiments;
}

export function getWorkbookAnalysis() {
  return workbookAnalysis;
}
