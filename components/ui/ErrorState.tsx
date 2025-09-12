
import React from 'react';
import Button from './Button';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ title, message, onRetry }) => {
  return (
    <div className="text-center py-12 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <h3 className="mt-2 text-lg font-medium text-red-800 dark:text-red-200">{title}</h3>
      <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" onClick={onRetry}>Try Again</Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
