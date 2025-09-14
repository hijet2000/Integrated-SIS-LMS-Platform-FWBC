import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/useAuth';

import MainLayout from '@/components/layout/MainLayout';
import Spinner from '@/components/ui/Spinner';
import NotFound from '@/pages/NotFound';
import { schoolRoutes } from '@/lib/routes';

// Public/Guest pages that don't use the main layout
const VerifyCertificate = React.lazy(() => import('@/pages/VerifyCertificate'));
const RedirectDashboard = React.lazy(() => import('@/pages/RedirectDashboard'));

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>}>
            <Routes>
              {/* Public Verification Route */}
              <Route path="/verify/:serialId" element={<VerifyCertificate />} />

              {/* Redirects for old/root paths */}
              <Route path="/" element={<RedirectDashboard />} />
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
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;