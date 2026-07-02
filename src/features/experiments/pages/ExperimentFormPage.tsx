import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ExperimentForm } from "../components/ExperimentForm";
import { useExperimentStore } from "../store/experimentStore";

export default function ExperimentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const experiments = useExperimentStore((state) => state.experiments);
  const addExperiment = useExperimentStore((state) => state.addExperiment);
  const updateExperiment = useExperimentStore((state) => state.updateExperiment);
  const existingExperiment = useMemo(() => experiments.find((experiment) => experiment.id === id), [experiments, id]);
  const isEditing = Boolean(id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          {isEditing ? "Edit Experiment" : "Add Experiment"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          {isEditing ? existingExperiment?.id ?? "Experiment not found" : "New Experiment"}
        </h1>
      </div>

      <ExperimentForm
        initialExperiment={existingExperiment}
        onSubmit={(experiment) => {
          if (isEditing) {
            updateExperiment(experiment);
            toast.success("Experiment updated");
          } else {
            addExperiment(experiment);
            toast.success("Experiment added");
          }
          navigate(`/experiments/${experiment.id}`);
        }}
      />
    </div>
  );
}
