export interface ExperimentDataset {
  generatedFrom: string;
  generatedAt: string;
  analysis: DatasetAnalysis;
  experiments: ExperimentRecord[];
}

export interface DatasetAnalysis {
  workbook: string;
  sheetCount: number;
  sheets: DatasetSheet[];
  detectedStructure: DetectedStructure;
  schema: DatasetSchema;
}

export interface DatasetSheet {
  name: string;
  dimension: string;
  mergedRanges: string[];
  nonEmptyRows: number;
}

export interface DetectedStructure {
  compactRecipeRecords: number;
  detailedExperimentSections: number;
  totalExperimentRecords: number;
  sectionStarts: number[];
}

export interface DatasetSchema {
  experiment: string;
  relationships: string[];
}

export interface ExperimentRecord {
  id: string;
  material: string;
  dustPercentage: number | null;
  basicInformation: BasicInformation;
  mixDesign: MixDesign;
  waterAbsorptionTest: WaterAbsorptionTest;
  acidCuringTest: AcidCuringTest;
  brickTests: BrickTest[];
  acidCuringResults: StrengthResult[];
  muffleFurnaceResults: StrengthResult[];
}

export interface BasicInformation {
  experimentNumber: number | null;
  experimentDate: string | null;
}

export interface MixDesign {
  dustKg: number | null;
  cementKg: number | null;
  pSandKg: number | null;
  dustComposition?: number | null;
  cementComposition?: number | null;
  pSandComposition?: number | null;
  fiber: FiberDetails | null;
  waterLitres: number | null;
  curingStartDate: string | null;
  curingEndDate: string | null;
}

export interface FiberDetails {
  material: string;
  description: string;
}

export interface AcidCuringTest {
  takenOutFromCuringTankDate?: string | null;
  takenOutFromCuringTank?: string | null;
  acidCuringStartDate: string | null;
  acidSolution: AcidSolution;
  brickIds: string[];
  testsPerformed: string[];
}

export interface AcidSolution {
  acidType: string | null;
  acidVolumeMl: number | null;
  waterVolumeLitres: number | null;
}

export interface WaterAbsorptionTest {
  before: WaterAbsorptionEntry[];
  after: WaterAbsorptionEntry[];
}

export interface WaterAbsorptionEntry {
  brickId: string;
  weightKg: number | null;
}

export interface BrickTest {
  brickId: string;
  weightKg: number | null;
  lengthCm: number | null;
  breadthCm: number | null;
  heightCm: number | null;
  areaMm2: number | null;
  ultimateLoadKn: number | null;
  compressiveStrengthNPerMm2: number | null;
  flexuralStrengthNPerMm2: number | null;
}

export interface StrengthResult {
  brickId: string;
  ultimateLoadKn: number | null;
  areaMm2: number | null;
  compressiveStrengthNPerMm2: number | null;
}

export interface ExperimentFilters {
  material: string;
  dustPercentage: string;
}
