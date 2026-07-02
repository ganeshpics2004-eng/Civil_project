import type { ExperimentFilters, ExperimentRecord } from "../../../types/experiment";

export function formatNumber(value: number | null | undefined, unit = "") {
  if (typeof value !== "number") {
    return "Not recorded";
  }

  return unit ? `${value} ${unit}` : String(value);
}

export function formatDate(value: string | null | undefined) {
  return value ?? "Not recorded";
}

export function getExperimentTitle(experiment: ExperimentRecord) {
  const number = experiment.basicInformation.experimentNumber;
  const suffix = typeof number === "number" ? ` #${number}` : "";
  return `${experiment.material} ${experiment.dustPercentage ?? "N/A"}%${suffix}`;
}

export function getUniqueMaterials(experiments: ExperimentRecord[]) {
  return Array.from(new Set(experiments.map((experiment) => experiment.material))).sort();
}

export function getUniqueDustPercentages(experiments: ExperimentRecord[]) {
  return Array.from(
    new Set(
      experiments
        .map((experiment) => experiment.dustPercentage)
        .filter((value): value is number => typeof value === "number"),
    ),
  ).sort((a, b) => a - b);
}

export function searchExperiments(experiments: ExperimentRecord[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return experiments;
  }

  return experiments.filter((experiment) => {
    const searchable = [
      experiment.id,
      experiment.material,
      experiment.dustPercentage,
      experiment.basicInformation.experimentNumber,
      experiment.basicInformation.experimentDate,
    ]
      .filter((value) => value !== null && value !== undefined)
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

export function filterExperiments(experiments: ExperimentRecord[], filters: ExperimentFilters) {
  return experiments.filter((experiment) => {
    const materialMatches = !filters.material || experiment.material === filters.material;
    const dustMatches = !filters.dustPercentage || String(experiment.dustPercentage) === filters.dustPercentage;

    return materialMatches && dustMatches;
  });
}

export function getExperimentStats(experiments: ExperimentRecord[]) {
  const materials = getUniqueMaterials(experiments);
  const dustPercentages = getUniqueDustPercentages(experiments);
  const averageCement =
    experiments.reduce((sum, experiment) => sum + (experiment.mixDesign.cementKg ?? 0), 0) /
    Math.max(experiments.length, 1);
  const averageWater =
    experiments.reduce((sum, experiment) => sum + (experiment.mixDesign.waterLitres ?? 0), 0) /
    Math.max(experiments.length, 1);

  const materialCounts = materials.map((material) => ({
    name: material,
    value: experiments.filter((experiment) => experiment.material === material).length,
  }));
  const dustCounts = dustPercentages.map((dust) => ({
    name: `${dust}%`,
    value: experiments.filter((experiment) => experiment.dustPercentage === dust).length,
  }));

  return {
    totalExperiments: experiments.length,
    uniqueMaterials: materials.length,
    dustPercentages: dustPercentages.length,
    averageCement,
    averageWater,
    materialCounts,
    dustCounts,
    mostUsedMaterial: [...materialCounts].sort((a, b) => b.value - a.value)[0]?.name ?? "Not recorded",
    mostCommonDustPercentage: [...dustCounts].sort((a, b) => b.value - a.value)[0]?.name ?? "Not recorded",
  };
}
