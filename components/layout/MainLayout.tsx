
import React from 'react';
import { Outlet } from 'react-router-dom';
// FIX: Added default export to Sidebar component to resolve module not found error.
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

// IMPROVEMENT: Removed the `children` prop to convert this into a layout route component
// that works with nested routes and <Outlet />.
const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
            {/* IMPROVEMENT: Outlet will render the matched child route component. */}
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;