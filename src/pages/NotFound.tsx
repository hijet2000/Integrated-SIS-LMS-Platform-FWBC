import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="p-6 space-y-3 text-center flex flex-col items-center justify-center h-full">
      <h1 className="text-xl font-semibold">404</h1>
      <p className="text-gray-600 dark:text-gray-400">Page not found.</p>
      <Link to="/" className="text-blue-600 dark:text-blue-400 underline">Go home</Link>
    </div>
  );
}
