import { Inbox, Search, AlertTriangle, FileX } from 'lucide-react';

const EmptyState = ({ 
  type = 'noData', 
  title, 
  description, 
  action,
  actionText 
}) => {
  const configs = {
    noData: {
      icon: Inbox,
      defaultTitle: 'Veri Bulunamadı',
      defaultDescription: 'Henüz gösterilecek veri yok.'
    },
    noResults: {
      icon: Search,
      defaultTitle: 'Sonuç Bulunamadı',
      defaultDescription: 'Arama kriterlerinize uygun sonuç bulunamadı.'
    },
    error: {
      icon: AlertTriangle,
      defaultTitle: 'Bir Hata Oluştu',
      defaultDescription: 'Veriler yüklenirken bir sorun oluştu.'
    },
    noFile: {
      icon: FileX,
      defaultTitle: 'Dosya Bulunamadı',
      defaultDescription: 'İstediğiniz dosya mevcut değil.'
    }
  };

  const config = configs[type] || configs.noData;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-12 h-12 text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        {description || config.defaultDescription}
      </p>
      {action && actionText && (
        <button
          onClick={action}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
