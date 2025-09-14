import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import Spinner from '@/components/ui/Spinner';
import NotFound from '@/pages/NotFound';
import { schoolRoutes } from '@/lib/routes';

// Public/Guest pages that don't use the main layout
const VerifyCertificate = React.lazy(() => import('@/pages/VerifyCertificate'));
const RedirectDashboard = React.lazy(() => import('@/pages/RedirectDashboard'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>}>
      <Routes>
        {/* Public Verification Route */}
        <Route path="/verify/:serialId" element={<VerifyCertificate />} />

        {/* Redirects for old/root paths */}
        <Route path="/" element={<Navigate to="/school/site_123" replace />} />
        <Route path="/dashboard/:siteId" element={<RedirectDashboard />} />

        {/* Dynamically generated school routes */}
        {schoolRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* Add public and guest routes here if needed */}
        
        {/* 404 Not Found */}
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </Suspense>
  );
};

export default App;