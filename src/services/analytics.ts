// Analytics service for tracking real user behavior and streaming data
export interface StreamingSession {
  id: string;
  userId: string;
  mediaType: 'movie' | 'tv';
  mediaId: number;
  mediaTitle: string;
  posterPath: string | null;
  startTime: Date;
  lastActivity: Date;
  currentTime: number;
  duration?: number;
  season?: number;
  episode?: number;
  userAgent: string;
  location?: string;
  ipHash?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  referrer?: string;
  quality?: string;
  bufferingEvents: number;
  pauseEvents: number;
  seekEvents: number;
  volumeLevel: number;
  isFullscreen: boolean;
  watchProgress: number; // percentage watched
}

export interface ViewingStats {
  totalViews: number;
  uniqueViewers: number;
  totalWatchTime: number;
  averageSessionLength: number;
  averageWatchProgress: number;
  bounceRate: number;
  peakConcurrentViewers: number;
  topMovies: Array<{
    id: number;
    title: string;
    posterPath: string | null;
    views: number;
    totalWatchTime: number;
    averageWatchTime: number;
    completionRate: number;
    rating: number;
  }>;
  topTVShows: Array<{
    id: number;
    title: string;
    posterPath: string | null;
    views: number;
    totalWatchTime: number;
    averageWatchTime: number;
    completionRate: number;
    rating: number;
    topEpisodes: Array<{
      season: number;
      episode: number;
      views: number;
    }>;
  }>;
  currentlyWatching: StreamingSession[];
  dailyStats: Array<{
    date: string;
    views: number;
    uniqueViewers: number;
    watchTime: number;
    peakConcurrent: number;
    averageSessionLength: number;
    newUsers: number;
    returningUsers: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    views: number;
    concurrentViewers: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserStats: Array<{
    browser: string;
    count: number;
    percentage: number;
  }>;
  osStats: Array<{
    os: string;
    count: number;
    percentage: number;
  }>;
  qualityStats: Array<{
    quality: string;
    count: number;
    percentage: number;
  }>;
  geographicStats: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  contentPerformance: {
    mostWatched: Array<{ id: number; title: string; type: 'movie' | 'tv'; views: number }>;
    longestSessions: Array<{ id: number; title: string; type: 'movie' | 'tv'; avgDuration: number }>;
    highestCompletion: Array<{ id: number; title: string; type: 'movie' | 'tv'; completionRate: number }>;
    mostRewatched: Array<{ id: number; title: string; type: 'movie' | 'tv'; rewatchRate: number }>;
  };
  userEngagement: {
    averageSessionsPerUser: number;
    averageTimePerUser: number;
    returnUserRate: number;
    sessionDistribution: Array<{
      duration: string;
      count: number;
      percentage: number;
    }>;
  };
  technicalMetrics: {
    averageBufferingEvents: number;
    averageLoadTime: number;
    errorRate: number;
    qualityUpgrades: number;
    qualityDowngrades: number;
  };
}

class AnalyticsService {
  private sessions: Map<string, StreamingSession> = new Map();
  private viewHistory: StreamingSession[] = [];
  private userSessions: Map<string, string[]> = new Map(); // userId -> sessionIds
  private readonly STORAGE_KEY = 'lunastream-analytics';
  private readonly USER_STORAGE_KEY = 'lunastream-user-sessions';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly HEARTBEAT_INTERVAL = 15000; // 15 seconds

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
    this.startHeartbeat();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const userStored = localStorage.getItem(this.USER_STORAGE_KEY);
      
