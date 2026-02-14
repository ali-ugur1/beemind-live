import { useState, useMemo, lazy, Suspense } from 'react';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LiveDataProvider, useLiveData } from './contexts/LiveDataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import HiveList from './components/HiveList';
import Pagination from './components/Pagination';
import FloatingActionBar from './components/FloatingActionBar';
import LoadingSpinner from './components/LoadingSpinner';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import ConnectionStatus from './components/ConnectionStatus';
import AddHiveModal from './components/AddHiveModal';
import { SkeletonStats, SkeletonTable, SkeletonDetail } from './components/Skeleton';
import { NOTIFICATIONS } from './data/mockData';
import './App.css';

const OverviewDashboard = lazy(() => import('./components/OverviewDashboard'));
const HiveDetailView = lazy(() => import('./components/HiveDetailView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const MapView = lazy(() => import('./components/MapView'));
const ReportsView = lazy(() => import('./components/ReportsView'));
const ProfileView = lazy(() => import('./components/ProfileView'));

function AppContent() {
  const toast = useToast();
  const { hives, loading } = useLiveData();

  const [activeTab, setActiveTab] = useState('list');
  const [currentView, setCurrentView] = useState('overview');
  const [selectedHiveId, setSelectedHiveId] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiHiveId, setAiHiveId] = useState(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [selectedHives, setSelectedHives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddHive, setShowAddHive] = useState(false);
  const itemsPerPage = 10;

  const filteredAndSortedHives = useMemo(() => {
    let result = [...hives];
    if (searchQuery) {
      result = result.filter(hive =>
        hive.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filter !== 'all') {
      result = result.filter(hive => hive.status === filter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priority': return a.priority - b.priority;
        case 'id': return a.id.localeCompare(b.id);
        case 'temp': return b.temp - a.temp;
        case 'battery': return a.battery - b.battery;
        default: return 0;
      }
    });
    return result;
  }, [hives, filter, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = hives.length;
    const critical = hives.filter(h => h.status === 'critical').length;
    const warning = hives.filter(h => h.status === 'warning').length;
    const active = hives.filter(h => h.battery > 20).length;
    const needsAttention = critical + warning;
    return { total, critical, warning, active, needsAttention };
  }, [hives]);

  const totalPages = Math.ceil(filteredAndSortedHives.length / itemsPerPage);
  const paginatedHives = filteredAndSortedHives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const selectedHive = hives.find(h => h.id === selectedHiveId);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setCurrentView('overview');
    setSelectedHiveId(null);
    setSelectedHives([]);
  };

  const handleSelectHive = (hiveId) => {
    setSelectedHives(prev =>
      prev.includes(hiveId) ? prev.filter(id => id !== hiveId) : [...prev, hiveId]
    );
  };

  const handleSelectAll = () => {
    if (selectedHives.length === paginatedHives.length) {
      setSelectedHives([]);
    } else {
      setSelectedHives(paginatedHives.map(h => h.id));
    }
  };

  const handleBulkReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${selectedHives.length} kovan icin rapor olusturuldu`);
    }, 1500);
  };

  const handleBulkNotification = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${selectedHives.length} kovana bildirim gonderildi`);
    }, 1500);
  };

  const handleViewDetail = (hiveId) => {
    setSelectedHiveId(hiveId);
    setCurrentView('detail');
    setActiveTab('list');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedHiveId(null);
  };

  const handleMarkAsRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    if (notif.hiveId) {
      handleViewDetail(notif.hiveId);
    }
  };

  const handleAIAnalysis = (hiveId) => {
    setAiHiveId(hiveId);
    setAiPanelOpen(true);
  };

  const handleSettingsClick = () => {
    setActiveTab('settings');
    setCurrentView('overview');
    setSelectedHiveId(null);
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
    setCurrentView('overview');
    setSelectedHiveId(null);
  };

  const aiHive = hives.find(h => h.id === aiHiveId);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-amber-400 mt-4 text-lg">BeeMind yukleniyor...</p>
          <p className="text-gray-500 text-sm mt-2">ESP32 verisi bekleniyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {isLoading && <LoadingSpinner fullScreen />}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Header
          activeTab={activeTab}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
          onSettingsClick={handleSettingsClick}
          onProfileClick={handleProfileClick}
        />
        {currentView === 'detail' && selectedHive && (
          <ErrorBoundary>
            <Suspense fallback={<SkeletonDetail />}>
              <HiveDetailView hive={selectedHive} onBack={handleBackToOverview} />
            </Suspense>
          </ErrorBoundary>
        )}
        {currentView === 'overview' && (
          <>
            {activeTab === 'dashboard' && (
              <ErrorBoundary>
                <Suspense fallback={<SkeletonStats />}>
                  <OverviewDashboard stats={stats} hives={hives} onViewDetail={handleViewDetail} />
                </Suspense>
              </ErrorBoundary>
            )}
            {activeTab === 'list' && (
              <ErrorBoundary>
                <section className="mb-6"><StatsCards stats={stats} /></section>
                <section className="mb-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <FilterBar filter={filter} setFilter={setFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortBy={sortBy} setSortBy={setSortBy} />
                    </div>
                    <button
                      onClick={() => setShowAddHive(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      + Yeni Kovan
                    </button>
                  </div>
                </section>
                <section className="mb-4">
                  <HiveList hives={paginatedHives} selectedHives={selectedHives} onSelectHive={handleSelectHive} onSelectAll={handleSelectAll} onViewDetail={handleViewDetail} onAIAnalysis={handleAIAnalysis} />
                </section>
                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                {selectedHives.length > 0 && <FloatingActionBar count={selectedHives.length} onReport={handleBulkReport} onNotification={handleBulkNotification} onClose={() => setSelectedHives([])} />}
              </ErrorBoundary>
            )}
            {activeTab === 'map' && (
              <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><MapView hives={hives} onViewDetail={handleViewDetail} /></Suspense></ErrorBoundary>
            )}
            {activeTab === 'reports' && (
              <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><ReportsView hives={hives} /></Suspense></ErrorBoundary>
            )}
            {activeTab === 'settings' && (
              <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><SettingsView /></Suspense></ErrorBoundary>
            )}
            {activeTab === 'profile' && (
              <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><ProfileView /></Suspense></ErrorBoundary>
            )}
            {!['dashboard','list','map','reports','settings','profile'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-6xl mb-4">🐝</p>
                <h2 className="text-xl font-semibold text-gray-300 mb-2">Sayfa Bulunamadı</h2>
                <p className="text-gray-500 mb-6">Aradığınız sayfa mevcut değil.</p>
                <button onClick={() => handleTabChange('dashboard')} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">Ana Sayfaya Dön</button>
              </div>
            )}
          </>
        )}
      </main>
      <AIAnalysisPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} hive={aiHive} />
      <ConnectionStatus />
      <AddHiveModal isOpen={showAddHive} onClose={() => setShowAddHive(false)} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <LiveDataProvider>
            <AppContent />
          </LiveDataProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
