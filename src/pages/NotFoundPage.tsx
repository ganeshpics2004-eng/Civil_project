import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

export default function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Page not found</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">The requested route does not exist in the CEFP system.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Return to dashboard
      </Link>
    </Card>
  );
}
