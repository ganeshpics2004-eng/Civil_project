import { Code2, Database, FileText, Layers } from "lucide-react";
import { Card } from "../components/ui/Card";
import { workbookAnalysis } from "../data";

const stack = ["React 19", "TypeScript", "Vite", "Tailwind CSS", "React Router", "TanStack Table", "Recharts", "Framer Motion", "Zustand"];

export default function AboutPage() {
  const sheet = workbookAnalysis.sheets[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">About Project</h1>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
          This application presents CEFP research experiments as a searchable, responsive archive using the current structured
          experiment dataset.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <FileText className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Dataset</p>
          <p className="font-bold">{workbookAnalysis.workbook}</p>
        </Card>
        <Card>
          <Database className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Dataset Scope</p>
          <p className="font-bold">{sheet.dimension}</p>
        </Card>
        <Card>
          <Layers className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Records</p>
          <p className="font-bold">{workbookAnalysis.detectedStructure.totalExperimentRecords}</p>
        </Card>
        <Card>
          <Code2 className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Developer</p>
          <p className="font-bold">Senior Full Stack Engineering Build</p>
        </Card>
      </section>

      <Card>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Dataset Structure</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-300 md:grid-cols-2">
          <p>Total experiments: {workbookAnalysis.detectedStructure.totalExperimentRecords}</p>
          <p>Detailed experiment records: {workbookAnalysis.detectedStructure.detailedExperimentSections}</p>
          <p>Dataset entries: {sheet.nonEmptyRows}</p>
          <p>Materials and test results are grouped per experiment.</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Proposed JSON Schema</h2>
        <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
{`ExperimentRecord {
  id: string
  material: string
  dustPercentage: number | null
  basicInformation: BasicInformation
  mixDesign: MixDesign
  waterAbsorptionTest: WaterAbsorptionTest
  acidCuringTest: AcidCuringTest
  brickTests: BrickTest[]
  acidCuringResults: StrengthResult[]
  muffleFurnaceResults: StrengthResult[]
}`}
        </pre>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Technology Stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {stack.map((item) => (
            <span key={item} className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold dark:bg-slate-800">
              {item}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
