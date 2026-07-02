import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { MainLayout } from "../layouts/MainLayout";

const DashboardPage = lazy(() => import("../features/experiments/pages/DashboardPage"));
const ExperimentListPage = lazy(() => import("../features/experiments/pages/ExperimentListPage"));
const ExperimentDetailsPage = lazy(() => import("../features/experiments/pages/ExperimentDetailsPage"));
const ExperimentFormPage = lazy(() => import("../features/experiments/pages/ExperimentFormPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="experiments" element={<ExperimentListPage />} />
          <Route path="experiments/new" element={<ExperimentFormPage />} />
          <Route path="experiments/:id/edit" element={<ExperimentFormPage />} />
          <Route path="experiments/:id" element={<ExperimentDetailsPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
