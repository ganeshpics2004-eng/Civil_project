import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, FlaskConical, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { ExperimentRecord } from "../../../types/experiment";
import { formatDate, getExperimentTitle } from "../utils/experimentUtils";

interface ExperimentCardProps {
  experiment: ExperimentRecord;
}

export function ExperimentCard({ experiment }: ExperimentCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            {experiment.material}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{getExperimentTitle(experiment)}</h2>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {formatDate(experiment.basicInformation.experimentDate)}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <FlaskConical className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
        Dust Percentage: {experiment.dustPercentage ?? "Not recorded"}%
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Experiment No.</dt>
          <dd className="font-semibold text-slate-900 dark:text-slate-100">
            {experiment.basicInformation.experimentNumber ?? "Not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Brick Tests</dt>
          <dd className="font-semibold text-slate-900 dark:text-slate-100">{experiment.brickTests.length}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={`/experiments/${experiment.id}`}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          View Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          to={`/experiments/${experiment.id}/edit`}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
        </Link>
      </div>
    </motion.article>
  );
}
