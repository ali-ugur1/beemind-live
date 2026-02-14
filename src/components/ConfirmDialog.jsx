import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Emin misiniz?',
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500',
      bgHover: 'hover:bg-amber-600'
    },
    danger: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500',
      bgHover: 'hover:bg-red-600'
    },
    info: {
      icon: AlertTriangle,
      color: 'text-blue-400',
      bg: 'bg-blue-500',
      bgHover: 'hover:bg-blue-600'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Dialog */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${config.color}`} />
            <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 ${config.bg} ${config.bgHover} text-white rounded-lg font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
