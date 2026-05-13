import { createContext, useContext, useState } from "react";

const EasyModeContext = createContext({ isEasyMode: false, toggleEasyMode: () => {} });

export const EasyModeProvider = ({ children }) => {
  const [isEasyMode, setIsEasyMode] = useState(() => {
    try {
      return localStorage.getItem("beemora_easy_mode") === "true";
    } catch {
      return false;
    }
  });

  const toggleEasyMode = () => {
    setIsEasyMode((v) => {
      const next = !v;
      try {
        localStorage.setItem("beemora_easy_mode", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <EasyModeContext.Provider value={{ isEasyMode, toggleEasyMode }}>
      {children}
    </EasyModeContext.Provider>
  );
};

export const useEasyMode = () => useContext(EasyModeContext);
