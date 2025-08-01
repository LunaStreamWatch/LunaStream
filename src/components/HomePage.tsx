"use client"

import React, { useState, useEffect } from "react"
import { Search, TrendingUp } from "lucide-react"
import { useNavigate, useParams, Link } from "react-router-dom"

import { tmdb } from "../services/tmdb"
import type { Movie, TVShow } from "../types"
import GlobalNavbar from "./GlobalNavbar"
import { languages, translations } from '../data/i18n'

import { useLanguage } from "./LanguageContext"

const HomePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<(Movie | (TVShow & { media_type: "movie" | "tv" }))[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [trendingTV, setTrendingTV] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [showAllFaves, setShowAllFaves] = React.useState(false)

  const { language, setLanguage } = useLanguage()
  const t = translations[language] || translations.en

  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState<any[]>([])
  const [recentlyViewedTVEpisodes, setRecentlyViewedTVEpisodes] = useState<{
    [showId: number]: { show: any; episodes: any[] }
  }>({})

  // State
  const [favoriteShows, setFavoriteShows] = useState(() => {
    const stored = localStorage.getItem("favoriteShows")
    return stored ? JSON.parse(stored) : []
  })

  const [favoriteMovies, setFavoriteMovies] = useState(() => {
    const stored = localStorage.getItem("favoriteMovies")
    return stored ? JSON.parse(stored) : []
  })

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedShows = JSON.parse(localStorage.getItem("favoriteShows") || "[]")
    const storedMovies = JSON.parse(localStorage.getItem("favoriteMovies") || "[]")
    setFavoriteShows(storedShows)
    setFavoriteMovies(storedMovies)
  }, [])

  const toggleFavorite = (item: any) => {
    if (item.type === "tv") {
      let updatedShows = [...favoriteShows]
      if (favoriteShows.includes(item.show.id)) {
        updatedShows = updatedShows.filter((id) => id !== item.show.id)
      } else {
        updatedShows.unshift(item.show.id)
      }
      setFavoriteShows(updatedShows)
      localStorage.setItem("favoriteShows", JSON.stringify(updatedShows))
    }

    if (item.type === "movie") {
      let updatedMovies = [...favoriteMovies]
      if (favoriteMovies.includes(item.movie.id)) {
        updatedMovies = updatedMovies.filter((id) => id !== item.movie.id)
      } else {
        updatedMovies.unshift(item.movie.id)
      }
      setFavoriteMovies(updatedMovies)
      localStorage.setItem("favoriteMovies", JSON.stringify(updatedMovies))
    }
  }

  const isFavorited = (item: any) => {
    if (item.type === "tv") {
      return favoriteShows.includes(item.show.id)
    }
    if (item.type === "movie") {
      return favoriteMovies.includes(item.movie.id)
    }
    return false
  }

  const clearRecentlyViewed = () => {
    localStorage.removeItem("recentlyViewedMovies")
    localStorage.removeItem("recentlyViewedTVEpisodes")
    setRecentlyViewedMovies([])
    setRecentlyViewedTVEpisodes({})
  }

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("recentlyViewedMovies") || "[]")
    setRecentlyViewedMovies(items)
  }, [id])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recentlyViewedTVEpisodes") || "{}")
    setRecentlyViewedTVEpisodes(data)
  }, [])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [moviesData, tvData] = await Promise.all([tmdb.getTrendingMovies(), tmdb.getTrendingTV()])
        setTrendingMovies(moviesData.results?.slice(0, 12) || [])
        setTrendingTV(tvData.results?.slice(0, 12) || [])
      } catch (error) {
        console.error(t.home_trending_fetch_error, error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const showRecentlyViewed = recentlyViewedMovies.length > 0 || Object.keys(recentlyViewedTVEpisodes).length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      {/* Hero & Search */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 transition-colors duration-300 px-4">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {t.home_heading_title}
              </span>
            </h1>
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto transition-colors duration-300 px-4">
              {t.home_heading_subtitle}
            </p>
            {/* Search with Suggestions */}
            <div className="max-w-2xl mx-auto relative px-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 transition-colors duration-300">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400 dark:text-purple-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={async (e) => {
                      const value = e.target.value
                      setQuery(value)
                      if (value.trim().length > 1) {
                        try {
                          const [movieRes, tvRes] = await Promise.all([tmdb.searchMovies(value), tmdb.searchTV(value)])
                          const movieResults = (movieRes.results || []).map((item) => ({
                            ...item,
                            media_type: "movie",
                          }))

                          // Fetch additional details for TV shows
                          const tvResults = await Promise.all(
                            (tvRes.results || []).slice(0, 3).map(async (item) => {
                              try {
                                const details = await tmdb.getTVDetails(item.id)
                                return {
                                  ...item,
                                  media_type: "tv",
                                  number_of_seasons: details.number_of_seasons,
                                  number_of_episodes: details.number_of_episodes,
                                }
                              } catch {
                                return {
                                  ...item,
                                  media_type: "tv",
                                }
                              }
                            }),
                          )

                          const combined = [...movieResults, ...tvResults]
                            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                            .slice(0, 6)
                          setSuggestions(combined)
                        } catch (error) {
                          console.error(t.search_fail_error, error)
                          setSuggestions([])
                        }
                      } else {
                        setSuggestions([])
                      }
                    }}
                    placeholder={t.search_placeholder}
                    className="block w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6 text-base sm:text-lg bg-transparent border-0 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-0 focus:outline-none transition-colors duration-300"
                  />
                  <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-6">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <span className="hidden sm:inline">{t.nav_search}</span>
                      <Search className="w-4 h-4 sm:hidden" />
                    </div>
                  </button>
                </div>
                {/* Enhanced Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-h-96 overflow-auto">
                    {suggestions.map((item) => {
                      const isMovie = item.media_type === "movie"
                      const title = isMovie ? item.title : item.name
                      const releaseDate = isMovie ? item.release_date : item.first_air_date
                      const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A"

                      return (
                        <div
                          key={`${item.title || item.name}-${item.id}`}
                          onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                          className="flex items-center p-4 hover:bg-pink-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700/30 last:border-b-0"
                        >
                          {/* Poster Image */}
                          <div className="flex-shrink-0 w-12 h-16 mr-4 rounded-lg overflow-hidden shadow-md">
                            <img
                              src={tmdb.getImageUrl(item.poster_path, "w92") || "/placeholder.svg"}
                              alt={title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {title}
                                </h3>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{year}</span>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-yellow-500 text-xs">★</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                      {item.vote_average.toFixed(1)}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      isMovie
                                        ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                    }`}
                                  >
                                    {isMovie ? t.content_movie_singular : t.content_tv_singular}
                                  </span>
                                </div>

                                {/* TV Show specific info */}
                                {!isMovie && (
                                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Seasons: {(item as any).number_of_seasons || t.content_n_a}</span>
                                    <span>Episodes: {(item as any).number_of_episodes || t.content_n_a}</span>
                                  </div>
                                )}

                                {/* Overview preview */}
                                {item.overview && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {item.overview}
                                  </p>
                                )}
                              </div>

                              {/* Popularity indicator */}
                              <div className="flex-shrink-0 ml-3">
                                <div className="w-2 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="bg-gradient-to-t from-pink-500 to-purple-500 rounded-full transition-all duration-300"
                                    style={{
                                      height: `${Math.min((item.popularity / 100) * 100, 100)}%`,
                                      width: "100%",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <br />

      {/* Trending Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
                              {t.home_trending_loading}
            </p>
          </div>
        ) : (
          <>
            {/* Trending Movies */}
            <div className="mb-12">
              <h2 className="flex items-center mb-8 text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                <TrendingUp className="w-8 h-8 mr-3 text-pink-500" />
                {t.content_trending} {t.content_movie_plural}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trendingMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    className="group block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(movie.poster_path) || "/placeholder.svg"}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending TV Shows */}
            <div>
              <h2 className="flex items-center mb-8 text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                <TrendingUp className="w-8 h-8 mr-3 text-purple-500" />
                {t.content_trending} {t.content_tv_plural}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trendingTV.map((show) => (
                  <Link
                    key={show.id}
                    to={`/tv/${show.id}`}
                    className="group block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(show.poster_path) || "/placeholder.svg"}
                        alt={show.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {show.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(show.first_air_date).getFullYear()}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{show.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage
