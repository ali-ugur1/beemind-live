import { Home, List, Map, FileText, Settings, Package, User, Hexagon, X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu dinle
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Genel Bakış', icon: Home },
    { id: 'list', label: 'Kovan Listesi', icon: List },
    { id: 'map', label: 'Harita', icon: Map },
    { id: 'reports', label: 'Raporlar', icon: FileText },
    { id: 'settings', label: 'Ayarlar', icon: Settings }
  ];

  const handleMenuClick = (tabId) => {
    onTabChange(tabId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger Button (Mobile) */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-[60] p-2 bg-black border border-gray-800 rounded-lg text-amber-400 hover:bg-gray-900 transition-colors lg:hidden"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Overlay (Mobile) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
        } w-64 bg-black border-r border-gray-800 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-lg p-1">
              <img 
                src="/logo.png" 
                alt="BeeMind Logo" 
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))' }}
              />
            </div>
            <h1 className="text-xl font-bold text-amber-400">BeeMind</h1>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="w-4 h-4" />
            <span>Paket: PRO</span>
          </div>
          <div className="text-xs text-gray-600">24 / 50 Kovan</div>
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
            <User className="w-4 h-4" />
            <span>Admin User</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
