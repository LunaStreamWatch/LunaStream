import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Film, Users, Eye, Clock, TrendingUp, Monitor, BarChart3, Activity, Play, Tv, Calendar, RefreshCw, LogOut, Smartphone, LampDesk as Desktop, Tablet, Globe, Zap, Target, Award, Repeat, PieChart, LineChart, Settings, Download, Share2, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { analytics, ViewingStats, StreamingSession } from '../services/analytics';
import { authService } from '../services/auth';
import { tmdb } from '../services/tmdb';
import GlobalNavbar from './GlobalNavbar';
import { useLanguage } from './LanguageContext';
import { translations } from '../data/i18n';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [stats, setStats] = useState<ViewingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'users'>('overview');
  const [serverData, setServerData] = useState<any>(null);

  const { language } = useLanguage();
  const t = translations[language];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const viewingStats = analytics.getViewingStats();
      setStats(viewingStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
    
    // Also fetch server data
    try {
      const data = await authService.getAdminData();
      setServerData(data.data);
    } catch (error) {
      console.error('Failed to fetch server data:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 15 seconds for real-time data
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Desktop className="w-4 h-4" />;
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">Loading real-time analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />
      
      {/* Admin Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-pink-200/50 dark:border-gray-600/30 sticky top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t.admin_panel_dashboard_title || 'Admin Dashboard'}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t.admin_panel_live_data || 'Live Data'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{t.admin_panel_refresh || 'Refresh'}</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.admin_panel_logout || 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t.admin_panel_analytics_title || 'Real-Time Analytics Dashboard'}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            {t.admin_panel_analytics_subtitle || 'Live streaming analytics and comprehensive user insights'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
            {t.admin_panel_last_updated || 'Last updated'}: {lastUpdate.toLocaleTimeString()} • {t.admin_panel_auto_refresh || 'Auto-refresh every 15s'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-2 transition-colors duration-300">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: t.admin_panel_tab_overview || 'Overview', icon: BarChart3 },
                { id: 'content', label: t.admin_panel_tab_content || 'Content', icon: Film },
                { id: 'users', label: t.admin_panel_tab_users || 'Users', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">{t.admin_panel_total_views || 'Total Views'}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{formatNumber(stats.totalViews)}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last week</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">{t.admin_panel_live_viewers || 'Live Viewers'}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{stats.currentlyWatching.length}</p>
                        {/* <p className="text-xs text-green-600 dark:text-green-400 mt-1">Peak: {stats.peakConcurrentViewers}</p> */}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">{t.admin_panel_watch_time || 'Watch Time'}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{formatDuration(stats.totalWatchTime)}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Avg: {formatDuration(stats.averageSessionLength)}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">{t.admin_panel_completion_rate || 'Completion Rate'}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{stats.averageWatchProgress.toFixed(1)}%</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Bounce: {stats.bounceRate.toFixed(1)}%</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Viewers */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 mb-8 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                    <Monitor className="w-7 h-7 mr-3 text-green-500" />
                    {t.admin_panel_live_viewers_title || 'Live Viewers'} ({stats.currentlyWatching.length})
                    <div className="ml-3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </h2>
                  
                  {stats.currentlyWatching.length > 0 ? (
                    <div className="space-y-3">
                      {stats.currentlyWatching.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 transition-colors duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              {session.posterPath ? (
                                <img
                                  src={tmdb.getImageUrl(session.posterPath, 'w92')}
                                  alt={session.mediaTitle}
                                  className="w-12 h-16 object-cover rounded-lg shadow-md"
                                />
                              ) : (
                                <div className={`w-12 h-16 bg-gradient-to-r ${session.mediaType === 'movie' ? 'from-pink-500 to-pink-600' : 'from-purple-500 to-purple-600'} rounded-lg flex items-center justify-center shadow-md`}>
                                  {session.mediaType === 'movie' ? (
                                    <Film className="w-6 h-6 text-white" />
                                  ) : (
                                    <Tv className="w-6 h-6 text-white" />
                                  )}
                                </div>
                              )}
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                {session.mediaTitle}
                                {session.season && session.episode && (
                                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                                    S{session.season}E{session.episode}
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                <span>{formatDuration(session.currentTime)} watched</span>
                                <span>•</span>
                                <span>{session.watchProgress.toFixed(1)}% complete</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  {getDeviceIcon(session.deviceType)}
                                  <span>{session.deviceType}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-semibold">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              LIVE
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              {formatTimeAgo(session.lastActivity)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              {session.quality} • {session.browser}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Monitor className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
                      <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t.admin_panel_no_one_watching || 'No one is currently watching'}</p>
                    </div>
                  )}
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-200/50 dark:border-gray-700/50 p-6 mb-8 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                    <LineChart className="w-7 h-7 mr-3 text-indigo-500" />
                    {t.admin_panel_activity_trends || '7-Day Activity Trends'}
                  </h2>
                  
                  <div className="space-y-4">
                    {stats.dailyStats.map((day, index) => {
                      const maxViews = Math.max(...stats.dailyStats.map(d => d.views));
                      const percentage = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                      
                      return (
                        <div key={day.date} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                              {new Date(day.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                              <span>{day.views} {t.admin_panel_views || 'views'}</span>
                              <span>{day.uniqueViewers} {t.admin_panel_viewers || 'viewers'}</span>
                              <span>{formatDuration(day.watchTime)}</span>
                              {/*<span className="text-green-600 dark:text-green-400">Peak: {day.peakConcurrent}</span>*/}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-300">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <>
                {/* Content Performance Overview */}
                <div className="grid lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t.admin_panel_most_watched || 'Most Watched'}</h3>
                      <Award className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="space-y-2">
                      {stats.contentPerformance.mostWatched.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-2 text-sm">
                          <span className="w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t.admin_panel_longest_sessions || 'Longest Sessions'}</h3>
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="space-y-2">
                      {stats.contentPerformance.longestSessions.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300 truncate">{item.title}</span>
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            {formatDuration(item.avgDuration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t.admin_panel_best_completion || 'Best Completion'}</h3>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      {stats.contentPerformance.highestCompletion.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300 truncate">{item.title}</span>
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {item.completionRate.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t.admin_panel_most_rewatched || 'Most Rewatched'}</h3>
                      <Repeat className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="space-y-2">
                      {stats.contentPerformance.mostRewatched.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300 truncate">{item.title}</span>
                          <span className="text-orange-600 dark:text-orange-400 font-semibold">
                            {item.rewatchRate.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Content Lists */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Top Movies */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                      <Film className="w-7 h-7 mr-3 text-pink-500" />
                      {t.admin_panel_top_movies || 'Top Movies'}
                    </h2>
                    
                    {stats.topMovies.length > 0 ? (
                      <div className="space-y-4">
                        {stats.topMovies.slice(0, 8).map((movie, index) => (
                          <div
                            key={movie.id}
                            className="flex items-center space-x-4 p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200/50 dark:border-pink-700/50 transition-colors duration-300"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            {movie.posterPath ? (
                              <img
                                src={tmdb.getImageUrl(movie.posterPath, 'w92')}
                                alt={movie.title}
                                className="w-10 h-14 object-cover rounded shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-14 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                                <Film className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300 truncate">
                                {movie.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                <span>{movie.views} views</span>
                                <span>•</span>
                                <span>{formatDuration(movie.totalWatchTime)}</span>
                                {/*<span>•</span>*/}
                                {/*<div className="flex items-center">*/}
                                  {/*<Star className="w-3 h-3 text-yellow-500 mr-1" />*/}
                                  {/*<span>{movie.rating.toFixed(1)}</span>*/}
                                {/*</div>*/}
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                                <div
                                  className="bg-gradient-to-r from-pink-500 to-pink-600 h-1.5 rounded-full"
                                  style={{ width: `${movie.completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Film className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
                        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t.admin_panel_no_movie_data || 'No movie data available'}</p>
                      </div>
                    )}
                  </div>

                  {/* Top TV Shows */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                      <Tv className="w-7 h-7 mr-3 text-purple-500" />
                      {t.admin_panel_top_tv_shows || 'Top TV Shows'}
                    </h2>
                    
                    {stats.topTVShows.length > 0 ? (
                      <div className="space-y-4">
                        {stats.topTVShows.slice(0, 8).map((show, index) => (
                          <div
                            key={show.id}
                            className="flex items-center space-x-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50 transition-colors duration-300"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            {show.posterPath ? (
                              <img
                                src={tmdb.getImageUrl(show.posterPath, 'w92')}
                                alt={show.title}
                                className="w-10 h-14 object-cover rounded shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-14 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                                <Tv className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300 truncate">
                                {show.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                <span>{show.views} views</span>
                                <span>•</span>
                                <span>{formatDuration(show.totalWatchTime)}</span>
                                {/*<span>•</span>*/}
                                {/*<div className="flex items-center">*/}
                                  {/*<Star className="w-3 h-3 text-yellow-500 mr-1" />*/}
                                  {/*<span>{show.rating.toFixed(1)}</span>*/}
                                </div>
                              </div>
                              {show.topEpisodes.length > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Top: S{show.topEpisodes[0].season}E{show.topEpisodes[0].episode} ({show.topEpisodes[0].views} views)
                                </div>
                              )}
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full"
                                  style={{ width: `${show.completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Tv className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
                        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t.admin_panel_no_tv_data || 'No TV show data available'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <>
                {/* User Engagement Metrics */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      {t.admin_panel_user_engagement || 'User Engagement'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t.admin_panel_avg_sessions_user || 'Avg Sessions/User'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.userEngagement.averageSessionsPerUser.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t.admin_panel_avg_time_user || 'Avg Time/User'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatDuration(stats.userEngagement.averageTimePerUser)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-green-400">{t.admin_panel_return_rate || 'Return Rate'}</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {stats.userEngagement.returnUserRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-green-500" />
                      {t.admin_panel_device_distribution || 'Device Distribution'}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(stats.deviceStats).map(([device, count]) => {
                        const total = Object.values(stats.deviceStats).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={device} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                {getDeviceIcon(device)}
                                <span className="capitalize text-gray-700 dark:text-gray-300">{device}</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                      {t.admin_panel_session_duration || 'Session Duration'}
                    </h3>
                    <div className="space-y-3">
                      {stats.userEngagement.sessionDistribution.map((dist) => (
                        <div key={dist.duration} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{dist.duration}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {dist.count} ({dist.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${dist.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Browser and OS Stats */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-orange-500" />
                      {t.admin_panel_browser_distribution || 'Browser Distribution'}
                    </h3>
                    <div className="space-y-3">
                      {stats.browserStats.slice(0, 6).map((browser) => (
                        <div key={browser.browser} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{browser.browser}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {browser.count} ({browser.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                              style={{ width: `${browser.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-teal-500" />
                      {t.admin_panel_operating_system || 'Operating System'}
                    </h3>
                    <div className="space-y-3">
                      {stats.osStats.slice(0, 6).map((os) => (
                        <div key={os.os} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{os.os}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {os.count} ({os.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                              style={{ width: `${os.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
