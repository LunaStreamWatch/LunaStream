"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Search, X, Calendar, Star, Sliders } from "lucide-react"
import { tmdb, type Genre } from "../services/tmdb"
import { Link } from "react-router-dom"

interface SearchFilters {
  query: string
  type: "all" | "movie" | "tv"
  genre: number | null
  year: number | null
  minRating: number
  sortBy: "popularity" | "rating" | "release_date" | "title"
  sortOrder: "desc" | "asc"
}

interface AdvancedSearchProps {
  onClose: () => void
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onClose }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "all",
    genre: null,
    year: null,
    minRating: 0,
    sortBy: "popularity",
    sortOrder: "desc",
  })

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [movieGenres, setMovieGenres] = useState<Genre[]>([])
  const [tvGenres, setTVGenres] = useState<Genre[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenresData, tvGenresData] = await Promise.all([tmdb.getMovieGenres(), tmdb.getTVGenres()])
        setMovieGenres(movieGenresData.genres)
        setTVGenres(tvGenresData.genres)
      } catch (error) {
        console.error("Failed to load genres:", error)
      }
    }
    loadGenres()
  }, [])

  // Combined genres for "all" type
  const allGenres = useMemo(() => {
    const combined = [...movieGenres, ...tvGenres]
    const unique = combined.filter((genre, index, self) => index === self.findIndex((g) => g.id === genre.id))
    return unique.sort((a, b) => a.name.localeCompare(b.name))
  }, [movieGenres, tvGenres])

  const currentGenres = filters.type === "movie" ? movieGenres : filters.type === "tv" ? tvGenres : allGenres

  // Search function
  const performSearch = async (resetResults = true) => {
    if (!filters.query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchResults: any[] = []

      if (filters.type === "all" || filters.type === "movie") {
        const movieResults = await tmdb.searchMovies(filters.query, {
          year: filters.year || undefined,
          page: resetResults ? 1 : page,
        })
        searchResults.push(...movieResults.results.map((item: any) => ({ ...item, media_type: "movie" })))
      }

      if (filters.type === "all" || filters.type === "tv") {
        const tvResults = await tmdb.searchTV(filters.query, {
          firstAirDateYear: filters.year || undefined,
          page: resetResults ? 1 : page,
        })
        searchResults.push(...tvResults.results.map((item: any) => ({ ...item, media_type: "tv" })))
      }

      // Apply filters
      const filteredResults = searchResults.filter((item) => {
        // Genre filter
        if (filters.genre && item.genre_ids && !item.genre_ids.includes(filters.genre)) {
          return false
        }

        // Rating filter
        if (item.vote_average < filters.minRating) {
          return false
        }

        return true
      })

      // Sort results
      filteredResults.sort((a, b) => {
        let aValue, bValue

        switch (filters.sortBy) {
          case "rating":
            aValue = a.vote_average || 0
            bValue = b.vote_average || 0
            break
          case "release_date":
            aValue = new Date(a.release_date || a.first_air_date || 0).getTime()
            bValue = new Date(b.release_date || b.first_air_date || 0).getTime()
            break
          case "title":
            aValue = (a.title || a.name || "").toLowerCase()
            bValue = (b.title || b.name || "").toLowerCase()
            break
          case "popularity":
          default:
            aValue = a.popularity || 0
            bValue = b.popularity || 0
            break
        }

        if (filters.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      if (resetResults) {
        setResults(filteredResults)
        setPage(1)
      } else {
        setResults((prev) => [...prev, ...filteredResults])
      }

      setHasMore(filteredResults.length === 20) // Assume 20 per page
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters.query, filters.type, filters.genre, filters.year, filters.minRating, filters.sortBy, filters.sortOrder])

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1)
      performSearch(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      query: "",
      type: "all",
      genre: null,
      year: null,
      minRating: 0,
      sortBy: "popularity",
      sortOrder: "desc",
    })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl my-8 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Search</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for movies, TV shows, people..."
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
            />
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            <Sliders className="w-5 h-5" />
            <span>Filters</span>
            {showFilters && (
              <button
                onClick={resetFilters}
                className="ml-4 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
              >
                Reset All
              </button>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">All</option>
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genre</label>
                <select
                  value={filters.genre || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, genre: e.target.value ? Number.parseInt(e.target.value) : null }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">All Genres</option>
                  {currentGenres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                <select
                  value={filters.year || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, year: e.target.value ? Number.parseInt(e.target.value) : null }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Any Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating: {filters.minRating}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minRating: Number.parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="release_date">Release Date</option>
                  <option value="title">Title</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortOrder: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="p-6">
          {loading && results.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && filters.query && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No results found for "{filters.query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {results.length} results for "{filters.query}"
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((item, index) => {
                  const isMovie = item.media_type === "movie"
                  const title = isMovie ? item.title : item.name
                  const date = isMovie ? item.release_date : item.first_air_date
                  const link = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`

                  return (
                    <Link
                      key={`${item.media_type}-${item.id}-${index}`}
                      to={link}
                      onClick={onClose}
                      className="group block bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-[2/3] overflow-hidden">
                        <img
                          src={tmdb.getImageUrl(item.poster_path, "w342") || "/placeholder.svg"}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {title}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{date ? new Date(date).getFullYear() : "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{item.vote_average?.toFixed(1) || "N/A"}</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-600 text-xs rounded-full text-gray-600 dark:text-gray-300">
                            {isMovie ? "Movie" : "TV Show"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearch
