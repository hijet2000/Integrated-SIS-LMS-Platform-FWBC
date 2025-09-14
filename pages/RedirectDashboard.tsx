import React from "react";
import { Navigate, useParams } from "react-router-dom";

export default function RedirectDashboard() {
  const { siteId } = useParams();
  return <Navigate to={`/school/${siteId ?? "site_123"}`} replace />;
}