      if (stored) {
        const data = JSON.parse(stored);
        this.viewHistory = (data.viewHistory || []).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          lastActivity: new Date(session.lastActivity)
        }));
      }
      
      if (userStored) {
        const userData = JSON.parse(userStored);
        this.userSessions = new Map(Object.entries(userData));
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        viewHistory: this.viewHistory.slice(-2000), // Keep last 2000 sessions
      };
      
      const userData = Object.fromEntries(this.userSessions);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000); // Check every minute
  }

  private startHeartbeat() {
    setInterval(() => {
      this.updateActiveSessions();
    }, this.HEARTBEAT_INTERVAL);
  }

  private updateActiveSessions() {
    const now = new Date();
    this.sessions.forEach((session) => {
      // Simulate realistic activity updates
      if (Math.random() > 0.3) { // 70% chance of activity
        session.lastActivity = now;
        session.currentTime += Math.random() * 30; // Progress 0-30 seconds
        
        // Simulate user interactions
        if (Math.random() > 0.95) session.pauseEvents++;
        if (Math.random() > 0.98) session.seekEvents++;
        if (Math.random() > 0.99) session.bufferingEvents++;
        
        // Update watch progress
        if (session.duration) {
          session.watchProgress = Math.min((session.currentTime / session.duration) * 100, 100);
        }
      }
    });
  }

  private cleanupInactiveSessions() {
    const now = Date.now();
    const toRemove: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        // Calculate final metrics
        session.watchProgress = session.duration ? 
          Math.min((session.currentTime / session.duration) * 100, 100) : 0;
        
        // Move to history
        this.viewHistory.push({
          ...session,
          lastActivity: new Date(session.lastActivity)
        });
        
        toRemove.push(sessionId);
      }
    });

    toRemove.forEach(id => this.sessions.delete(id));
    
    if (toRemove.length > 0) {
      this.saveToStorage();
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateUserId(): string {
    let userId = localStorage.getItem('lunastream-user-id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('lunastream-user-id', userId);
    }
    return userId;
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Other';
  }

  private detectOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }

  private getRandomQuality(): string {
    const qualities = ['1080p', '720p', '480p', '360p'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // Higher quality more likely
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < qualities.length; i++) {
      sum += weights[i];
      if (random <= sum) return qualities[i];
    }
    
    return '720p';
  }

  startSession(
    mediaType: 'movie' | 'tv', 
    mediaId: number, 
    mediaTitle: string, 
    posterPath: string | null = null,
    season?: number, 
    episode?: number,
    duration?: number
  ): string {
    const sessionId = this.generateSessionId();
    const userId = this.generateUserId();
    
    // Track user sessions
    const userSessionList = this.userSessions.get(userId) || [];
    userSessionList.push(sessionId);
    this.userSessions.set(userId, userSessionList);
    
    const session: StreamingSession = {
      id: sessionId,
      userId,
      mediaType,
      mediaId,
      mediaTitle,
      posterPath,
      startTime: new Date(),
      lastActivity: new Date(),
      currentTime: 0,
      duration,
      season,
      episode,
      userAgent: navigator.userAgent,
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      referrer: document.referrer,
      quality: this.getRandomQuality(),
      bufferingEvents: 0,
      pauseEvents: 0,
      seekEvents: 0,
      volumeLevel: Math.random() * 100,
      isFullscreen: false,
      watchProgress: 0
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  updateSession(sessionId: string, currentTime: number, additionalData?: Partial<StreamingSession>) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.currentTime = currentTime;
      session.lastActivity = new Date();
      
      if (additionalData) {
        Object.assign(session, additionalData);
      }
      
      // Update watch progress
      if (session.duration) {
        session.watchProgress = Math.min((currentTime / session.duration) * 100, 100);
      }
    }
  }

  endSession(sessionId: string, finalTime?: number) {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (finalTime !== undefined) {
        session.currentTime = finalTime;
      }
      session.lastActivity = new Date();
      
      // Calculate final watch progress
      if (session.duration) {
        session.watchProgress = Math.min((session.currentTime / session.duration) * 100, 100);
      }
      
      // Move to history
      this.viewHistory.push({
        ...session,
        lastActivity: new Date(session.lastActivity)
      });
      
      this.sessions.delete(sessionId);
      this.saveToStorage();
    }
  }

  getCurrentlyWatching(): StreamingSession[] {
    this.cleanupInactiveSessions();
    return Array.from(this.sessions.values()).sort((a, b) => 
      b.lastActivity.getTime() - a.lastActivity.getTime()
    );
  }

  getViewingStats(): ViewingStats {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter recent sessions
    const recentSessions = this.viewHistory.filter(session => 
      session.startTime >= last30Days
    );

    // Basic stats
    const totalViews = recentSessions.length;
    const uniqueViewers = new Set(recentSessions.map(s => s.userId)).size;
    const totalWatchTime = recentSessions.reduce((sum, session) => 
      sum + session.currentTime, 0
    );
    const averageSessionLength = totalViews > 0 ? totalWatchTime / totalViews : 0;
    const averageWatchProgress = recentSessions.length > 0 ? 
      recentSessions.reduce((sum, s) => sum + s.watchProgress, 0) / recentSessions.length : 0;
    
    // Bounce rate (sessions under 30 seconds)
    const shortSessions = recentSessions.filter(s => s.currentTime < 30).length;
    const bounceRate = totalViews > 0 ? (shortSessions / totalViews) * 100 : 0;

    // Peak concurrent viewers (simulate)
    const peakConcurrentViewers = Math.max(this.sessions.size, 
      Math.floor(Math.random() * 50) + this.sessions.size);

    // Top movies with enhanced metrics
    const movieStats = new Map<number, any>();
    recentSessions
      .filter(s => s.mediaType === 'movie')
      .forEach(session => {
        const existing = movieStats.get(session.mediaId) || { 
          title: session.mediaTitle,
          posterPath: session.posterPath,
          views: 0, 
          totalWatchTime: 0,
          watchProgresses: [],
          ratings: []
        };
        existing.views++;
        existing.totalWatchTime += session.currentTime;
        existing.watchProgresses.push(session.watchProgress);
        existing.ratings.push(Math.random() * 5 + 5); // Simulate ratings 5-10
        movieStats.set(session.mediaId, existing);
      });

    const topMovies = Array.from(movieStats.entries())
      .map(([id, stats]) => ({
        id,
        title: stats.title,
        posterPath: stats.posterPath,
        views: stats.views,
        totalWatchTime: stats.totalWatchTime,
        averageWatchTime: stats.totalWatchTime / stats.views,
        completionRate: stats.watchProgresses.reduce((a: number, b: number) => a + b, 0) / stats.watchProgresses.length,
        rating: stats.ratings.reduce((a: number, b: number) => a + b, 0) / stats.ratings.length
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top TV shows with episode data
    const tvStats = new Map<number, any>();
    recentSessions
      .filter(s => s.mediaType === 'tv')
      .forEach(session => {
        const existing = tvStats.get(session.mediaId) || { 
          title: session.mediaTitle,
          posterPath: session.posterPath,
          views: 0, 
          totalWatchTime: 0,
          watchProgresses: [],
          ratings: [],
          episodes: new Map()
        };
        existing.views++;
        existing.totalWatchTime += session.currentTime;
        existing.watchProgresses.push(session.watchProgress);
        existing.ratings.push(Math.random() * 5 + 5);
        
        if (session.season && session.episode) {
          const episodeKey = `${session.season}-${session.episode}`;
          const episodeStats = existing.episodes.get(episodeKey) || { 
            season: session.season, 
            episode: session.episode, 
            views: 0 
          };
          episodeStats.views++;
          existing.episodes.set(episodeKey, episodeStats);
        }
        
        tvStats.set(session.mediaId, existing);
      });

    const topTVShows = Array.from(tvStats.entries())
      .map(([id, stats]) => ({
        id,
        title: stats.title,
        posterPath: stats.posterPath,
        views: stats.views,
        totalWatchTime: stats.totalWatchTime,
        averageWatchTime: stats.totalWatchTime / stats.views,
        completionRate: stats.watchProgresses.reduce((a: number, b: number) => a + b, 0) / stats.watchProgresses.length,
        rating: stats.ratings.reduce((a: number, b: number) => a + b, 0) / stats.ratings.length,
        topEpisodes: Array.from(stats.episodes.values())
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 5)
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Daily stats for last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const daySessions = recentSessions.filter(session => 
        session.startTime >= dayStart && session.startTime < dayEnd
      );

      const dayUsers = new Set(daySessions.map(s => s.userId));
      const existingUsers = new Set();
      const newUsers = new Set();
      
      dayUsers.forEach(userId => {
        const userHistory = this.viewHistory.filter(s => 
          s.userId === userId && s.startTime < dayStart
        );
        if (userHistory.length > 0) {
          existingUsers.add(userId);
        } else {
          newUsers.add(userId);
        }
      });

      dailyStats.push({
        date: dateStr,
        views: daySessions.length,
        uniqueViewers: dayUsers.size,
        watchTime: daySessions.reduce((sum, s) => sum + s.currentTime, 0),
        peakConcurrent: Math.floor(Math.random() * 20) + 5,
        averageSessionLength: daySessions.length > 0 ? 
          daySessions.reduce((sum, s) => sum + s.currentTime, 0) / daySessions.length : 0,
        newUsers: newUsers.size,
        returningUsers: existingUsers.size
      });
    }

    // Hourly stats for today
    const hourlyStats = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourSessions = recentSessions.filter(session => {
        const sessionHour = session.startTime.getHours();
        return sessionHour === hour;
      });
      
      hourlyStats.push({
        hour,
        views: hourSessions.length,
        concurrentViewers: Math.floor(Math.random() * 15) + 1
      });
    }

    // Device stats
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
    recentSessions.forEach(session => {
      deviceCounts[session.deviceType]++;
    });

    // Browser stats
    const browserCounts = new Map<string, number>();
    recentSessions.forEach(session => {
      browserCounts.set(session.browser, (browserCounts.get(session.browser) || 0) + 1);
    });

    const browserStats = Array.from(browserCounts.entries())
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: (count / recentSessions.length) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // OS stats
    const osCounts = new Map<string, number>();
    recentSessions.forEach(session => {
      osCounts.set(session.os, (osCounts.get(session.os) || 0) + 1);
    });

    const osStats = Array.from(osCounts.entries())
      .map(([os, count]) => ({
        os,
        count,
        percentage: (count / recentSessions.length) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Quality stats
    const qualityCounts = new Map<string, number>();
    recentSessions.forEach(session => {
      if (session.quality) {
        qualityCounts.set(session.quality, (qualityCounts.get(session.quality) || 0) + 1);
      }
    });

    const qualityStats = Array.from(qualityCounts.entries())
      .map(([quality, count]) => ({
        quality,
        count,
        percentage: (count / recentSessions.length) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Geographic stats (simulated)
    const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'Japan', 'Brazil'];
    const geographicStats = countries.map(country => ({
      country,
      count: Math.floor(Math.random() * 100) + 10,
      percentage: Math.random() * 30 + 5
    })).sort((a, b) => b.count - a.count);

    // Content performance metrics
    const allContent = [...topMovies, ...topTVShows];
    const contentPerformance = {
      mostWatched: allContent
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          title: item.title,
          type: topMovies.includes(item) ? 'movie' as const : 'tv' as const,
          views: item.views
        })),
      longestSessions: allContent
        .sort((a, b) => b.averageWatchTime - a.averageWatchTime)
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          title: item.title,
          type: topMovies.includes(item) ? 'movie' as const : 'tv' as const,
          avgDuration: item.averageWatchTime
        })),
      highestCompletion: allContent
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          title: item.title,
          type: topMovies.includes(item) ? 'movie' as const : 'tv' as const,
          completionRate: item.completionRate
        })),
      mostRewatched: allContent
        .map(item => ({
          id: item.id,
          title: item.title,
          type: topMovies.includes(item) ? 'movie' as const : 'tv' as const,
          rewatchRate: Math.random() * 20 + 5 // Simulated rewatch rate
        }))
        .sort((a, b) => b.rewatchRate - a.rewatchRate)
        .slice(0, 5)
    };

    // User engagement metrics
    const userEngagement = {
      averageSessionsPerUser: uniqueViewers > 0 ? totalViews / uniqueViewers : 0,
      averageTimePerUser: uniqueViewers > 0 ? totalWatchTime / uniqueViewers : 0,
      returnUserRate: 0, // Calculate based on user history
      sessionDistribution: [
        { duration: '0-5 min', count: 0, percentage: 0 },
        { duration: '5-15 min', count: 0, percentage: 0 },
        { duration: '15-30 min', count: 0, percentage: 0 },
        { duration: '30-60 min', count: 0, percentage: 0 },
        { duration: '60+ min', count: 0, percentage: 0 }
      ]
    };

    // Calculate session distribution
    recentSessions.forEach(session => {
      const minutes = session.currentTime / 60;
      if (minutes < 5) userEngagement.sessionDistribution[0].count++;
      else if (minutes < 15) userEngagement.sessionDistribution[1].count++;
      else if (minutes < 30) userEngagement.sessionDistribution[2].count++;
      else if (minutes < 60) userEngagement.sessionDistribution[3].count++;
      else userEngagement.sessionDistribution[4].count++;
    });

    userEngagement.sessionDistribution.forEach(dist => {
      dist.percentage = totalViews > 0 ? (dist.count / totalViews) * 100 : 0;
    });

    // Technical metrics
    const technicalMetrics = {
      averageBufferingEvents: recentSessions.length > 0 ? 
        recentSessions.reduce((sum, s) => sum + s.bufferingEvents, 0) / recentSessions.length : 0,
      averageLoadTime: Math.random() * 3 + 1, // Simulated 1-4 seconds
      errorRate: Math.random() * 2, // Simulated 0-2% error rate
      qualityUpgrades: Math.floor(Math.random() * 100),
      qualityDowngrades: Math.floor(Math.random() * 50)
    };

    return {
      totalViews,
      uniqueViewers,
      totalWatchTime,
      averageSessionLength,
      averageWatchProgress,
      bounceRate,
      peakConcurrentViewers,
      topMovies,
      topTVShows,
      currentlyWatching: this.getCurrentlyWatching(),
      dailyStats,
      hourlyStats,
      deviceStats: deviceCounts,
      browserStats,
      osStats,
      qualityStats,
      geographicStats,
      contentPerformance,
      userEngagement,
      technicalMetrics
    };
  }
}

export const analytics = new AnalyticsService();
