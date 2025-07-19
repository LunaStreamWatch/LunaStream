// Simple localStorage-based user preferences and data storage
export interface UserPreferences {
  favoriteGenres: number[]
  preferredLanguage: string
  adultContent: boolean
  autoplay: boolean
  quality: "auto" | "1080p" | "720p" | "480p"
  theme: "light" | "dark" | "auto"
  notifications: {
    newReleases: boolean
    recommendations: boolean
    watchlistUpdates: boolean
  }
}

export interface UserStats {
  totalWatchTime: number
  moviesWatched: number
  showsWatched: number
  favoriteGenres: { id: number; name: string; count: number }[]
  watchingStreak: number
  firstVisit: number
  lastVisit: number
  sessionsCount: number
}

export interface ViewingSession {
  id: string
  mediaType: "movie" | "tv"
  mediaId: number
  title: string
  currentTime: number
  duration: number
  watchedAt: number
  completed: boolean
}

class UserService {
  private readonly PREFERENCES_KEY = "lunastream-preferences"
  private readonly STATS_KEY = "lunastream-stats"
  private readonly SESSIONS_KEY = "lunastream-sessions"
  private readonly USER_ID_KEY = "lunastream-user-id"

  constructor() {
    this.initializeUser()
  }

  private initializeUser() {
    // Generate a unique user ID if it doesn't exist
    if (!localStorage.getItem(this.USER_ID_KEY)) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`
      localStorage.setItem(this.USER_ID_KEY, userId)
    }

    // Initialize preferences if they don't exist
    if (!localStorage.getItem(this.PREFERENCES_KEY)) {
      const defaultPreferences: UserPreferences = {
        favoriteGenres: [],
        preferredLanguage: "en",
        adultContent: false,
        autoplay: true,
        quality: "auto",
        theme: "auto",
        notifications: {
          newReleases: true,
          recommendations: true,
          watchlistUpdates: true,
        },
      }
      this.savePreferences(defaultPreferences)
    }

    // Initialize stats if they don't exist
    if (!localStorage.getItem(this.STATS_KEY)) {
      const defaultStats: UserStats = {
        totalWatchTime: 0,
        moviesWatched: 0,
        showsWatched: 0,
        favoriteGenres: [],
        watchingStreak: 0,
        firstVisit: Date.now(),
        lastVisit: Date.now(),
        sessionsCount: 0,
      }
      this.saveStats(defaultStats)
    }

    // Update last visit
    this.updateLastVisit()
  }

  getUserId(): string {
    return localStorage.getItem(this.USER_ID_KEY) || ""
  }

  getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY)
      return stored ? JSON.parse(stored) : this.getDefaultPreferences()
    } catch (error) {
      console.error("Failed to load preferences:", error)
      return this.getDefaultPreferences()
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      favoriteGenres: [],
      preferredLanguage: "en",
      adultContent: false,
      autoplay: true,
      quality: "auto",
      theme: "auto",
      notifications: {
        newReleases: true,
        recommendations: true,
        watchlistUpdates: true,
      },
    }
  }

  savePreferences(preferences: UserPreferences): boolean {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences))
      return true
    } catch (error) {
      console.error("Failed to save preferences:", error)
      return false
    }
  }

  updatePreferences(updates: Partial<UserPreferences>): boolean {
    try {
      const current = this.getPreferences()
      const updated = { ...current, ...updates }
      return this.savePreferences(updated)
    } catch (error) {
      console.error("Failed to update preferences:", error)
      return false
    }
  }

  getStats(): UserStats {
    try {
      const stored = localStorage.getItem(this.STATS_KEY)
      return stored ? JSON.parse(stored) : this.getDefaultStats()
    } catch (error) {
      console.error("Failed to load stats:", error)
      return this.getDefaultStats()
    }
  }

  private getDefaultStats(): UserStats {
    return {
      totalWatchTime: 0,
      moviesWatched: 0,
      showsWatched: 0,
      favoriteGenres: [],
      watchingStreak: 0,
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      sessionsCount: 0,
    }
  }

  saveStats(stats: UserStats): boolean {
    try {
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats))
      return true
    } catch (error) {
      console.error("Failed to save stats:", error)
      return false
    }
  }

  updateStats(updates: Partial<UserStats>): boolean {
    try {
      const current = this.getStats()
      const updated = { ...current, ...updates }
      return this.saveStats(updated)
    } catch (error) {
      console.error("Failed to update stats:", error)
      return false
    }
  }

  private updateLastVisit() {
    const stats = this.getStats()
    stats.lastVisit = Date.now()
    stats.sessionsCount += 1
    this.saveStats(stats)
  }

  // Viewing session management
  getSessions(): ViewingSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load sessions:", error)
      return []
    }
  }

  addSession(session: Omit<ViewingSession, "id" | "watchedAt">): boolean {
    try {
      const sessions = this.getSessions()
      const newSession: ViewingSession = {
        ...session,
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        watchedAt: Date.now(),
      }

      sessions.unshift(newSession)

      // Keep only the last 100 sessions
      if (sessions.length > 100) {
        sessions.splice(100)
      }

      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions))

      // Update stats
      const stats = this.getStats()
      stats.totalWatchTime += session.currentTime
      if (session.mediaType === "movie") {
        stats.moviesWatched += session.completed ? 1 : 0
      } else {
        stats.showsWatched += session.completed ? 1 : 0
      }
      this.saveStats(stats)

      return true
    } catch (error) {
      console.error("Failed to add session:", error)
      return false
    }
  }

  updateSession(sessionId: string, updates: Partial<ViewingSession>): boolean {
    try {
      const sessions = this.getSessions()
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

      if (sessionIndex === -1) return false

      sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates }
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions))

      return true
    } catch (error) {
      console.error("Failed to update session:", error)
      return false
    }
  }

  // Analytics and insights
  getViewingHistory(limit = 20): ViewingSession[] {
    return this.getSessions()
      .sort((a, b) => b.watchedAt - a.watchedAt)
      .slice(0, limit)
  }

  getGenreStats(): { id: number; name: string; count: number }[] {
    const sessions = this.getSessions()
    const genreCounts: Record<number, number> = {}

    // This would need to be enhanced with actual genre data from TMDb
    // For now, we'll use a simplified approach
    sessions.forEach((session) => {
      // In a real implementation, you'd fetch genre data for each media item
      // For demo purposes, we'll simulate some genre data
      const simulatedGenres = [28, 35, 18, 27, 878] // Action, Comedy, Drama, Horror, Sci-Fi
      const randomGenre = simulatedGenres[Math.floor(Math.random() * simulatedGenres.length)]
      genreCounts[randomGenre] = (genreCounts[randomGenre] || 0) + 1
    })

    return Object.entries(genreCounts)
      .map(([id, count]) => ({
        id: Number.parseInt(id),
        name: this.getGenreName(Number.parseInt(id)),
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }

  private getGenreName(genreId: number): string {
    const genreMap: Record<number, string> = {
      28: "Action",
      35: "Comedy",
      18: "Drama",
      27: "Horror",
      878: "Science Fiction",
      // Add more as needed
    }
    return genreMap[genreId] || `Genre ${genreId}`
  }

  // Recommendation data
  getRecommendationData() {
    const preferences = this.getPreferences()
    const sessions = this.getSessions()
    const stats = this.getStats()

    return {
      favoriteGenres: preferences.favoriteGenres,
      recentlyWatched: sessions.slice(0, 10),
      totalWatchTime: stats.totalWatchTime,
      preferredLanguage: preferences.preferredLanguage,
      adultContent: preferences.adultContent,
    }
  }

  // Clear all user data
  clearAllData(): boolean {
    try {
      localStorage.removeItem(this.PREFERENCES_KEY)
      localStorage.removeItem(this.STATS_KEY)
      localStorage.removeItem(this.SESSIONS_KEY)
      localStorage.removeItem(this.USER_ID_KEY)
      this.initializeUser()
      return true
    } catch (error) {
      console.error("Failed to clear user data:", error)
      return false
    }
  }

  // Export user data
  exportData() {
    return {
      userId: this.getUserId(),
      preferences: this.getPreferences(),
      stats: this.getStats(),
      sessions: this.getSessions(),
    }
  }

  // Import user data
  importData(data: any): boolean {
    try {
      if (data.preferences) {
        this.savePreferences(data.preferences)
      }
      if (data.stats) {
        this.saveStats(data.stats)
      }
      if (data.sessions) {
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(data.sessions))
      }
      return true
    } catch (error) {
      console.error("Failed to import data:", error)
      return false
    }
  }
}

export const userService = new UserService()
