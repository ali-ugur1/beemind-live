import { Hexagon, AlertTriangle, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const StatsCards = ({ stats }) => {
  const { t } = useLanguage();

  const cards = [
    {
      title: t.stats.totalHives,
      value: stats.total,
      icon: Hexagon,
      color: 'text-gray-400'
    },
    {
      title: t.stats.needsAttention,
      value: stats.needsAttention,
      icon: AlertTriangle,
      color: 'text-red-400',
      pulse: stats.needsAttention > 0
    },
    {
      title: t.stats.activeSystem,
      value: stats.active,
      icon: Activity,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className={`bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all ${
              card.pulse ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
                {card.title}
              </h3>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-4xl font-light text-gray-100">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
