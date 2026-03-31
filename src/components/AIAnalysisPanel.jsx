import { X, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AIAnalysisPanel = ({ isOpen, onClose, hive }) => {
  const { lang } = useLanguage();
  const isTr = lang === 'tr';
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

  // ═══ RULE-BASED AI ENGINE ═══
  const analysis = analyzeHive(hive, isTr);

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
              <h3 className="text-lg font-semibold text-gray-100">{isTr ? 'AI Analiz Raporu' : 'AI Analysis Report'}</h3>
              <p className="text-sm text-gray-500">{isTr ? 'Kovan' : 'Hive'} #{hive.id}</p>
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
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">{isTr ? 'Genel Sağlık Skoru' : 'Overall Health Score'}</h4>
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
                  {analysis.healthScore >= 80 ? (isTr ? 'Mükemmel' : 'Excellent') : analysis.healthScore >= 60 ? (isTr ? 'İyi' : 'Good') : (isTr ? 'Zayıf' : 'Poor')}
                </p>
                <p className="text-sm text-gray-500">
                  {analysis.healthScore >= 80 
                    ? (isTr ? 'Koloni sağlığı mükemmel durumda' : 'Colony health is excellent')
                    : analysis.healthScore >= 60 
                    ? (isTr ? 'Koloni sağlığı iyi, izleme gerekli' : 'Colony health is good, monitoring needed')
                    : (isTr ? 'Acil müdahale gerekli' : 'Urgent intervention needed')}
                </p>
              </div>
            </div>
          </div>

          {/* Tahminler */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {isTr ? 'AI Tahminleri' : 'AI Predictions'}
            </h4>
            <div className="space-y-3">
              {analysis.predictions.map((pred, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-100 capitalize">
                      {pred.type === 'swarm' ? (isTr ? 'Oğul Riski' : 'Swarm Risk') : pred.type === 'varroa' ? (isTr ? 'Varroa Riski' : 'Varroa Risk') : pred.type === 'production' ? (isTr ? 'Bal Üretimi' : 'Honey Production') : (isTr ? 'Koloni Sağlığı' : 'Colony Health')}
                    </h5>
                    {pred.risk && (
                      <span className={`text-xs font-semibold uppercase ${getRiskColor(pred.risk)}`}>
                        {pred.risk === 'high' ? (isTr ? 'Yüksek Risk' : 'High Risk') : pred.risk === 'medium' ? (isTr ? 'Orta Risk' : 'Medium Risk') : (isTr ? 'Düşük Risk' : 'Low Risk')}
                      </span>
                    )}
                  </div>
                  {pred.probability && (
                    <p className="text-sm text-gray-400 mb-1">
                      {isTr ? 'Olasılık' : 'Probability'}: <span className="font-semibold text-gray-300">{pred.probability}</span> ({pred.timeframe})
                    </p>
                  )}
                  {pred.value && (
                    <p className="text-sm text-gray-400 mb-1">
                      {isTr ? 'Tahmini Üretim' : 'Est. Production'}: <span className="font-semibold text-gray-300">{pred.value}</span>
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
              {isTr ? 'Önerilen Aksiyonlar' : 'Recommended Actions'}
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
              💡 <strong>{isTr ? 'Not' : 'Note'}:</strong> {isTr ? 'Bu analiz AI modeli tarafından oluşturulmuştur. Kesin teşhis için deneyimli bir arıcıya danışmanız önerilir.' : 'This analysis was generated by an AI model. For definitive diagnosis, consulting an experienced beekeeper is recommended.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPanel;

// ══════════════════════════════════════════════════════════════════════════
//  RULE-BASED AI ANALYSIS ENGINE
// ══════════════════════════════════════════════════════════════════════════
function analyzeHive(hive, isTr) {
  const temp = hive.temp ?? 0;
  const humidity = hive.humidity ?? 0;
  const sound = hive.sound ?? 0;
  const vibration = hive.vibration ?? 0;
  const battery = hive.battery ?? 100;

  // ── Health Score (0-100) ──
  let healthScore = 100;
  const issues = [];
  const actions = [];

  // Temperature analysis
  if (temp > 40) { healthScore -= 30; issues.push(isTr ? `Kritik sıcaklık: ${temp}°C (>40°C)` : `Critical temperature: ${temp}°C (>40°C)`); }
  else if (temp > 37) { healthScore -= 15; issues.push(isTr ? `Yüksek sıcaklık: ${temp}°C` : `High temperature: ${temp}°C`); }
  else if (temp < 10) { healthScore -= 25; issues.push(isTr ? `Çok düşük sıcaklık: ${temp}°C (<10°C)` : `Very low temperature: ${temp}°C (<10°C)`); }
  else if (temp < 20) { healthScore -= 10; issues.push(isTr ? `Düşük sıcaklık: ${temp}°C` : `Low temperature: ${temp}°C`); }

  // Humidity analysis
  if (humidity > 85) { healthScore -= 20; issues.push(isTr ? `Aşırı nem: %${humidity} (>85%)` : `Excessive humidity: ${humidity}% (>85%)`); }
  else if (humidity > 75) { healthScore -= 10; issues.push(isTr ? `Yüksek nem: %${humidity}` : `High humidity: ${humidity}%`); }
  else if (humidity < 30) { healthScore -= 15; issues.push(isTr ? `Çok düşük nem: %${humidity} (<30%)` : `Very low humidity: ${humidity}% (<30%)`); }

  // Sound/vibration analysis
  if (sound > 80) { healthScore -= 20; issues.push(isTr ? `Anormal ses seviyesi: ${sound} dB` : `Abnormal sound level: ${sound} dB`); }
  else if (sound > 60) { healthScore -= 8; }

  if (vibration > 2000) { healthScore -= 20; issues.push(isTr ? `Yüksek titreşim: ${vibration}` : `High vibration: ${vibration}`); }
  else if (vibration > 1000) { healthScore -= 10; }

  // Battery
  if (battery < 15) { healthScore -= 5; issues.push(isTr ? `Pil kritik: %${battery}` : `Battery critical: ${battery}%`); }

  healthScore = Math.max(0, Math.min(100, healthScore));

  // ── Swarm Prediction ──
  const swarmFactors = [];
  if (temp > 36 && temp <= 40) swarmFactors.push(0.3);
  if (temp > 40) swarmFactors.push(0.5);
  if (humidity > 70) swarmFactors.push(0.2);
  if (sound > 65) swarmFactors.push(0.35);
  if (vibration > 1200) swarmFactors.push(0.25);
  const swarmProb = Math.min(0.95, swarmFactors.reduce((a, b) => a + b, 0));
  const swarmRisk = swarmProb > 0.6 ? 'high' : swarmProb > 0.3 ? 'medium' : 'low';

  // ── Varroa Risk ──
  const varroaFactors = [];
  if (sound > 55 && sound < 75) varroaFactors.push(0.25);
  if (temp > 35 && humidity > 65) varroaFactors.push(0.2);
  if (vibration > 800 && vibration < 1500) varroaFactors.push(0.15);
  const varroaProb = Math.min(0.9, varroaFactors.reduce((a, b) => a + b, 0));
  const varroaRisk = varroaProb > 0.5 ? 'high' : varroaProb > 0.2 ? 'medium' : 'low';

  // ── Generate Actions ──
  if (temp > 38) actions.push(isTr ? 'Havalandırmayı artırın, gölgeleme yapın' : 'Increase ventilation, add shading');
  if (temp < 15) actions.push(isTr ? 'Kovanı izole edin, yalıtım ekleyin' : 'Insulate the hive, add insulation');
  if (humidity > 80) actions.push(isTr ? 'Nem giderici ekleyin, havalandırma açın' : 'Add dehumidifier, open ventilation');
  if (humidity < 35) actions.push(isTr ? 'Su kaynağı ekleyin, nemlendiriciden faydalanın' : 'Add water source, use humidifier');
  if (swarmRisk === 'high') actions.push(isTr ? 'Oğul kontrolü yapın, ana arıyı kontrol edin' : 'Check for swarming, inspect queen bee');
  if (varroaRisk !== 'low') actions.push(isTr ? 'Varroa testi yapın (şeker tozu veya alkol yıkama)' : 'Perform Varroa test (sugar shake or alcohol wash)');
  if (battery < 20) actions.push(isTr ? 'Sensör pilini değiştirin' : 'Replace sensor battery');
  if (actions.length === 0) actions.push(isTr ? 'Haftalık rutin kontrole devam edin' : 'Continue weekly routine inspections');
  if (healthScore > 70) actions.push(isTr ? 'Bal hasadı planlaması yapabilirsiniz' : 'You can plan honey harvest');

  // ── Production Estimate ──
  const prodFactor = healthScore > 80 ? 1.0 : healthScore > 60 ? 0.7 : 0.3;
  const weeklyProd = (3.0 * prodFactor).toFixed(1);
  const prodTrend = healthScore > 80 ? 'up' : healthScore > 60 ? 'stable' : 'down';

  return {
    healthScore,
    predictions: [
      {
        type: 'swarm',
        risk: swarmRisk,
        probability: `${Math.round(swarmProb * 100)}%`,
        timeframe: swarmRisk === 'high' ? (isTr ? '1-3 gün içinde' : 'within 1-3 days') : swarmRisk === 'medium' ? (isTr ? '5-10 gün içinde' : 'within 5-10 days') : (isTr ? 'Düşük risk' : 'Low risk'),
        recommendation: swarmRisk === 'high'
          ? (isTr ? 'Acil oğul kontrolü yapın. Ana arı hücreleri kontrol edin. Çerçeve ekleyin.' : 'Urgent swarm check. Inspect queen cells. Add frames.')
          : swarmRisk === 'medium'
          ? (isTr ? 'Yakın takip edin. 2-3 günde bir kontrol edin.' : 'Monitor closely. Check every 2-3 days.')
          : (isTr ? 'Normal izleme yeterli.' : 'Normal monitoring is sufficient.')
      },
      {
        type: 'varroa',
        risk: varroaRisk,
        probability: `${Math.round(varroaProb * 100)}%`,
        timeframe: isTr ? 'Ses frekans analizi' : 'Sound frequency analysis',
        recommendation: varroaRisk === 'high'
          ? (isTr ? 'Varroa tedavisi başlatın. Oksalik asit veya timol uygulayın.' : 'Start Varroa treatment. Apply oxalic acid or thymol.')
          : varroaRisk === 'medium'
          ? (isTr ? 'Varroa sayımı yapın. Eşik aşılmışsa tedavi başlatın.' : 'Perform Varroa count. Start treatment if threshold exceeded.')
          : (isTr ? 'Varroa riski düşük. Aylık kontrol yeterli.' : 'Varroa risk is low. Monthly check is sufficient.')
      },
      {
        type: 'production',
        value: `${weeklyProd} kg/${isTr ? 'hafta' : 'week'}`,
        trend: prodTrend,
        recommendation: prodTrend === 'up'
          ? (isTr ? 'Bal üretimi iyi. 2 hafta içinde hasat planlanabilir.' : 'Honey production is good. Harvest can be planned in 2 weeks.')
          : prodTrend === 'stable'
          ? (isTr ? 'Üretim normal. Beslenme desteği verilebilir.' : 'Production is normal. Feeding support can be given.')
          : (isTr ? 'Üretim düşük. Koloni sağlığını öncelikli kontrol edin.' : 'Production is low. Prioritize colony health check.')
      },
      {
        type: 'health',
        status: healthScore > 80 ? 'good' : healthScore > 50 ? 'moderate' : 'poor',
        issues,
        recommendation: healthScore > 80
          ? (isTr ? 'Koloni sağlıklı. Rutin bakım yeterli.' : 'Colony is healthy. Routine care is sufficient.')
          : healthScore > 50
          ? (isTr ? 'Dikkat gerektiren parametreler var. Yakın takip edin.' : 'Some parameters need attention. Monitor closely.')
          : (isTr ? 'Koloni risk altında. Acil müdahale gerekli.' : 'Colony is at risk. Urgent intervention needed.')
      }
    ],
    actions: actions.map((a, i) => `${i + 1}. ${a}`),
  };
}
