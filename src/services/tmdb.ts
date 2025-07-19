const API_KEY = "762f9abeaf5a0a96795dee0bb3989df9"
const BASE_URL = "https://api.themoviedb.org/3"

export interface TMDbResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface MovieRecommendation {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  release_date: string
  genre_ids: number[]
}

export interface PersonDetails {
  id: number
  name: string
  profile_path: string | null
  biography: string
  birthday: string | null
  place_of_birth: string | null
  known_for_department: string
}

export interface Review {
  id: string
  author: string
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number | null
  }
  content: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

class TMDbService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async fetchWithCache<T>(url: string, cacheKey?: string): Promise<T> {
    const key = cacheKey || url
    const cached = this.cache.get(key)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.cache.set(key, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error("TMDb API error:", error)
      throw error
    }
  }

  // Enhanced search with filters
  async searchMovies(
    query: string,
    filters?: {
      year?: number
      genre?: number
      sortBy?: "popularity.desc" | "vote_average.desc" | "release_date.desc"
      page?: number
    },
  ) {
    let url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`

    if (filters?.year) url += `&year=${filters.year}`
    if (filters?.page) url += `&page=${filters.page}`

    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async searchTV(
    query: string,
    filters?: {
      firstAirDateYear?: number
      genre?: number
      sortBy?: "popularity.desc" | "vote_average.desc" | "first_air_date.desc"
      page?: number
    },
  ) {
    let url = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`

    if (filters?.firstAirDateYear) url += `&first_air_date_year=${filters.firstAirDateYear}`
    if (filters?.page) url += `&page=${filters.page}`

    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  // Advanced discovery endpoints
  async discoverMovies(
    filters: {
      genre?: number[]
      year?: number
      sortBy?: string
      minVoteAverage?: number
      page?: number
      withCompanies?: number[]
      withKeywords?: number[]
    } = {},
  ) {
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}`

    if (filters.genre?.length) url += `&with_genres=${filters.genre.join(",")}`
    if (filters.year) url += `&year=${filters.year}`
    if (filters.sortBy) url += `&sort_by=${filters.sortBy}`
    if (filters.minVoteAverage) url += `&vote_average.gte=${filters.minVoteAverage}`
    if (filters.page) url += `&page=${filters.page}`
    if (filters.withCompanies?.length) url += `&with_companies=${filters.withCompanies.join(",")}`
    if (filters.withKeywords?.length) url += `&with_keywords=${filters.withKeywords.join(",")}`

    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async discoverTV(
    filters: {
      genre?: number[]
      firstAirDateYear?: number
      sortBy?: string
      minVoteAverage?: number
      page?: number
      withNetworks?: number[]
      withKeywords?: number[]
    } = {},
  ) {
    let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}`

    if (filters.genre?.length) url += `&with_genres=${filters.genre.join(",")}`
    if (filters.firstAirDateYear) url += `&first_air_date_year=${filters.firstAirDateYear}`
    if (filters.sortBy) url += `&sort_by=${filters.sortBy}`
    if (filters.minVoteAverage) url += `&vote_average.gte=${filters.minVoteAverage}`
    if (filters.page) url += `&page=${filters.page}`
    if (filters.withNetworks?.length) url += `&with_networks=${filters.withNetworks.join(",")}`
    if (filters.withKeywords?.length) url += `&with_keywords=${filters.withKeywords.join(",")}`

    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  // Recommendation endpoints
  async getMovieRecommendations(movieId: number, page = 1) {
    const url = `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<MovieRecommendation>>(url)
  }

  async getTVRecommendations(tvId: number, page = 1) {
    const url = `${BASE_URL}/tv/${tvId}/recommendations?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async getSimilarMovies(movieId: number, page = 1) {
    const url = `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<MovieRecommendation>>(url)
  }

  async getSimilarTV(tvId: number, page = 1) {
    const url = `${BASE_URL}/tv/${tvId}/similar?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  // Genre endpoints
  async getMovieGenres() {
    const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    return this.fetchWithCache<{ genres: Genre[] }>(url, "movie-genres")
  }

  async getTVGenres() {
    const url = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`
    return this.fetchWithCache<{ genres: Genre[] }>(url, "tv-genres")
  }

  // Person endpoints
  async getPersonDetails(personId: number) {
    const url = `${BASE_URL}/person/${personId}?api_key=${API_KEY}`
    return this.fetchWithCache<PersonDetails>(url)
  }

  async getPersonMovieCredits(personId: number) {
    const url = `${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}`
    return this.fetchWithCache<any>(url)
  }

  async getPersonTVCredits(personId: number) {
    const url = `${BASE_URL}/person/${personId}/tv_credits?api_key=${API_KEY}`
    return this.fetchWithCache<any>(url)
  }

  // Reviews and videos
  async getMovieReviews(movieId: number, page = 1) {
    const url = `${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<Review>>(url)
  }

  async getTVReviews(tvId: number, page = 1) {
    const url = `${BASE_URL}/tv/${tvId}/reviews?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<Review>>(url)
  }

  async getMovieVideos(movieId: number) {
    const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
    return this.fetchWithCache<{ results: Video[] }>(url)
  }

  async getTVVideos(tvId: number) {
    const url = `${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}`
    return this.fetchWithCache<{ results: Video[] }>(url)
  }

  // Trending with time windows
  async getTrendingMovies(timeWindow: "day" | "week" = "week") {
    const url = `${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}`
    return this.fetchWithCache<TMDbResponse<any>>(url, `trending-movies-${timeWindow}`)
  }

  async getTrendingTV(timeWindow: "day" | "week" = "week") {
    const url = `${BASE_URL}/trending/tv/${timeWindow}?api_key=${API_KEY}`
    return this.fetchWithCache<TMDbResponse<any>>(url, `trending-tv-${timeWindow}`)
  }

  async getTrendingPeople(timeWindow: "day" | "week" = "week") {
    const url = `${BASE_URL}/trending/person/${timeWindow}?api_key=${API_KEY}`
    return this.fetchWithCache<TMDbResponse<any>>(url, `trending-people-${timeWindow}`)
  }

  // Top rated and popular
  async getTopRatedMovies(page = 1) {
    const url = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async getTopRatedTV(page = 1) {
    const url = `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async getPopularMovies(page = 1) {
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async getPopularTV(page = 1) {
    const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  // Now playing and airing today
  async getNowPlayingMovies(page = 1) {
    const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async getAiringTodayTV(page = 1) {
    const url = `${BASE_URL}/tv/airing_today?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  async getOnTheAirTV(page = 1) {
    const url = `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&page=${page}`
    return this.fetchWithCache<TMDbResponse<any>>(url)
  }

  // Existing methods
  async getMovieDetails(id: number) {
    const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}`
    return this.fetchWithCache<any>(url)
  }

  async getTVDetails(id: number) {
    const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}`
    return this.fetchWithCache<any>(url)
  }

  async getTVSeasons(id: number, seasonNumber: number) {
    const url = `${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`
    return this.fetchWithCache<any>(url)
  }

  async getTVCredits(id: number) {
    const url = `${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`
    return this.fetchWithCache<any>(url)
  }

  async getMovieCredits(id: number) {
    const url = `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    return this.fetchWithCache<any>(url)
  }

  getImageUrl(path: string | null, size = "w500") {
    if (!path)
      return "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop"
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  // Utility methods
  clearCache() {
    this.cache.clear()
  }

  getCacheSize() {
    return this.cache.size
  }
}

export const tmdb = new TMDbService()
