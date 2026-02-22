import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Home, List, Map, FileText, Keyboard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ONBOARDING_KEY = 'beemind_onboarding_done';

export const shouldShowOnboarding = () => {
  try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
};

const OnboardingOverlay = ({ onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t.onboarding.step1Title,
      desc: t.onboarding.step1Desc,
      icon: Home,
      color: 'bg-amber-500/20 text-amber-400',
    },
    {
      title: t.onboarding.step2Title,
      desc: t.onboarding.step2Desc,
      icon: List,
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      title: t.onboarding.step3Title,
      desc: t.onboarding.step3Desc,
      icon: Map,
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      title: t.onboarding.step4Title,
      desc: t.onboarding.step4Desc,
      icon: FileText,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      title: t.onboarding.step5Title,
      desc: t.onboarding.step5Desc,
      icon: Keyboard,
      color: 'bg-cyan-500/20 text-cyan-400',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleComplete = () => {
    try { localStorage.setItem(ONBOARDING_KEY, 'true'); } catch {}
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="relative p-8 text-center">
          {step === 0 && (
            <h2 className="text-3xl font-bold text-gray-100 mb-2">{t.onboarding.welcome}</h2>
          )}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="px-8 pb-6">
          <div className={`w-20 h-20 rounded-2xl ${current.color} flex items-center justify-center mx-auto mb-6`}>
            <Icon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-100 text-center mb-2">{current.title}</h3>
          <p className="text-gray-400 text-center leading-relaxed">{current.desc}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 pb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-amber-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.onboarding.prev}
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              {t.onboarding.next}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
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
