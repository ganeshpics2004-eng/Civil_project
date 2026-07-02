import { ArrowLeft, Copy, Download, Pencil, Printer, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { type ReactNode, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { BrickTest, StrengthResult, WaterAbsorptionEntry } from "../../../types/experiment";
import { useExperimentStore } from "../store/experimentStore";
import { formatDate, formatNumber, getExperimentTitle } from "../utils/experimentUtils";

interface DataTableProps {
  headers: string[];
  rows: ReactNode[][];
  emptyText: string;
}

function DataTable({ headers, rows, emptyText }: DataTableProps) {
  if (rows.length === 0) {
    return <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
          <tr>
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function findWeight(entries: WaterAbsorptionEntry[], brickId: string) {
  return entries.find((entry) => entry.brickId === brickId)?.weightKg ?? null;
}

function strengthRows(results: StrengthResult[]) {
  return results.map((result) => [
    result.brickId,
    formatNumber(result.areaMm2, "mm2"),
    formatNumber(result.ultimateLoadKn, "kN"),
    formatNumber(result.compressiveStrengthNPerMm2, "N/mm2"),
  ]);
}

function compressiveRows(tests: BrickTest[]) {
  return tests.filter((test) => test.compressiveStrengthNPerMm2 !== null).map((test) => [
    test.brickId,
    formatNumber(test.weightKg, "kg"),
    formatNumber(test.lengthCm, "cm"),
    formatNumber(test.breadthCm, "cm"),
    formatNumber(test.heightCm, "cm"),
    formatNumber(test.areaMm2, "mm2"),
    formatNumber(test.ultimateLoadKn, "kN"),
    formatNumber(test.compressiveStrengthNPerMm2, "N/mm2"),
  ]);
}

function flexuralRows(tests: BrickTest[]) {
  return tests.filter((test) => test.flexuralStrengthNPerMm2 !== null).map((test) => [
    test.brickId,
    formatNumber(test.weightKg, "kg"),
    formatNumber(test.lengthCm, "cm"),
    formatNumber(test.breadthCm, "cm"),
    formatNumber(test.heightCm, "cm"),
    formatNumber(test.areaMm2, "mm2"),
    formatNumber(test.ultimateLoadKn, "kN"),
    formatNumber(test.flexuralStrengthNPerMm2, "N/mm2"),
  ]);
}

export default function ExperimentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const experiments = useExperimentStore((state) => state.experiments);
  const removeExperiment = useExperimentStore((state) => state.removeExperiment);
  const experiment = useMemo(() => experiments.find((item) => item.id === id), [experiments, id]);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: experiment ? getExperimentTitle(experiment) : "CEFP Experiment",
  });

  if (!experiment) {
    return (
      <Card>
        <h1 className="text-xl font-bold">Experiment not found</h1>
        <Button className="mt-4" onClick={() => navigate("/experiments")}>
          <ArrowLeft className="h-4 w-4" /> Back to Experiments
        </Button>
      </Card>
    );
  }

  const title = getExperimentTitle(experiment);
  const waterBrickIds = Array.from(
    new Set([
      ...experiment.waterAbsorptionTest.before.map((entry) => entry.brickId),
      ...experiment.waterAbsorptionTest.after.map((entry) => entry.brickId),
    ]),
  );
  const summaryRows = [
    ["Material", experiment.material],
    ["Dust %", formatNumber(experiment.dustPercentage, "%")],
    ["Experiment Date", formatDate(experiment.basicInformation.experimentDate)],
    ["Experiment Number", experiment.basicInformation.experimentNumber ?? "Not recorded"],
  ];
  const mixRows = [
    ["Dust", formatNumber(experiment.mixDesign.dustKg, "kg")],
    ["Cement", formatNumber(experiment.mixDesign.cementKg, "kg")],
    ["P Sand", formatNumber(experiment.mixDesign.pSandKg, "kg")],
    ["Fiber", experiment.mixDesign.fiber?.description ?? "Not recorded"],
    ["Water", formatNumber(experiment.mixDesign.waterLitres, "litres")],
    ["Curing Start Date", formatDate(experiment.mixDesign.curingStartDate)],
    ["Curing End Date", formatDate(experiment.mixDesign.curingEndDate)],
  ];

  const copyDetails = async () => {
    await navigator.clipboard.writeText(
      [...summaryRows, ...mixRows].map(([label, value]) => `${label}: ${value}`).join("\n"),
    );
    toast.success("Experiment details copied");
  };

  const downloadPdf = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(title, 14, 18);
    pdf.setFontSize(10);
    [...summaryRows, ...mixRows].forEach(([label, value], index) => {
      pdf.text(`${label}: ${value}`, 14, 32 + index * 8);
    });
    pdf.save(`${experiment.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link to="/experiments" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => handlePrint()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/experiments/${experiment.id}/edit`)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="secondary" onClick={downloadPdf}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="secondary" onClick={copyDetails}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              removeExperiment(experiment.id);
              toast.success("Experiment removed");
              navigate("/experiments");
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{experiment.id}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{title}</h1>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {summaryRows.map(([label, value]) => (
              <div key={String(label)} className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 font-semibold text-slate-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <Card>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Experiment Summary</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryRows.map(([label, value]) => (
              <div key={String(label)} className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Mix Design</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mixRows.map(([label, value]) => (
              <div key={String(label)} className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Water Absorption</h2>
          <div className="mt-4">
            <DataTable
              headers={["Brick", "Before", "After"]}
              rows={waterBrickIds.map((brickId) => [
                brickId,
                formatNumber(findWeight(experiment.waterAbsorptionTest.before, brickId), "kg"),
                formatNumber(findWeight(experiment.waterAbsorptionTest.after, brickId), "kg"),
              ])}
              emptyText="No water absorption results recorded."
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Compressive Strength</h2>
          <div className="mt-4">
            <DataTable
              headers={[
                "Brick ID",
                "Weight",
                "Length",
                "Breadth",
                "Height",
                "Area",
                "Ultimate Load",
                "Compressive Strength",
              ]}
              rows={compressiveRows(experiment.brickTests)}
              emptyText="No compressive strength brick tests recorded."
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Flexural Strength</h2>
          <div className="mt-4">
            <DataTable
              headers={[
                "Brick ID",
                "Weight",
                "Length",
                "Breadth",
                "Height",
                "Area",
                "Ultimate Load",
                "Flexural Strength",
              ]}
              rows={flexuralRows(experiment.brickTests)}
              emptyText="No flexural strength brick tests recorded."
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Acid Curing Results</h2>
          <div className="mt-4">
            <DataTable
              headers={["Brick", "Area", "Ultimate Load", "Compressive Strength"]}
              rows={strengthRows(experiment.acidCuringResults)}
              emptyText="No acid curing results recorded."
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Muffle Furnace Results</h2>
          <div className="mt-4">
            <DataTable
              headers={["Brick", "Area", "Ultimate Load", "Compressive Strength"]}
              rows={strengthRows(experiment.muffleFurnaceResults)}
              emptyText="No muffle furnace results recorded."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

