import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { registerServiceWorker } from './utils/serviceWorker';

// Register service worker for PWA (production only)
if ((import.meta as any).env?.PROD) {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
