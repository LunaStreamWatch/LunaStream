"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Play, Star, Calendar, Tv, Info } from "lucide-react"
import { tmdb } from "../services/tmdb"
import type { TVDetails, Episode } from "../types"
import { watchlistService } from "../services/watchlist"
import GlobalNavbar from "./GlobalNavbar"

const SeasonDetail: React.FC = () => {
  const { id, seasonNumber } = useParams<{ id: string; seasonNumber: string }>()
  const navigate = useNavigate()
  const [show, setShow] = useState<TVDetails | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [showDescriptions, setShowDescriptions] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !seasonNumber) return

      setLoading(true)
      try {
        const [showData, seasonData] = await Promise.all([
          tmdb.getTVDetails(Number.parseInt(id)),
          tmdb.getTVSeasons(Number.parseInt(id), Number.parseInt(seasonNumber)),
        ])

        setShow(showData)
        setEpisodes(seasonData.episodes || [])
      } catch (error) {
        console.error("Failed to fetch season data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, seasonNumber])

  const handleWatchEpisode = (episode: Episode) => {
    if (show && id) {
      // Add to watchlist
      watchlistService.addEpisodeToWatchlist(
        {
          id: show.id,
          name: show.name,
          poster_path: show.poster_path,
          first_air_date: show.first_air_date,
          vote_average: show.vote_average,
        },
        {
          id: episode.id,
          season_number: episode.season_number,
          episode_number: episode.episode_number,
          name: episode.name,
          air_date: episode.air_date,
        },
      )

      // Navigate to episode detail page
      navigate(`/tv/${id}/season/${seasonNumber}/episode/${episode.episode_number}`)
    }
  }

  const toggleDescription = (episodeId: number) => {
    setShowDescriptions((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId],
    }))
  }

  const formatAirDate = (dateString: string) => {
    if (!dateString) return "TBA"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
            Loading season details...
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
            Season not found
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

  const currentSeason = show.seasons?.find((s) => s.season_number === Number.parseInt(seasonNumber || "1"))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to={`/tv/${id}`}
            className="inline-flex items-center space-x-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {show.name}</span>
          </Link>
        </div>

        {/* Season Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 overflow-hidden mb-8 transition-colors duration-300">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={tmdb.getImageUrl(currentSeason?.poster_path || show.poster_path, "w500")}
                alt={`${show.name} Season ${seasonNumber}`}
                className="h-96 w-full object-cover md:h-full md:w-80"
              />
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    {show.name}
                  </h1>
                  <h2 className="text-2xl font-semibold text-pink-600 dark:text-pink-400 mt-2">
                    Season {seasonNumber}
                  </h2>
                </div>
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1" />
                  {show.vote_average.toFixed(1)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {currentSeason?.air_date ? new Date(currentSeason.air_date).getFullYear() : "TBA"}
                </div>
                <div>{episodes.length} Episodes</div>
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

              {currentSeason?.overview && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                  {currentSeason.overview}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Episodes
          </h2>

          <div className="space-y-3">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="group bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-pink-200/50 dark:border-gray-600/50 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {episode.episode_number}
                      </span>
                      <Link
                        to={`/tv/${id}/season/${seasonNumber}/episode/${episode.episode_number}`}
                        className="font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors hover:underline"
                      >
                        {episode.name}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(episode.overview || episode.air_date) && (
                        <button
                          onClick={() => toggleDescription(episode.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-1"
                          title="Show episode info"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleWatchEpisode(episode)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center space-x-2"
                        title="Watch episode"
                      >
                        <Play className="w-4 h-4" />
                        <span>Watch</span>
                      </button>
                    </div>
                  </div>

                  {showDescriptions[episode.id] && (
                    <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200/30 dark:border-gray-600/30 transition-colors duration-300">
                      {episode.air_date && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="font-medium">Aired:</span>
                          <span className="ml-1">{formatAirDate(episode.air_date)}</span>
                        </div>
                      )}
                      {episode.overview && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">
                          {episode.overview}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeasonDetail
