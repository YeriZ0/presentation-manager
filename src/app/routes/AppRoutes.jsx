import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { InitialRoute } from './InitialRoute.jsx';

const PresenterLayout = lazy(() => import('../layouts/PresenterLayout.jsx'));
const ControllerLayout = lazy(() => import('../layouts/ControllerLayout.jsx'));

export function AppRoutes() {
    return (
        <Suspense
            fallback={
                <p className="route-loading" role="status">
                    Cargando aplicación…
                </p>
            }
        >
            <Routes>
                <Route path="/" element={<InitialRoute />} />
                <Route path="/presenter" element={<PresenterLayout />}>
                    <Route index element={null} />
                    <Route path="live" element={null} />
                </Route>
                <Route path="/controller" element={<ControllerLayout />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}
