
import React from 'react';

interface PageHeaderProps {
  title: string;
  // FIX: Update the type of the `subtitle` prop to `React.ReactNode` to allow passing JSX elements.
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6 md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
          {title}
        </h1>
        {subtitle && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div className="mt-4 flex md:mt-0 md:ml-4">{actions}</div>}
    </div>
  );
};

export default PageHeader;
