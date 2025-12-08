import React from "react";
import { Outlet } from "react-router-dom";

const AuthenticationLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <Outlet />
    </div>
  );
};

export default AuthenticationLayout;
