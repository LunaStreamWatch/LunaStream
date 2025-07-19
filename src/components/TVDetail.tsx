"use client"

import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Star, Calendar, Tv, ChevronRight, Heart } from "lucide-react"
import { tmdb } from "../services/tmdb"
import type { TVDetails } from "../types"
import GlobalNavbar from "./GlobalNavbar"

const TVDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<TVDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [cast, setCast] = React.useState([])

  useEffect(() => {
    if (!show) return
    const favorites = JSON.parse(localStorage.getItem("favoriteShows") || "[]")
    const isFav = favorites.some((fav) => fav.id === show.id)
    setIsFavorited(isFav)
  }, [show])

  useEffect(() => {
    async function fetchCredits() {
      if (!show?.id) return
      const credits = await tmdb.getTVCredits(show.id)
      setCast(credits.cast || [])
    }

    if (show?.id) {
      fetchCredits()
    }
  }, [show?.id])

  const toggleFavorite = () => {
    if (!show) return

    const favorites = JSON.parse(localStorage.getItem("favoriteShows") || "[]")
    const index = favorites.findIndex((fav: any) => fav.id === show.id)

    if (index !== -1) {
      favorites.splice(index, 1)
      setIsFavorited(false)
    } else {
      favorites.unshift(show)
      setIsFavorited(true)
    }

    localStorage.setItem("favoriteShows", JSON.stringify(favorites))
  }

  useEffect(() => {
    const fetchShow = async () => {
      if (!id) return

      setLoading(true)
      try {
        const showData = await tmdb.getTVDetails(Number.parseInt(id))
        setShow(showData)
      } catch (error) {
        console.error("Failed to fetch TV show:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShow()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
            Loading show details...
          </p>
        </div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Show not found
          </h2>
          <Link
            to="/"
            className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show Details */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 overflow-hidden mb-8 transition-colors duration-300">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={tmdb.getImageUrl(show.poster_path, "w500") || "/placeholder.svg"}
                alt={show.name}
                className="h-96 w-full object-cover md:h-full md:w-80"
              />
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  {show.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 mr-1" />
                    {show.vote_average.toFixed(1)}
                  </div>
                  <button
                    onClick={toggleFavorite}
                    aria-label="Toggle Favorite"
                    className={`transition-colors duration-200 ${
                      isFavorited ? "text-pink-500 hover:text-pink-600" : "text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    <Heart className="w-7 h-7" fill={isFavorited ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(show.first_air_date).getFullYear()}
                </div>
                <div>
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
                </div>
                <div>{show.number_of_episodes} Episodes</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">
                {show.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Cast Overview */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 overflow-hidden mb-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-8 pt-8 mb-4">Cast Overview</h2>
          <div className="flex flex-wrap gap-6 px-8 pb-8">
            {cast.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">No cast information available.</p>
            ) : (
              cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="flex-shrink-0 w-28 text-center">
                  <img
                    src={actor.profile_path ? tmdb.getImageUrl(actor.profile_path, "w185") : "/placeholder-avatar.png"}
                    alt={actor.name}
                    className="w-28 h-28 object-cover rounded-full shadow-md mb-2 border border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{actor.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{actor.character}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seasons List */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Seasons
          </h2>

          <div className="space-y-3">
            {show.seasons
              .filter((season) => season.season_number > 0)
              .map((season) => (
                <Link
                  key={season.id}
                  to={`/tv/${id}/season/${season.season_number}`}
                  className="group flex items-center justify-between p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-pink-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={tmdb.getImageUrl(season.poster_path || show.poster_path, "w92")}
                      alt={season.name}
                      className="w-16 h-24 object-cover rounded-lg shadow-md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {season.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <span>{season.episode_count} episodes</span>
                        {season.air_date && (
                          <>
                            <span>•</span>
                            <span>{new Date(season.air_date).getFullYear()}</span>
                          </>
                        )}
                      </div>
                      {season.overview && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{season.overview}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TVDetail
