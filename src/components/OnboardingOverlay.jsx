import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  List,
  Map,
  FileText,
  Keyboard,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const ONBOARDING_KEY = "hexora_onboarding_done";

export const shouldShowOnboarding = () => {
  try {
    return !localStorage.getItem(ONBOARDING_KEY);
  } catch {
    // localStorage erişilemezse (private mode vb.) onboarding'i gösterme
    return false;
  }
};

const OnboardingOverlay = ({ onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const steps = [
    {
      title: t.onboarding.step1Title,
      desc: t.onboarding.step1Desc,
      icon: Home,
      color: "bg-amber-500/20 text-amber-400",
    },
    {
      title: t.onboarding.step2Title,
      desc: t.onboarding.step2Desc,
      icon: List,
      color: "bg-emerald-500/20 text-emerald-400",
    },
    {
      title: t.onboarding.step3Title,
      desc: t.onboarding.step3Desc,
      icon: Map,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      title: t.onboarding.step4Title,
      desc: t.onboarding.step4Desc,
      icon: FileText,
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      title: t.onboarding.step5Title,
      desc: t.onboarding.step5Desc,
      icon: Keyboard,
      color: "bg-cyan-500/20 text-cyan-400",
    },
  ];

  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;
  const current = steps[step];
  const Icon = current.icon;

  const handleComplete = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // Sessizce geç: localStorage erişilemese bile akışı bitir
    }
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handlePrev = useCallback(() => {
    setStep((prev) => Math.max(0, prev - 1));
  }, []);

  // Klavye navigasyonu + ESC kapatma + scroll kilitleme + focus yönetimi
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    dialogRef.current?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (isLastStep) {
          handleComplete();
        } else {
          handleNext();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Odayı önceki elemana geri ver
      if (
        previouslyFocusedRef.current &&
        typeof previouslyFocusedRef.current.focus === "function"
      ) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isLastStep, handleSkip, handleComplete, handleNext, handlePrev]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-desc"
      onClick={handleSkip}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-full bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl animate-scale-in focus:outline-none"
      >
        {/* Header */}
        <div className="relative p-8 text-center">
          {isFirstStep && (
            <h2 className="text-3xl font-bold text-gray-100 mb-2">
              {t.onboarding.welcome}
            </h2>
          )}
          <button
            onClick={handleSkip}
            aria-label={t.onboarding.skip || "Close"}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="px-8 pb-6">
          <div
            className={`w-20 h-20 rounded-2xl ${current.color} flex items-center justify-center mx-auto mb-6 transition-colors`}
            aria-hidden="true"
          >
            <Icon className="w-10 h-10" />
          </div>
          <h3
            id="onboarding-title"
            className="text-xl font-bold text-gray-100 text-center mb-2"
          >
            {current.title}
          </h3>
          <p
            id="onboarding-desc"
            className="text-gray-400 text-center leading-relaxed"
          >
            {current.desc}
          </p>
        </div>

        {/* Progress Dots */}
        <div
          className="flex items-center justify-center gap-2 pb-6"
          role="tablist"
          aria-label={`Step ${step + 1} of ${steps.length}`}
        >
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                i === step
                  ? "w-6 bg-amber-500"
                  : "w-2 bg-gray-700 hover:bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.onboarding.prev}
          </button>

          {!isLastStep ? (
            <button
              onClick={handleNext}
              autoFocus
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-amber-500"
            >
              {t.onboarding.next}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              autoFocus
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-amber-500"
            >
              {t.onboarding.finish}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
