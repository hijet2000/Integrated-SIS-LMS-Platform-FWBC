import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function SisDashboard() {
  const { siteId } = useParams();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">FWBC SIS/LMS</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome. Current site: <span className="font-mono">{siteId}</span>
      </p>
      <div className="flex gap-3">
        <Link className="px-3 py-2 rounded bg-black text-white" to={`/school/${siteId}/students`}>
          Students
        </Link>
        <Link className="px-3 py-2 rounded bg-black text-white" to={`/education/${siteId}`}>
          LMS
        </Link>
      </div>
    </div>
  );
}
