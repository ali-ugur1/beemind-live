import { useEffect, useRef } from "react";

const SHORTCUT_MAP = {
  d: "dashboard",
  l: "list",
  h: "map",
  r: "reports",
  k: "compare",
  t: "calendar",
  p: "profile",
  s: "settings",
  escape: "back",
};

const isEditableTarget = (el) => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
};

const isModalOpen = () =>
  document.querySelector('[role="dialog"], [aria-modal="true"]') !== null;

const useKeyboardShortcuts = (onNavigate, enabled = true) => {
  // onNavigate'i ref'e al — stale closure ve gereksiz effect yeniden çalışmasını önler
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      if (isEditableTarget(e.target)) return;
      if (isModalOpen()) return;

      // Modifier tuşlarla gelen kısayolları yoksay (Ctrl+S gibi)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const action = SHORTCUT_MAP[key];
      if (!action) return;

      e.preventDefault();
      onNavigateRef.current(action);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]); // sadece enabled'a bağlı
};

export default useKeyboardShortcuts;
