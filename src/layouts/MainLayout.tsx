import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../components/common/ScrollToTop";
import { Navbar } from "../components/layout/Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
