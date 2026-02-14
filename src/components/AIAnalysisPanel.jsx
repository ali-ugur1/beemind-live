import { X, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { useEffect } from 'react';

const AIAnalysisPanel = ({ isOpen, onClose, hive }) => {
  // ESC ile kapat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !hive) return null;

  // AI Analizi (Mock - gerçekte AI modelinden gelecek)
  const analysis = {
    healthScore: hive.status === 'critical' ? 45 : hive.status === 'warning' ? 70 : 92,
    predictions: [
      {
        type: 'swarm',
        risk: hive.status === 'critical' ? 'high' : 'low',
        probability: hive.status === 'critical' ? '85%' : '12%',
        timeframe: '3-5 gün içinde',
        recommendation: hive.status === 'critical' 
          ? 'Acil müdahale gerekli. Oğul riski yüksek.'
          : 'Normal izleme yeterli.'
      },
      {
        type: 'production',
        value: '2.8 kg/hafta',
        trend: 'stable',
        recommendation: 'Bal üretimi normal seviyelerde devam ediyor.'
      },
      {
        type: 'health',
        status: hive.status === 'critical' ? 'poor' : 'good',
        issues: hive.status === 'critical' 
          ? ['Yüksek sıcaklık', 'Anormal ses seviyeleri']
          : [],
        recommendation: hive.status === 'critical'
          ? 'Havalandırmayı artırın ve koloniye müdahale edin.'
          : 'Rutin kontroller yeterli.'
      }
    ],
    actions: hive.status === 'critical' 
      ? [
          '1. Kovana hemen müdahale edin',
          '2. Havalandırmayı kontrol edin',
          '3. Ana arıyı kontrol edin',
          '4. 24 saat içinde tekrar ölçüm yapın'
        ]
      : [
          '1. Haftalık rutin kontrole devam edin',
          '2. Su kaynaklarını kontrol edin',
          '3. Bal hasadı için 2 hafta daha bekleyin'
        ]
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-400' };
    if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-400' };
    return { bg: 'bg-red-500', text: 'text-red-400' };
  };

  const healthColor = getHealthColor(analysis.healthScore);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">AI Analiz Raporu</h3>
              <p className="text-sm text-gray-500">Kovan #{hive.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scroll">
          {/* Sağlık Skoru */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Genel Sağlık Skoru</h4>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.healthScore / 100)}`}
                    className={healthColor.text}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-100">{analysis.healthScore}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-100 mb-1">
                  {analysis.healthScore >= 80 ? 'Mükemmel' : analysis.healthScore >= 60 ? 'İyi' : 'Zayıf'}
                </p>
                <p className="text-sm text-gray-500">
                  {analysis.healthScore >= 80 
                    ? 'Koloni sağlığı mükemmel durumda' 
                    : analysis.healthScore >= 60 
                    ? 'Koloni sağlığı iyi, izleme gerekli'
                    : 'Acil müdahale gerekli'}
                </p>
              </div>
            </div>
          </div>

          {/* Tahminler */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              AI Tahminleri
            </h4>
            <div className="space-y-3">
              {analysis.predictions.map((pred, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-100 capitalize">
                      {pred.type === 'swarm' ? 'Oğul Riski' : pred.type === 'production' ? 'Bal Üretimi' : 'Koloni Sağlığı'}
                    </h5>
                    {pred.risk && (
                      <span className={`text-xs font-semibold uppercase ${getRiskColor(pred.risk)}`}>
                        {pred.risk === 'high' ? 'Yüksek Risk' : pred.risk === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
                      </span>
                    )}
                  </div>
                  {pred.probability && (
                    <p className="text-sm text-gray-400 mb-1">
                      Olasılık: <span className="font-semibold text-gray-300">{pred.probability}</span> ({pred.timeframe})
                    </p>
                  )}
                  {pred.value && (
                    <p className="text-sm text-gray-400 mb-1">
                      Tahmini Üretim: <span className="font-semibold text-gray-300">{pred.value}</span>
                    </p>
                  )}
                  {pred.issues && pred.issues.length > 0 && (
                    <div className="mt-2">
                      {pred.issues.map((issue, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-purple-400 mt-2 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{pred.recommendation}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Önerilen Aksiyonlar */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Önerilen Aksiyonlar
            </h4>
            <div className="bg-gray-800 rounded-lg p-4">
              <ul className="space-y-2">
                {analysis.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-amber-400 font-semibold">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-gray-400">
              💡 <strong>Not:</strong> Bu analiz AI modeli tarafından oluşturulmuştur. Kesin teşhis için deneyimli bir arıcıya danışmanız önerilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
