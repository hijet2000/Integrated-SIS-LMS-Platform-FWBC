import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

const Placeholder: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle = "This feature is currently under construction." }) => {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Full functionality for the <strong>{title}</strong> module will be implemented here soon. This page serves as a placeholder for the navigation and routing structure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Placeholder;
