
import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, actionText, onAction }) => {
  return (
    <div className="text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
