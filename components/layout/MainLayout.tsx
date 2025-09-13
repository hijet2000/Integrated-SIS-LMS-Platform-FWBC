
import React from 'react';
// FIX: Added default export to Sidebar component to resolve module not found error.
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
            {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
