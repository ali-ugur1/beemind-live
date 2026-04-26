import {
  useState,
  useEffect,
  useMemo,
  lazy,
  Suspense,
  useCallback,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "./contexts/ToastContext";
import { LiveDataProvider, useLiveData } from "./contexts/LiveDataContext";
import { useLanguage } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import FilterBar from "./components/FilterBar";
import HiveList from "./components/HiveList";
import Pagination from "./components/Pagination";
import FloatingActionBar from "./components/FloatingActionBar";
import LoadingSpinner from "./components/LoadingSpinner";
import AIAnalysisPanel from "./components/AIAnalysisPanel";
import ConnectionStatus from "./components/ConnectionStatus";
import AddHiveModal from "./components/AddHiveModal";
import OnboardingOverlay, {
  shouldShowOnboarding,
} from "./components/OnboardingOverlay";
import EditHiveModal from "./components/EditHiveModal";
import Footer from "./components/Footer";
import LoginPage from "./components/LoginPage";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import usePushNotifications from "./hooks/usePushNotifications";
import {
  SkeletonStats,
  SkeletonTable,
  SkeletonDetail,
} from "./components/Skeleton";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// ---------------------------------------------------------------------------
// Lazy-loaded views
// ---------------------------------------------------------------------------
const OverviewDashboard = lazy(() => import("./components/OverviewDashboard"));
const HiveDetailView = lazy(() => import("./components/HiveDetailView"));
const SettingsView = lazy(() => import("./components/SettingsView"));
const MapView = lazy(() => import("./components/MapView"));
const ReportsView = lazy(() => import("./components/ReportsView"));
const ProfileView = lazy(() => import("./components/ProfileView"));
const CompareView = lazy(() => import("./components/CompareView"));
const CalendarView = lazy(() => import("./components/CalendarView"));
const NotificationHistoryView = lazy(
  () => import("./components/NotificationHistoryView"),
);
const HelpView = lazy(() => import("./components/HelpView"));
const AboutView = lazy(() => import("./components/AboutView"));

// ---------------------------------------------------------------------------
// Geçerli sekmeler sabiti — tek kaynak
// ---------------------------------------------------------------------------
const ALL_TABS = [
  "dashboard",
  "list",
  "map",
  "compare",
  "calendar",
  "reports",
  "notificationHistory",
  "settings",
  "profile",
  "help",
  "about",
];

// ---------------------------------------------------------------------------
// Sayfa geçiş animasyonu
// ---------------------------------------------------------------------------
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

// ---------------------------------------------------------------------------
// AppContent
// ---------------------------------------------------------------------------
function AppContent() {
  const toast = useToast();
  const {
    hives,
    loading,
    notifications: liveNotifications,
    updateHive,
    isDataStale,
    apiConnected,
  } = useLiveData();
  const { t, lang } = useLanguage();
  const { isFirstLogin, clearFirstLogin } = useAuth();

  // --- state ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentView, setCurrentView] = useState("overview");
  const [selectedHiveId, setSelectedHiveId] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiHiveId, setAiHiveId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [selectedHives, setSelectedHives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddHive, setShowAddHive] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => isFirstLogin || shouldShowOnboarding(),
  );
  const [editHive, setEditHive] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    tempMin: "",
    tempMax: "",
    batteryMin: "",
    batteryMax: "",
  });

  const ITEMS_PER_PAGE = 10;

  // ---------------------------------------------------------------------------
  // Onboarding — sadece ilk girişte tetikle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isFirstLogin) {
      setShowOnboarding(true);
      clearFirstLogin();
    }
  }, [isFirstLogin, clearFirstLogin]);

  // ---------------------------------------------------------------------------
  // Bayat veri uyarısı (debounce: ref ile tek kez göster)
  // ---------------------------------------------------------------------------
  const staleWarnedRef = useRef(false);
  useEffect(() => {
    if (isDataStale && !apiConnected && !staleWarnedRef.current) {
      staleWarnedRef.current = true;
      toast.warning(
        lang === "tr"
          ? "Sunucuya bağlanılamıyor — gösterilen veriler önbellekten. Gerçek zamanlı değil."
          : "Cannot reach server — showing cached data. Not real-time.",
      );
    }
    if (apiConnected) staleWarnedRef.current = false;
  }, [isDataStale, apiConnected, lang, toast]);

  // ---------------------------------------------------------------------------
  // Dinamik document.title
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const tabTitles = {
      dashboard: lang === "tr" ? "Gösterge Paneli" : "Dashboard",
      list: lang === "tr" ? "Kovan Listesi" : "Hive List",
      map: lang === "tr" ? "Harita" : "Map",
      compare: lang === "tr" ? "Karşılaştır" : "Compare",
      calendar: lang === "tr" ? "Takvim" : "Calendar",
      reports: lang === "tr" ? "Raporlar" : "Reports",
      notificationHistory: lang === "tr" ? "Bildirimler" : "Notifications",
      settings: lang === "tr" ? "Ayarlar" : "Settings",
      profile: lang === "tr" ? "Profil" : "Profile",
      help: lang === "tr" ? "Yardım" : "Help",
      about: lang === "tr" ? "Hakkında" : "About",
    };

    const detailHive = hives.find((h) => h.id === selectedHiveId);
    const detailName = detailHive?.name ?? (lang === "tr" ? "Kovan" : "Hive");
    const pageLabel =
      currentView === "detail" && selectedHiveId
        ? detailName
        : (tabTitles[activeTab] ?? "Hexora");

    document.title = `${pageLabel} | Hexora`;
  }, [activeTab, currentView, selectedHiveId, lang, hives]);

  // ---------------------------------------------------------------------------
  // Filtre / arama değişince sayfayı sıfırla
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, sortBy, advancedFilters]);

  // ---------------------------------------------------------------------------
  // Filtrelenmiş + sıralanmış kovan listesi
  // ---------------------------------------------------------------------------
  const filteredAndSortedHives = useMemo(() => {
    let result = [...hives];

    // Arama
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (hive) =>
          hive.id.toLowerCase().includes(q) ||
          hive.name?.toLowerCase().includes(q) ||
          hive.location?.toLowerCase().includes(q),
      );
    }

    // Durum filtresi
    if (filter !== "all") {
      result = result.filter((hive) => hive.status === filter);
    }

    // Gelişmiş filtreler
    const { tempMin, tempMax, batteryMin, batteryMax } = advancedFilters;
    if (tempMin) result = result.filter((h) => h.temp >= Number(tempMin));
    if (tempMax) result = result.filter((h) => h.temp <= Number(tempMax));
    if (batteryMin)
      result = result.filter((h) => h.battery >= Number(batteryMin));
    if (batteryMax)
      result = result.filter((h) => h.battery <= Number(batteryMax));

    // Sıralama
    result.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return a.priority - b.priority;
        case "id":
          return a.id.localeCompare(b.id);
        case "temp":
          return b.temp - a.temp;
        case "battery":
          return a.battery - b.battery;
        default:
          return 0;
      }
    });

    return result;
  }, [hives, filter, searchQuery, sortBy, advancedFilters]);

  // ---------------------------------------------------------------------------
  // İstatistikler
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = hives.length;
    const critical = hives.filter((h) => h.status === "critical").length;
    const warning = hives.filter((h) => h.status === "warning").length;
    const active = hives.filter((h) => h.battery > 20).length;
    const needsAttention = critical + warning;
    return { total, critical, warning, active, needsAttention };
  }, [hives]);

  // ---------------------------------------------------------------------------
  // Sayfalama
  // ---------------------------------------------------------------------------
  const totalPages = Math.ceil(filteredAndSortedHives.length / ITEMS_PER_PAGE);
  const paginatedHives = filteredAndSortedHives.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const selectedHive = hives.find((h) => h.id === selectedHiveId) ?? null;

  // ---------------------------------------------------------------------------
  // Canlı bildirim sync (okundu durumu korunur)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setNotifications((prev) => {
      const readKeys = new Set(
        prev.filter((n) => n.read).map((n) => `${n.hiveId}-${n.type}`),
      );
      return liveNotifications.map((n) => ({
        ...n,
        read: n.read || readKeys.has(`${n.hiveId}-${n.type}`),
      }));
    });
  }, [liveNotifications]);

  // ---------------------------------------------------------------------------
  // Sekme değişimi
  // ---------------------------------------------------------------------------
  const handleTabChange = useCallback(
    (newTab) => {
      if (newTab === "back") {
        if (currentView === "detail") {
          setCurrentView("overview");
          setSelectedHiveId(null);
        }
        return;
      }
      setActiveTab(newTab);
      setCurrentView("overview");
      setSelectedHiveId(null);
      setSelectedHives([]);
    },
    [currentView],
  );

  useKeyboardShortcuts(handleTabChange);
  const pushNotifications = usePushNotifications(hives);

  // ---------------------------------------------------------------------------
  // Çoklu seçim
  // ---------------------------------------------------------------------------
  const handleSelectHive = useCallback((hiveId) => {
    setSelectedHives((prev) =>
      prev.includes(hiveId)
        ? prev.filter((id) => id !== hiveId)
        : [...prev, hiveId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedHives((prev) =>
      prev.length === paginatedHives.length
        ? []
        : paginatedHives.map((h) => h.id),
    );
  }, [paginatedHives]);

  // ---------------------------------------------------------------------------
  // Toplu CSV raporu
  // ---------------------------------------------------------------------------
  const handleBulkReport = useCallback(() => {
    const selected = hives.filter((h) => selectedHives.includes(h.id));
    if (selected.length === 0) return;

    const headers = [
      "ID",
      lang === "tr" ? "İsim" : "Name",
      lang === "tr" ? "Konum" : "Location",
      lang === "tr" ? "Durum" : "Status",
      lang === "tr" ? "Sıcaklık (°C)" : "Temp (°C)",
      lang === "tr" ? "Nem (%)" : "Humidity (%)",
      lang === "tr" ? "Pil (%)" : "Battery (%)",
      lang === "tr" ? "Ağırlık (kg)" : "Weight (kg)",
    ];

    const escapeCell = (v) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const rows = selected.map((h) =>
      [
        h.id,
        h.name ?? h.id,
        h.location ?? "",
        h.status,
        h.temp,
        h.humidity,
        h.battery,
        h.weight,
      ].map(escapeCell),
    );

    const csv = [headers.map(escapeCell), ...rows]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `hexora-bulk-report-${new Date().toISOString().slice(0, 10)}.csv`,
    });

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(
      lang === "tr"
        ? `${selected.length} kovan için CSV raporu indirildi`
        : `CSV report downloaded for ${selected.length} hives`,
    );
  }, [hives, selectedHives, lang, toast]);

  // ---------------------------------------------------------------------------
  // Toplu bildirim
  // ---------------------------------------------------------------------------
  const handleBulkNotification = useCallback(async () => {
    if (selectedHives.length === 0) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("hexora_jwt");
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title:
            lang === "tr" ? "Toplu Kovan Bildirimi" : "Bulk Hive Notification",
          body:
            lang === "tr"
              ? `${selectedHives.length} kovan için manuel kontrol bildirimi`
              : `Manual check notification for ${selectedHives.length} hives`,
          tag: "bulk-notif",
        }),
      });

      if (res.ok) {
        toast.success(
          lang === "tr"
            ? `${selectedHives.length} kovana bildirim gönderildi`
            : `Notification sent for ${selectedHives.length} hives`,
        );
      } else {
        toast.error(
          lang === "tr"
            ? "Bildirim gönderilemedi"
            : "Failed to send notification",
        );
      }
    } catch {
      toast.error(
        lang === "tr"
          ? "Bildirim gönderilemedi"
          : "Failed to send notification",
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedHives, lang, toast]);

  // ---------------------------------------------------------------------------
  // Kovan detayı
  // ---------------------------------------------------------------------------
  const handleViewDetail = useCallback((hiveId) => {
    setSelectedHiveId(hiveId);
    setCurrentView("detail");
    setActiveTab("list");
  }, []);

  const handleBackToOverview = useCallback(() => {
    setCurrentView("overview");
    setSelectedHiveId(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Bildirimler
  // ---------------------------------------------------------------------------
  const handleMarkAsRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleNotificationClick = useCallback(
    (notif) => {
      handleMarkAsRead(notif.id);
      if (notif.hiveId) handleViewDetail(notif.hiveId);
    },
    [handleMarkAsRead, handleViewDetail],
  );

  // ---------------------------------------------------------------------------
  // AI paneli
  // ---------------------------------------------------------------------------
  const handleAIAnalysis = useCallback((hiveId) => {
    setAiHiveId(hiveId);
    setAiPanelOpen(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Ayarlar / Profil
  // ---------------------------------------------------------------------------
  const handleSettingsClick = useCallback(() => {
    setActiveTab("settings");
    setCurrentView("overview");
    setSelectedHiveId(null);
  }, []);

  const handleProfileClick = useCallback(() => {
    setActiveTab("profile");
    setCurrentView("overview");
    setSelectedHiveId(null);
  }, []);

  const aiHive = hives.find((h) => h.id === aiHiveId) ?? null;

  // ---------------------------------------------------------------------------
  // Yükleme ekranı
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4">
            <img
              src="/hexora-logo.svg"
              alt="Hexora"
              className="w-10 h-10 object-contain animate-pulse"
              style={{ filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <LoadingSpinner size="lg" />
          <p className="text-blue-400 mt-4 text-lg font-semibold">Hexora</p>
          <p className="text-gray-500 text-sm mt-1">{t.common.loading}</p>
          <div className="mt-4 w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-amber-500 rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Ana render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {isLoading && <LoadingSpinner fullScreen />}

      {showOnboarding && (
        <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />
      )}

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

          <AnimatePresence mode="wait">
            {/* Kovan detay görünümü */}
            {currentView === "detail" && selectedHive && (
              <PageTransition key="detail">
                <ErrorBoundary>
                  <Suspense fallback={<SkeletonDetail />}>
                    <HiveDetailView
                      hive={selectedHive}
                      onBack={handleBackToOverview}
                    />
                  </Suspense>
                </ErrorBoundary>
              </PageTransition>
            )}

            {/* Genel görünüm */}
            {currentView === "overview" && (
              <PageTransition key={activeTab}>
                <>
                  {activeTab === "dashboard" && (
                    <ErrorBoundary>
                      <Suspense fallback={<SkeletonStats />}>
                        <OverviewDashboard
                          stats={stats}
                          hives={hives}
                          onViewDetail={handleViewDetail}
                          onNavigate={setActiveTab}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "list" && (
                    <ErrorBoundary>
                      <section className="mb-6">
                        <StatsCards stats={stats} />
                      </section>

                      <section className="mb-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <FilterBar
                              filter={filter}
                              setFilter={setFilter}
                              searchQuery={searchQuery}
                              setSearchQuery={setSearchQuery}
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              advancedFilters={advancedFilters}
                              setAdvancedFilters={setAdvancedFilters}
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowAddHive(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            + {t.addHive.title}
                          </motion.button>
                        </div>
                      </section>

                      <section className="mb-4">
                        <HiveList
                          hives={paginatedHives}
                          selectedHives={selectedHives}
                          onSelectHive={handleSelectHive}
                          onSelectAll={handleSelectAll}
                          onViewDetail={handleViewDetail}
                          onAIAnalysis={handleAIAnalysis}
                          onEditHive={setEditHive}
                        />
                      </section>

                      {totalPages > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      )}

                      {selectedHives.length > 0 && (
                        <FloatingActionBar
                          count={selectedHives.length}
                          onReport={handleBulkReport}
                          onNotification={handleBulkNotification}
                          onClose={() => setSelectedHives([])}
                        />
                      )}
                    </ErrorBoundary>
                  )}

                  {activeTab === "map" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <MapView
                          hives={hives}
                          onViewDetail={handleViewDetail}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "compare" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <CompareView />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "calendar" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <CalendarView hives={hives} />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "reports" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <ReportsView hives={hives} />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "notificationHistory" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <NotificationHistoryView
                          notifications={notifications}
                          onViewDetail={handleViewDetail}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "settings" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <SettingsView pushNotifications={pushNotifications} />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "profile" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <ProfileView />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "help" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <HelpView />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {activeTab === "about" && (
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <AboutView />
                      </Suspense>
                    </ErrorBoundary>
                  )}

                  {/* Bilinmeyen sekme fallback */}
                  {!ALL_TABS.includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <p className="text-6xl mb-4">🐝</p>
                      <h2 className="text-xl font-semibold text-gray-300 mb-2">
                        {t.common.pageNotFound}
                      </h2>
                      <p className="text-gray-500 mb-6">
                        {t.common.pageNotFoundDesc}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleTabChange("dashboard")}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                      >
                        {t.common.backToHome}
                      </motion.button>
                    </div>
                  )}
                </>
              </PageTransition>
            )}
          </AnimatePresence>
        </main>

        <Footer onTabChange={handleTabChange} />
      </div>

      <AIAnalysisPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        hive={aiHive}
      />
      <ConnectionStatus />
      <AddHiveModal
        isOpen={showAddHive}
        onClose={() => setShowAddHive(false)}
      />
      <EditHiveModal
        hive={editHive}
        isOpen={!!editHive}
        onClose={() => setEditHive(null)}
        onSave={(id, data) => updateHive(id, data)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthGate
// ---------------------------------------------------------------------------
function AuthGate() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950 items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return (
    <LiveDataProvider>
      <AppContent />
    </LiveDataProvider>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
