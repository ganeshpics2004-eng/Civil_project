import { Plus, Save, Trash2 } from "lucide-react";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { BrickTest, ExperimentRecord, StrengthResult, WaterAbsorptionEntry } from "../../../types/experiment";
import { getCuringEndDate } from "../store/experimentStore";

interface ExperimentFormProps {
  initialExperiment?: ExperimentRecord;
  onSubmit: (experiment: ExperimentRecord) => void;
}

const defaultExperiment: ExperimentRecord = {
  id: "",
  material: "",
  dustPercentage: null,
  basicInformation: {
    experimentNumber: null,
    experimentDate: null,
  },
  mixDesign: {
    dustKg: null,
    cementKg: null,
    pSandKg: null,
    fiber: null,
    waterLitres: null,
    curingStartDate: null,
    curingEndDate: null,
  },
  acidCuringTest: {
    takenOutFromCuringTankDate: null,
    acidCuringStartDate: null,
    acidSolution: {
      acidType: null,
      acidVolumeMl: null,
      waterVolumeLitres: null,
    },
    brickIds: [],
    testsPerformed: [],
  },
  waterAbsorptionTest: {
    before: [],
    after: [],
  },
  brickTests: [],
  acidCuringResults: [],
  muffleFurnaceResults: [],
};

function numberOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function stringOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function emptyWaterEntry(): WaterAbsorptionEntry {
  return { brickId: "", weightKg: null };
}

function emptyBrickTest(): BrickTest {
  return {
    brickId: "",
    weightKg: null,
    lengthCm: null,
    breadthCm: null,
    heightCm: null,
    areaMm2: null,
    ultimateLoadKn: null,
    compressiveStrengthNPerMm2: null,
    flexuralStrengthNPerMm2: null,
  };
}

function emptyStrengthResult(): StrengthResult {
  return {
    brickId: "",
    areaMm2: null,
    ultimateLoadKn: null,
    compressiveStrengthNPerMm2: null,
  };
}

function cleanWaterEntries(entries: WaterAbsorptionEntry[]) {
  return entries.filter((entry) => entry.brickId.trim() || entry.weightKg !== null);
}

function cleanBrickTests(entries: BrickTest[]) {
  return entries.filter((entry) => entry.brickId.trim());
}

function cleanStrengthResults(entries: StrengthResult[]) {
  return entries.filter((entry) => entry.brickId.trim());
}

