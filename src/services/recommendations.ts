import { tmdb } from "./tmdb"
import { userService } from "./userService"

export interface RecommendationItem {
  id: number
  title?: string
  name?: string
  poster_path: string
  backdrop_path: string
  overview: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  genre_ids: number[]
  type: "movie" | "tv"
  confidence: number
  reason: string
}

export interface RecommendationSection {
  title: string
  description: string
  type: string
  items: RecommendationItem[]
}

class RecommendationService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clearCache() {
    this.cache.clear()
  }

  async getPersonalizedRecommendations(): Promise<RecommendationSection[]> {
    const cacheKey = "personalized-recommendations"
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const sections: RecommendationSection[] = []
    const userData = userService.getRecommendationData()

    try {
      // 1. Trending Content (always show)
      const trendingSection = await this.getTrendingRecommendations()
      sections.push(trendingSection)

      // 2. Genre-based recommendations (if user has favorite genres)
      if (userData.favoriteGenres.length > 0) {
        const genreSection = await this.getGenreBasedRecommendations(userData.favoriteGenres)
        sections.push(genreSection)
      }

      // 3. Similar to recently watched (if user has viewing history)
      if (userData.recentlyWatched.length > 0) {
        const similarSection = await this.getSimilarRecommendations(userData.recentlyWatched)
        sections.push(similarSection)
      }

      // 4. New releases
      const newReleasesSection = await this.getNewReleases()
      sections.push(newReleasesSection)

      // 5. Top rated content
      const topRatedSection = await this.getTopRatedRecommendations()
      sections.push(topRatedSection)

      // 6. Popular this week
      const popularSection = await this.getPopularThisWeek()
      sections.push(popularSection)

      this.setCachedData(cacheKey, sections)
      return sections
    } catch (error) {
      console.error("Failed to get personalized recommendations:", error)
      // Return basic trending content as fallback
      return [await this.getTrendingRecommendations()]
    }
  }

  private async getTrendingRecommendations(): Promise<RecommendationSection> {
    const [trendingMovies, trendingTV] = await Promise.all([tmdb.getTrendingMovies(), tmdb.getTrendingTV()])

    const items: RecommendationItem[] = []

    // Mix movies and TV shows
    const movieItems =
      trendingMovies.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "movie" as const,
        confidence: 0.9,
        reason: "Trending now",
      })) || []

    const tvItems =
      trendingTV.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "tv" as const,
        confidence: 0.9,
        reason: "Trending now",
      })) || []

    items.push(...movieItems, ...tvItems)

    // Shuffle and limit
    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 12)

    return {
      title: "Trending Now",
      description: "What everyone is watching right now",
      type: "trending",
      items: shuffled,
    }
  }

  private async getGenreBasedRecommendations(favoriteGenres: number[]): Promise<RecommendationSection> {
    const primaryGenre = favoriteGenres[0]

    const [movieResults, tvResults] = await Promise.all([
      tmdb.discoverMovies({ with_genres: primaryGenre.toString(), sort_by: "popularity.desc" }),
      tmdb.discoverTV({ with_genres: primaryGenre.toString(), sort_by: "popularity.desc" }),
    ])

    const items: RecommendationItem[] = []

    const movieItems =
      movieResults.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "movie" as const,
        confidence: 0.85,
        reason: "Based on your favorite genres",
      })) || []

    const tvItems =
      tvResults.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "tv" as const,
        confidence: 0.85,
        reason: "Based on your favorite genres",
      })) || []

    items.push(...movieItems, ...tvItems)

    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 12)

    return {
      title: "Because You Like These Genres",
      description: "Recommendations based on your favorite genres",
      type: "genre-based",
      items: shuffled,
    }
  }

  private async getSimilarRecommendations(recentlyWatched: any[]): Promise<RecommendationSection> {
    const items: RecommendationItem[] = []

    // Get recommendations based on the most recent item
    const recentItem = recentlyWatched[0]
    if (recentItem) {
      try {
        let recommendations
        if (recentItem.mediaType === "movie") {
          recommendations = await tmdb.getMovieRecommendations(recentItem.mediaId)
        } else {
          recommendations = await tmdb.getTVRecommendations(recentItem.mediaId)
        }

        const recItems =
          recommendations.results?.slice(0, 12).map((item: any) => ({
            ...item,
            type: recentItem.mediaType,
            confidence: 0.8,
            reason: `Because you watched ${recentItem.title}`,
          })) || []

        items.push(...recItems)
      } catch (error) {
        console.error("Failed to get similar recommendations:", error)
      }
    }

    return {
      title: "Because You Watched",
      description: "Similar to your recent viewing history",
      type: "similar",
      items: items.slice(0, 12),
    }
  }

  private async getNewReleases(): Promise<RecommendationSection> {
    const currentDate = new Date()
    const oneMonthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [newMovies, newTV] = await Promise.all([
      tmdb.discoverMovies({
        "primary_release_date.gte": oneMonthAgo.toISOString().split("T")[0],
        "primary_release_date.lte": currentDate.toISOString().split("T")[0],
        sort_by: "popularity.desc",
      }),
      tmdb.discoverTV({
        "first_air_date.gte": oneMonthAgo.toISOString().split("T")[0],
        "first_air_date.lte": currentDate.toISOString().split("T")[0],
        sort_by: "popularity.desc",
      }),
    ])

    const items: RecommendationItem[] = []

    const movieItems =
      newMovies.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "movie" as const,
        confidence: 0.75,
        reason: "New release",
      })) || []

    const tvItems =
      newTV.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "tv" as const,
        confidence: 0.75,
        reason: "New release",
      })) || []

    items.push(...movieItems, ...tvItems)

    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 12)

    return {
      title: "New Releases",
      description: "Fresh content from the past month",
      type: "new-releases",
      items: shuffled,
    }
  }

  private async getTopRatedRecommendations(): Promise<RecommendationSection> {
    const [topMovies, topTV] = await Promise.all([tmdb.getTopRatedMovies(), tmdb.getTopRatedTV()])

    const items: RecommendationItem[] = []

    const movieItems =
      topMovies.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "movie" as const,
        confidence: 0.9,
        reason: "Highly rated",
      })) || []

    const tvItems =
      topTV.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "tv" as const,
        confidence: 0.9,
        reason: "Highly rated",
      })) || []

    items.push(...movieItems, ...tvItems)

    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 12)

    return {
      title: "Top Rated",
      description: "Critically acclaimed movies and shows",
      type: "top-rated",
      items: shuffled,
    }
  }

  private async getPopularThisWeek(): Promise<RecommendationSection> {
    const [popularMovies, popularTV] = await Promise.all([tmdb.getPopularMovies(), tmdb.getPopularTV()])

    const items: RecommendationItem[] = []

    const movieItems =
      popularMovies.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "movie" as const,
        confidence: 0.8,
        reason: "Popular this week",
      })) || []

    const tvItems =
      popularTV.results?.slice(0, 6).map((item: any) => ({
        ...item,
        type: "tv" as const,
        confidence: 0.8,
        reason: "Popular this week",
      })) || []

    items.push(...movieItems, ...tvItems)

    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 12)

    return {
      title: "Popular This Week",
      description: "What's popular among viewers",
      type: "popular",
      items: shuffled,
    }
  }

  // Get recommendations for a specific item
  async getItemRecommendations(mediaType: "movie" | "tv", mediaId: number): Promise<RecommendationItem[]> {
    try {
      let recommendations
      if (mediaType === "movie") {
        recommendations = await tmdb.getMovieRecommendations(mediaId)
      } else {
        recommendations = await tmdb.getTVRecommendations(mediaId)
      }

      return (
        recommendations.results?.slice(0, 12).map((item: any) => ({
          ...item,
          type: mediaType,
          confidence: 0.8,
          reason: "Similar content",
        })) || []
      )
    } catch (error) {
      console.error("Failed to get item recommendations:", error)
      return []
    }
  }
}

export const recommendations = new RecommendationService()
