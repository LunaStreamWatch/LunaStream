"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  User,
  Settings,
  BarChart3,
  Play,
  Calendar,
  Star,
  Trophy,
  Flame,
  Target,
  Download,
  Upload,
  Trash2,
} from "lucide-react"
import { userService, type UserStats, type UserPreferences } from "../services/userService"
import { tmdb } from "../services/tmdb"
import GlobalNavbar from "./GlobalNavbar"

const UserProfile: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(userService.getPreferences())
  const [stats, setStats] = useState<UserStats>(userService.getStats())
  const [activeTab, setActiveTab] = useState<"overview" | "preferences" | "stats" | "data">("overview")
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState<any[]>([])
  const [userId] = useState(userService.getUserId())

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load genres for preferences
        const [movieGenres, tvGenres] = await Promise.all([tmdb.getMovieGenres(), tmdb.getTVGenres()])

        const allGenres = [...movieGenres.genres, ...tvGenres.genres]
        const uniqueGenres = allGenres.filter(
          (genre, index, self) => index === self.findIndex((g) => g.id === genre.id),
        )
        setGenres(uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)))

        // Refresh stats
        setStats(userService.getStats())
      } catch (error) {
        console.error("Failed to load user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const success = userService.updatePreferences(updates)
    if (success) {
      setPreferences(userService.getPreferences())
    }
  }

  const exportData = () => {
    const data = userService.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lunastream-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const success = userService.importData(data)
        if (success) {
          setPreferences(userService.getPreferences())
          setStats(userService.getStats())
          alert("Data imported successfully!")
        } else {
          alert("Failed to import data")
        }
      } catch (error) {
        console.error("Import error:", error)
        alert("Invalid file format")
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      const success = userService.clearAllData()
      if (success) {
        setPreferences(userService.getPreferences())
        setStats(userService.getStats())
        alert("All data cleared successfully!")
      } else {
        alert("Failed to clear data")
      }
    }
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <GlobalNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "data", label: "Data Management", icon: Download },
  ]

  const genreStats = userService.getGenreStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-600/30 p-8 mb-8 transition-colors duration-300">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Profile</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-1">User ID: {userId.slice(0, 12)}...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member since {formatDate(stats.firstVisit)}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-600/30 p-2 transition-colors duration-300">
            <div className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-600/30 p-8 transition-colors duration-300">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Overview</h2>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-pink-200/50 dark:border-pink-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Watch Time</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatDuration(stats.totalWatchTime)}
                      </p>
                    </div>
                    <Play className="w-8 h-8 text-pink-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Movies Watched</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.moviesWatched}</p>
                    </div>
                    <Star className="w-8 h-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200/50 dark:border-indigo-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Shows Watched</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.showsWatched}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-indigo-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200/50 dark:border-orange-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sessions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sessionsCount}</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Favorite Genres */}
              {genreStats.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Viewing Patterns</h3>
                  <div className="space-y-3">
                    {genreStats.slice(0, 5).map((genre, index) => (
                      <div key={genre.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{genre.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${(genre.count / genreStats[0].count) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{genre.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preferences</h2>

              {/* Favorite Genres */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Favorite Genres</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {genres.map((genre) => (
                    <label key={genre.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.favoriteGenres.includes(genre.id)}
                        onChange={(e) => {
                          const newGenres = e.target.checked
                            ? [...preferences.favoriteGenres, genre.id]
                            : preferences.favoriteGenres.filter((id) => id !== genre.id)
                          updatePreferences({ favoriteGenres: newGenres })
                        }}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Playback</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">Autoplay</span>
                      <input
                        type="checkbox"
                        checked={preferences.autoplay}
                        onChange={(e) => updatePreferences({ autoplay: e.target.checked })}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">Adult Content</span>
                      <input
                        type="checkbox"
                        checked={preferences.adultContent}
                        onChange={(e) => updatePreferences({ adultContent: e.target.checked })}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </label>

                    <div>
                      <label className="block text-gray-900 dark:text-white mb-2">Default Quality</label>
                      <select
                        value={preferences.quality}
                        onChange={(e) => updatePreferences({ quality: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="auto">Auto</option>
                        <option value="1080p">1080p</option>
                        <option value="720p">720p</option>
                        <option value="480p">480p</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-900 dark:text-white mb-2">Language</label>
                      <select
                        value={preferences.preferredLanguage}
                        onChange={(e) => updatePreferences({ preferredLanguage: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">New Releases</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.newReleases}
                        onChange={(e) =>
                          updatePreferences({
                            notifications: {
                              ...preferences.notifications,
                              newReleases: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">Recommendations</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.recommendations}
                        onChange={(e) =>
                          updatePreferences({
                            notifications: {
                              ...preferences.notifications,
                              recommendations: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">Watchlist Updates</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.watchlistUpdates}
                        onChange={(e) =>
                          updatePreferences({
                            notifications: {
                              ...preferences.notifications,
                              watchlistUpdates: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === "stats" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detailed Statistics</h2>

              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Account Age</h3>
                    <Calendar className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor((Date.now() - stats.firstVisit) / (1000 * 60 * 60 * 24))} days
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Since {formatDate(stats.firstVisit)}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Average per Day</h3>
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatDuration(
                      stats.totalWatchTime /
                        Math.max(1, Math.floor((Date.now() - stats.firstVisit) / (1000 * 60 * 60 * 24))),
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daily watch time</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Content Ratio</h3>
                    <BarChart3 className="w-6 h-6 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.moviesWatched + stats.showsWatched > 0
                      ? `${Math.round((stats.moviesWatched / (stats.moviesWatched + stats.showsWatched)) * 100)}% Movies`
                      : "No data"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stats.showsWatched} shows, {stats.moviesWatched} movies
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {userService.getViewingHistory(5).map((session, index) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{session.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.mediaType === "movie" ? "Movie" : "TV Show"} • {formatDate(session.watchedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDuration(session.currentTime)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {session.completed
                            ? "Completed"
                            : `${Math.round((session.currentTime / session.duration) * 100)}%`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {userService.getViewingHistory().length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No viewing history yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === "data" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Management</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Data */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Download className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Download all your preferences, viewing history, and statistics as a JSON file.
                  </p>
                  <button
                    onClick={exportData}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                  >
                    Export Data
                  </button>
                </div>

                {/* Import Data */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Upload className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Restore your data from a previously exported JSON file.
                  </p>
                  <label className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer block text-center">
                    Choose File
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                </div>

                {/* Clear Data */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-red-200/50 dark:border-red-700/50 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <Trash2 className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clear All Data</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Permanently delete all your preferences, viewing history, and statistics. This action cannot be
                    undone.
                  </p>
                  <button
                    onClick={clearAllData}
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-200"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>

              {/* Data Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {preferences.favoriteGenres.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Favorite Genres</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userService.getSessions().length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Viewing Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sessionsCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(JSON.stringify(userService.exportData()).length / 1024)}KB
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Data Size</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