export function ExperimentForm({ initialExperiment, onSubmit }: ExperimentFormProps) {
  const experiment = initialExperiment ?? defaultExperiment;
  const [curingStartDate, setCuringStartDate] = useState(experiment.mixDesign.curingStartDate ?? "");
  const [waterBefore, setWaterBefore] = useState<WaterAbsorptionEntry[]>(experiment.waterAbsorptionTest.before);
  const [waterAfter, setWaterAfter] = useState<WaterAbsorptionEntry[]>(experiment.waterAbsorptionTest.after);
  const [brickTests, setBrickTests] = useState<BrickTest[]>(experiment.brickTests);
  const [acidCuringResults, setAcidCuringResults] = useState<StrengthResult[]>(experiment.acidCuringResults);
  const [muffleFurnaceResults, setMuffleFurnaceResults] = useState<StrengthResult[]>(experiment.muffleFurnaceResults);
  const curingEndDate = useMemo(() => getCuringEndDate(curingStartDate || null), [curingStartDate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") ?? "").trim();
    const material = String(form.get("material") ?? "").trim();

    if (!id || !material) {
      throw new Error("Experiment ID and material are required.");
    }

    const fiberMaterial = String(form.get("fiberMaterial") ?? "").trim();
    const fiberDescription = String(form.get("fiberDescription") ?? "").trim();

    const nextExperiment: ExperimentRecord = {
      id,
      material,
      dustPercentage: numberOrNull(form.get("dustPercentage")),
      basicInformation: {
        experimentNumber: numberOrNull(form.get("experimentNumber")),
        experimentDate: stringOrNull(form.get("experimentDate")),
      },
      mixDesign: {
        dustKg: numberOrNull(form.get("dustKg")),
        cementKg: numberOrNull(form.get("cementKg")),
        pSandKg: numberOrNull(form.get("pSandKg")),
        fiber: fiberMaterial || fiberDescription ? { material: fiberMaterial, description: fiberDescription } : null,
        waterLitres: numberOrNull(form.get("waterLitres")),
        curingStartDate: stringOrNull(form.get("curingStartDate")),
        curingEndDate,
      },
      acidCuringTest: {
        takenOutFromCuringTankDate: stringOrNull(form.get("takenOutFromCuringTankDate")),
        acidCuringStartDate: stringOrNull(form.get("acidCuringStartDate")),
        acidSolution: {
          acidType: stringOrNull(form.get("acidType")),
          acidVolumeMl: numberOrNull(form.get("acidVolumeMl")),
          waterVolumeLitres: numberOrNull(form.get("acidWaterVolumeLitres")),
        },
        brickIds: splitList(form.get("brickIds")),
        testsPerformed: splitList(form.get("testsPerformed")),
      },
      waterAbsorptionTest: {
        before: cleanWaterEntries(waterBefore),
        after: cleanWaterEntries(waterAfter),
      },
      brickTests: cleanBrickTests(brickTests),
      acidCuringResults: cleanStrengthResults(acidCuringResults),
      muffleFurnaceResults: cleanStrengthResults(muffleFurnaceResults),
    };

    onSubmit(nextExperiment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Basic Information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Experiment ID" name="id" defaultValue={experiment.id} required />
          <Field label="Material" name="material" defaultValue={experiment.material} required />
          <Field label="Dust Percentage" name="dustPercentage" type="number" defaultValue={experiment.dustPercentage ?? ""} />
          <Field label="Experiment Number" name="experimentNumber" type="number" defaultValue={experiment.basicInformation.experimentNumber ?? ""} />
          <Field label="Experiment Date" name="experimentDate" type="date" defaultValue={experiment.basicInformation.experimentDate ?? ""} />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Mix Design</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Dust Kg" name="dustKg" type="number" step="0.001" defaultValue={experiment.mixDesign.dustKg ?? ""} />
          <Field label="Cement Kg" name="cementKg" type="number" step="0.001" defaultValue={experiment.mixDesign.cementKg ?? ""} />
          <Field label="P Sand Kg" name="pSandKg" type="number" step="0.001" defaultValue={experiment.mixDesign.pSandKg ?? ""} />
          <Field label="Fiber Material" name="fiberMaterial" defaultValue={experiment.mixDesign.fiber?.material ?? ""} />
          <Field label="Fiber Description" name="fiberDescription" defaultValue={experiment.mixDesign.fiber?.description ?? ""} />
          <Field label="Water Litres" name="waterLitres" type="number" step="0.001" defaultValue={experiment.mixDesign.waterLitres ?? ""} />
          <Field
            label="Curing Start Date"
            name="curingStartDate"
            type="date"
            value={curingStartDate}
            onChange={(value) => setCuringStartDate(value)}
          />
          <Field label="Curing End Date" name="curingEndDate" type="date" value={curingEndDate ?? ""} disabled />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Acid Curing Test</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Taken Out Date" name="takenOutFromCuringTankDate" type="date" defaultValue={experiment.acidCuringTest.takenOutFromCuringTankDate ?? ""} />
          <Field label="Acid Curing Start Date" name="acidCuringStartDate" type="date" defaultValue={experiment.acidCuringTest.acidCuringStartDate ?? ""} />
          <Field label="Acid Type" name="acidType" defaultValue={experiment.acidCuringTest.acidSolution.acidType ?? ""} />
          <Field label="Acid Volume Ml" name="acidVolumeMl" type="number" defaultValue={experiment.acidCuringTest.acidSolution.acidVolumeMl ?? ""} />
          <Field label="Water Volume Litres" name="acidWaterVolumeLitres" type="number" defaultValue={experiment.acidCuringTest.acidSolution.waterVolumeLitres ?? ""} />
          <Field label="Brick IDs" name="brickIds" defaultValue={experiment.acidCuringTest.brickIds.join(", ")} />
          <Field label="Tests Performed" name="testsPerformed" defaultValue={experiment.acidCuringTest.testsPerformed.join(", ")} />
        </div>
      </Card>

      <WaterAbsorptionTable title="Water Absorption Before" rows={waterBefore} setRows={setWaterBefore} />
      <WaterAbsorptionTable title="Water Absorption After" rows={waterAfter} setRows={setWaterAfter} />
      <BrickTestTable rows={brickTests} setRows={setBrickTests} />
      <StrengthResultTable title="Acid Curing Results" rows={acidCuringResults} setRows={setAcidCuringResults} />
      <StrengthResultTable title="Muffle Furnace Results" rows={muffleFurnaceResults} setRows={setMuffleFurnaceResults} />

      <div className="flex justify-end">
        <Button type="submit">
          <Save className="h-4 w-4" /> Save Experiment
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string | number;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
}

function Field({ label, name, type = "text", step, defaultValue, value, disabled, required, onChange }: FieldProps) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-800"
      />
    </label>
  );
}

interface TableInputProps {
  value: string | number | null;
  type?: string;
  step?: string;
  onChange: (value: string) => void;
}

function TableInput({ value, type = "text", step, onChange }: TableInputProps) {
  return (
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full min-w-28 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950"
    />
  );
}

function TableShell({ title, children, onAdd }: { title: string; children: ReactNode; onAdd: () => void }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
        <Button type="button" variant="secondary" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add Row
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </Card>
  );
}

