import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 用AuthProvider包裹，让所有组件都能访问登录状态 */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
