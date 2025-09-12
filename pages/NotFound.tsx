
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Page Not Found</h2>
      <p className="mt-4 text-base text-gray-500 dark:text-gray-400">Sorry, we couldn’t find the page you’re looking for.</p>
      <div className="mt-6">
        <Link to="/">
            <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
