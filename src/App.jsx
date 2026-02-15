import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LiveDataProvider, useLiveData } from './contexts/LiveDataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
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
import OnboardingOverlay, { shouldShowOnboarding } from './components/OnboardingOverlay';
import EditHiveModal from './components/EditHiveModal';
import Footer from './components/Footer';
import WelcomeScreen from './components/WelcomeScreen';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import usePushNotifications from './hooks/usePushNotifications';
import { SkeletonStats, SkeletonTable, SkeletonDetail } from './components/Skeleton';
import './App.css';

const OverviewDashboard = lazy(() => import('./components/OverviewDashboard'));
const HiveDetailView = lazy(() => import('./components/HiveDetailView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const MapView = lazy(() => import('./components/MapView'));
const ReportsView = lazy(() => import('./components/ReportsView'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const CompareView = lazy(() => import('./components/CompareView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const NotificationHistoryView = lazy(() => import('./components/NotificationHistoryView'));
const HelpView = lazy(() => import('./components/HelpView'));
const AboutView = lazy(() => import('./components/AboutView'));

const WELCOME_KEY = 'beemind_welcome_seen';

function AppContent() {
  const toast = useToast();
  const { hives, loading, notifications: liveNotifications } = useLiveData();

  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return !localStorage.getItem(WELCOME_KEY);
    } catch {
      return true;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState('overview');
  const [selectedHiveId, setSelectedHiveId] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiHiveId, setAiHiveId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [selectedHives, setSelectedHives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddHive, setShowAddHive] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding);
  const [editHive, setEditHive] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({ tempMin: '', tempMax: '', batteryMin: '', batteryMax: '' });
  const itemsPerPage = 10;

  // Welcome screen keyboard handler
  useEffect(() => {
    if (!showWelcome) return;
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        handleEnterApp();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showWelcome]);

  const handleEnterApp = () => {
    setShowWelcome(false);
    try { localStorage.setItem(WELCOME_KEY, '1'); } catch {}
  };

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
    if (advancedFilters.tempMin) result = result.filter(h => h.temp >= Number(advancedFilters.tempMin));
    if (advancedFilters.tempMax) result = result.filter(h => h.temp <= Number(advancedFilters.tempMax));
    if (advancedFilters.batteryMin) result = result.filter(h => h.battery >= Number(advancedFilters.batteryMin));
    if (advancedFilters.batteryMax) result = result.filter(h => h.battery <= Number(advancedFilters.batteryMax));

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
  }, [hives, filter, searchQuery, sortBy, advancedFilters]);

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

  useEffect(() => {
    setNotifications(prev => {
      const readIds = new Set(prev.filter(n => n.read).map(n => `${n.hiveId}-${n.type}`));
      return liveNotifications.map(n => ({
        ...n,
        read: n.read || readIds.has(`${n.hiveId}-${n.type}`)
      }));
    });
  }, [liveNotifications]);

  const handleTabChange = useCallback((newTab) => {
    if (newTab === 'back') {
      if (currentView === 'detail') {
        setCurrentView('overview');
        setSelectedHiveId(null);
      }
      return;
    }
    setActiveTab(newTab);
    setCurrentView('overview');
    setSelectedHiveId(null);
    setSelectedHives([]);
  }, [currentView]);

  useKeyboardShortcuts(handleTabChange);
  usePushNotifications(hives);

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

  // Welcome screen
  if (showWelcome) {
    return <WelcomeScreen onEnter={handleEnterApp} />;
  }

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4">
            <img
              src="/logo.png"
              alt="BeeMind"
              className="w-10 h-10 object-contain animate-pulse"
              style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <LoadingSpinner size="lg" />
          <p className="text-amber-400 mt-4 text-lg font-semibold">BeeMind</p>
          <p className="text-gray-500 text-sm mt-1">Sistem baslatiliyor...</p>
          <div className="mt-4 w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  const allTabs = ['dashboard','list','map','compare','calendar','reports','notificationHistory','settings','profile','help','about'];

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {isLoading && <LoadingSpinner fullScreen />}
      {showOnboarding && <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1 p-4 md:p-8">
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
                        <FilterBar
                          filter={filter} setFilter={setFilter}
                          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                          sortBy={sortBy} setSortBy={setSortBy}
                          advancedFilters={advancedFilters} setAdvancedFilters={setAdvancedFilters}
                        />
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
                    <HiveList hives={paginatedHives} selectedHives={selectedHives} onSelectHive={handleSelectHive} onSelectAll={handleSelectAll} onViewDetail={handleViewDetail} onAIAnalysis={handleAIAnalysis} onEditHive={setEditHive} />
                  </section>
                  {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                  {selectedHives.length > 0 && <FloatingActionBar count={selectedHives.length} onReport={handleBulkReport} onNotification={handleBulkNotification} onClose={() => setSelectedHives([])} />}
                </ErrorBoundary>
              )}
              {activeTab === 'map' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><MapView hives={hives} onViewDetail={handleViewDetail} /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'compare' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><CompareView /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'calendar' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><CalendarView /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'reports' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><ReportsView hives={hives} /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'notificationHistory' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><NotificationHistoryView notifications={notifications} onViewDetail={handleViewDetail} /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'settings' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><SettingsView /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'profile' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><ProfileView /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'help' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><HelpView /></Suspense></ErrorBoundary>
              )}
              {activeTab === 'about' && (
                <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" />}><AboutView /></Suspense></ErrorBoundary>
              )}
              {!allTabs.includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-6xl mb-4">🐝</p>
                  <h2 className="text-xl font-semibold text-gray-300 mb-2">Sayfa Bulunamadi</h2>
                  <p className="text-gray-500 mb-6">Aradiginiz sayfa mevcut degil.</p>
                  <button onClick={() => handleTabChange('dashboard')} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">Ana Sayfaya Don</button>
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
      <AIAnalysisPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} hive={aiHive} />
      <ConnectionStatus />
      <AddHiveModal isOpen={showAddHive} onClose={() => setShowAddHive(false)} />
      <EditHiveModal hive={editHive} isOpen={!!editHive} onClose={() => setEditHive(null)} onSave={(id, data) => { /* localStorage'a zaten EditHiveModal kaydediyor */ }} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <LanguageProvider>
            <LiveDataProvider>
              <AppContent />
            </LiveDataProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
