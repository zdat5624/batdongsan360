// eslint-disable-next-line no-unused-vars
import React from "react";
import { Navigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  if (!accessToken || !userId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;