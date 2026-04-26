import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import App from "./App.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./App.css";

// ─── 404 Page ────────────────────────────────────────────────────────────────

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl mb-4" role="img" aria-label="arı">
          🐝
        </p>
        <h1 className="text-4xl font-bold text-gray-100 mb-2">404</h1>
        <p className="text-gray-400 mb-6">
          Bu sayfa bulunamadı / Page not found
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
          >
            Ana Sayfa
          </button>
          <button
            onClick={() => navigate("/panel")}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Panel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PWA Service Worker ───────────────────────────────────────────────────────

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const onLoad = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("[Hexora] SW registered, scope:", reg.scope);

      const interval = setInterval(() => reg.update(), 60 * 60 * 1000);

      // Cleanup interval if SW is later unregistered
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "redundant") clearInterval(interval);
        });
      });
    } catch (err) {
      console.warn("[Hexora] SW registration failed:", err);
    }
  };

  if (document.readyState === "complete") {
    onLoad();
  } else {
    window.addEventListener("load", onLoad, { once: true });
  }
}

registerServiceWorker();

// ─── Root ─────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/panel/*" element={<App />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
