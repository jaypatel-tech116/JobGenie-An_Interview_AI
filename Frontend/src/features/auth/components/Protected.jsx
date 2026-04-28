import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from "react";

const Protected = ({ children }) => {
  const { loading, user, authChecked } = useAuth();

  if (loading || !authChecked) {
    return (
      <main style={{ padding: 24, textAlign: "center" }}>
        <span className="spinner" />
      </main>
    );
  }

  if (!user) {
    return <Navigate to={"/login"} />;
  }

  return children;
};

export default Protected;
