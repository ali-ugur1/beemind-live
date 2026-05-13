import { useState, useRef, useCallback } from "react";

export function useSpeechInput({ onResult, lang = "tr" }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recogRef = useRef(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!supported) {
      setError(
        lang === "tr"
          ? "Tarayıcınız ses girişini desteklemiyor"
          : "Your browser doesn't support voice input",
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = lang === "tr" ? "tr-TR" : "en-US";
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recog.onerror = (event) => {
      setIsListening(false);
      if (event.error !== "aborted") {
        setError(
          lang === "tr"
            ? "Ses anlaşılamadı, tekrar deneyin"
            : "Speech not recognized, try again",
        );
      }
    };

    recog.onend = () => {
      setIsListening(false);
    };

    recogRef.current = recog;
    try {
      recog.start();
    } catch {
      setIsListening(false);
    }
  }, [supported, lang, onResult]);

  const stop = useCallback(() => {
    try {
      recogRef.current?.stop();
    } catch {}
    setIsListening(false);
  }, []);

  return { isListening, error, supported, start, stop };
}
