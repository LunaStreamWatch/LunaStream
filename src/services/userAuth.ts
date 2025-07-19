// User authentication service (separate from admin auth)
export interface User {
  id: string
  username: string
  email: string
  preferences: UserPreferences
  createdAt: number
  lastLogin: number
}

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
  joinDate: number
}

class UserAuthService {
  private readonly USER_KEY = "lunastream-user"
  private readonly USERS_KEY = "lunastream-users"
  private currentUser: User | null = null

  constructor() {
    this.loadCurrentUser()
  }

  private loadCurrentUser() {
    try {
      const stored = localStorage.getItem(this.USER_KEY)
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load current user:", error)
    }
  }

  private saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser))
    }
  }

  private getAllUsers(): Record<string, User> {
    try {
      const stored = localStorage.getItem(this.USERS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Failed to load users:", error)
      return {}
    }
  }

  private saveAllUsers(users: Record<string, User>) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = this.getAllUsers()

      // Check if user already exists
      const existingUser = Object.values(users).find((u) => u.username === username || u.email === email)
      if (existingUser) {
        return { success: false, message: "Username or email already exists" }
      }

      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`
      const newUser: User = {
        id: userId,
        username,
        email,
        preferences: {
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
        },
        createdAt: Date.now(),
        lastLogin: Date.now(),
      }

      users[userId] = newUser
      this.saveAllUsers(users)
      this.currentUser = newUser
      this.saveCurrentUser()

      return { success: true, message: "Registration successful", user: newUser }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Registration failed" }
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = this.getAllUsers()
      const user = Object.values(users).find((u) => u.username === username || u.email === username)

      if (!user) {
        return { success: false, message: "User not found" }
      }

      // In a real app, you'd verify the password hash
      // For demo purposes, we'll just check if password is not empty
      if (!password) {
        return { success: false, message: "Invalid password" }
      }

      // Update last login
      user.lastLogin = Date.now()
      users[user.id] = user
      this.saveAllUsers(users)

      this.currentUser = user
      this.saveCurrentUser()

      return { success: true, message: "Login successful", user }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Login failed" }
    }
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem(this.USER_KEY)
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    if (!this.currentUser) return false

    try {
      this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences }
      this.saveCurrentUser()

      const users = this.getAllUsers()
      users[this.currentUser.id] = this.currentUser
      this.saveAllUsers(users)

      return true
    } catch (error) {
      console.error("Failed to update preferences:", error)
      return false
    }
  }

  getUserStats(): UserStats | null {
    if (!this.currentUser) return null

    // Calculate stats from watchlist and analytics
    const watchlistMovies = JSON.parse(localStorage.getItem("lunastream-watchlist-movies") || "[]")
    const watchlistTV = JSON.parse(localStorage.getItem("lunastream-watchlist-tv") || "{}")
    const analytics = JSON.parse(localStorage.getItem("lunastream-analytics") || '{"viewHistory": []}')

    const userSessions = analytics.viewHistory?.filter((session: any) => session.userId === this.currentUser?.id) || []

    const totalWatchTime = userSessions.reduce((sum: number, session: any) => sum + (session.currentTime || 0), 0)
    const moviesWatched = userSessions.filter((s: any) => s.mediaType === "movie").length
    const showsWatched = userSessions.filter((s: any) => s.mediaType === "tv").length

    // Calculate favorite genres (simplified)
    const genreCounts: Record<number, number> = {}
    ;[...watchlistMovies, ...Object.values(watchlistTV)].forEach((item: any) => {
      const genres = item.genre_ids || []
      genres.forEach((genreId: number) => {
        genreCounts[genreId] = (genreCounts[genreId] || 0) + 1
      })
    })

    const favoriteGenres = Object.entries(genreCounts)
      .map(([id, count]) => ({ id: Number.parseInt(id), name: `Genre ${id}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalWatchTime,
      moviesWatched,
      showsWatched,
      favoriteGenres,
      watchingStreak: Math.floor(Math.random() * 30) + 1, // Simplified
      joinDate: this.currentUser.createdAt,
    }
  }

  // Guest user functionality
  createGuestSession(): string {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`
    localStorage.setItem("lunastream-guest-id", guestId)
    return guestId
  }

  getGuestId(): string | null {
    return localStorage.getItem("lunastream-guest-id")
  }

  isGuest(): boolean {
    return !this.isLoggedIn() && !!this.getGuestId()
  }
}

export const userAuth = new UserAuthService()
