import { FileText, Bell, X } from 'lucide-react';

const FloatingActionBar = ({ count, onReport, onNotification, onClose }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-amber-500 text-black rounded-lg shadow-2xl px-6 py-4 flex items-center gap-6">
        {/* Count */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">⚡ {count} Seçili</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-amber-700"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReport}
            className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 rounded-lg font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            Raporla
          </button>

          <button
            onClick={onNotification}
            className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 rounded-lg font-medium transition-colors"
          >
            <Bell className="w-4 h-4" />
            Bildirim
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-black/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionBar;