function WaterAbsorptionTable({ title, rows, setRows }: { title: string; rows: WaterAbsorptionEntry[]; setRows: (rows: WaterAbsorptionEntry[]) => void }) {
  return (
    <TableShell title={title} onAdd={() => setRows([...rows, emptyWaterEntry()])}>
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="px-3 py-2 text-left">Brick ID</th>
            <th className="px-3 py-2 text-left">Weight Kg</th>
            <th className="px-3 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="px-3 py-2"><TableInput value={row.brickId} onChange={(value) => setRows(rows.map((item, i) => i === index ? { ...item, brickId: value } : item))} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.weightKg} onChange={(value) => setRows(rows.map((item, i) => i === index ? { ...item, weightKg: value ? Number(value) : null } : item))} /></td>
              <td className="px-3 py-2"><Button type="button" variant="ghost" onClick={() => setRows(rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function BrickTestTable({ rows, setRows }: { rows: BrickTest[]; setRows: (rows: BrickTest[]) => void }) {
  const update = (index: number, key: keyof BrickTest, value: string) => {
    setRows(rows.map((row, i) => i === index ? { ...row, [key]: key === "brickId" ? value : value ? Number(value) : null } : row));
  };

  return (
    <TableShell title="Brick Tests" onAdd={() => setRows([...rows, emptyBrickTest()])}>
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>{["Brick ID", "Weight", "Length", "Breadth", "Height", "Area", "Ultimate Load", "Compressive Strength", "Flexural Strength", "Action"].map((header) => <th key={header} className="px-3 py-2 text-left whitespace-nowrap">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="px-3 py-2"><TableInput value={row.brickId} onChange={(value) => update(index, "brickId", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.weightKg} onChange={(value) => update(index, "weightKg", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.lengthCm} onChange={(value) => update(index, "lengthCm", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.breadthCm} onChange={(value) => update(index, "breadthCm", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.heightCm} onChange={(value) => update(index, "heightCm", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.areaMm2} onChange={(value) => update(index, "areaMm2", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.ultimateLoadKn} onChange={(value) => update(index, "ultimateLoadKn", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.compressiveStrengthNPerMm2} onChange={(value) => update(index, "compressiveStrengthNPerMm2", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.flexuralStrengthNPerMm2} onChange={(value) => update(index, "flexuralStrengthNPerMm2", value)} /></td>
              <td className="px-3 py-2"><Button type="button" variant="ghost" onClick={() => setRows(rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function StrengthResultTable({ title, rows, setRows }: { title: string; rows: StrengthResult[]; setRows: (rows: StrengthResult[]) => void }) {
  const update = (index: number, key: keyof StrengthResult, value: string) => {
    setRows(rows.map((row, i) => i === index ? { ...row, [key]: key === "brickId" ? value : value ? Number(value) : null } : row));
  };

  return (
    <TableShell title={title} onAdd={() => setRows([...rows, emptyStrengthResult()])}>
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>{["Brick ID", "Area", "Ultimate Load", "Compressive Strength", "Action"].map((header) => <th key={header} className="px-3 py-2 text-left whitespace-nowrap">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="px-3 py-2"><TableInput value={row.brickId} onChange={(value) => update(index, "brickId", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.areaMm2} onChange={(value) => update(index, "areaMm2", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.ultimateLoadKn} onChange={(value) => update(index, "ultimateLoadKn", value)} /></td>
              <td className="px-3 py-2"><TableInput type="number" step="0.001" value={row.compressiveStrengthNPerMm2} onChange={(value) => update(index, "compressiveStrengthNPerMm2", value)} /></td>
              <td className="px-3 py-2"><Button type="button" variant="ghost" onClick={() => setRows(rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

