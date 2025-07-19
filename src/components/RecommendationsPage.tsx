"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Star, Calendar, RefreshCw, TrendingUp, Heart, Zap, Award, Settings } from "lucide-react"
import { recommendations, type RecommendationSection } from "../services/recommendations"
import { tmdb } from "../services/tmdb"
import { userService } from "../services/userService"
import GlobalNavbar from "./GlobalNavbar"

const RecommendationsPage: React.FC = () => {
  const [recommendationSections, setRecommendationSections] = useState<RecommendationSection[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const preferences = userService.getPreferences()
  const stats = userService.getStats()

  const loadRecommendations = async (forceRefresh = false) => {
    setLoading(!forceRefresh)
    setRefreshing(forceRefresh)

    try {
      if (forceRefresh) {
        recommendations.clearCache()
      }

      const sections = await recommendations.getPersonalizedRecommendations()
      setRecommendationSections(sections)
    } catch (error) {
      console.error("Failed to load recommendations:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "trending":
        return <TrendingUp className="w-6 h-6" />
      case "similar":
        return <Heart className="w-6 h-6" />
      case "genre-based":
        return <Zap className="w-6 h-6" />
      case "new-releases":
        return <Star className="w-6 h-6" />
      case "top-rated":
        return <Award className="w-6 h-6" />
      case "popular":
        return <TrendingUp className="w-6 h-6" />
      default:
        return <Star className="w-6 h-6" />
    }
  }

  const getSectionColor = (type: string) => {
    switch (type) {
      case "trending":
        return "from-orange-500 to-red-600"
      case "similar":
        return "from-pink-500 to-rose-600"
      case "genre-based":
        return "from-purple-500 to-indigo-600"
      case "new-releases":
        return "from-green-500 to-emerald-600"
      case "top-rated":
        return "from-blue-500 to-cyan-600"
      case "popular":
        return "from-yellow-500 to-orange-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <GlobalNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading personalized recommendations...</p>
          </div>
        </div>
      </div>
    )
  }

  const hasPreferences = preferences.favoriteGenres.length > 0
  const hasHistory = userService.getSessions().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Discover Great Content
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {hasPreferences || hasHistory
                  ? "Personalized recommendations based on your preferences and viewing history"
                  : "Popular and trending content to get you started"}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </Link>

              <button
                onClick={() => loadRecommendations(true)}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recommendation Sections */}
        <div className="space-y-12">
          {recommendationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${getSectionColor(section.type)} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  {getSectionIcon(section.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{section.description}</p>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {section.items.map((item, itemIndex) => {
                  const isMovie = item.type === "movie"
                  const title = item.title || item.name || ""
                  const date = item.release_date || item.first_air_date
                  const link = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`

                  return (
                    <div
                      key={`${item.type}-${item.id}-${itemIndex}`}
                      className="group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-lg border border-pink-200/50 dark:border-gray-600/30 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <Link to={link} className="block">
                        <div className="aspect-[2/3] overflow-hidden">
                          <img
                            src={tmdb.getImageUrl(item.poster_path, "w342") || "/placeholder.svg"}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                            {title}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{date ? new Date(date).getFullYear() : "N/A"}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{item.vote_average.toFixed(1)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-600 text-xs rounded-full text-gray-600 dark:text-gray-300">
                              {isMovie ? "Movie" : "TV Show"}
                            </span>
                            <div className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                              {Math.round(item.confidence * 100)}% match
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Recommendation Reason Tooltip */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-lg max-w-32 truncate">
                          {item.reason}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Setup Prompt for Better Recommendations */}
        {!hasPreferences && !hasHistory && (
          <div className="mt-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Get Better Recommendations</h3>
            <p className="text-lg opacity-90 mb-6">
              Set your favorite genres and start watching content to get personalized recommendations tailored just for
              you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/profile"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-white font-semibold"
              >
                <Settings className="w-5 h-5" />
                Set Preferences
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-white font-semibold"
              >
                <TrendingUp className="w-5 h-5" />
                Browse Content
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecommendationsPage
