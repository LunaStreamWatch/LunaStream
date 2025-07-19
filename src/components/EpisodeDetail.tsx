"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Play, Star, Calendar, Clock, X } from "lucide-react"
import { tmdb } from "../services/tmdb"
import { analytics } from "../services/analytics"
import type { TVDetails, Episode } from "../types"
import { watchlistService } from "../services/watchlist"
import GlobalNavbar from "./GlobalNavbar"

const EpisodeDetail: React.FC = () => {
  const { id, seasonNumber, episodeNumber } = useParams<{
    id: string
    seasonNumber: string
    episodeNumber: string
  }>()
  const [show, setShow] = useState<TVDetails | null>(null)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !seasonNumber || !episodeNumber) return

      setLoading(true)
      try {
        const [showData, seasonData] = await Promise.all([
          tmdb.getTVDetails(Number.parseInt(id)),
          tmdb.getTVSeasons(Number.parseInt(id), Number.parseInt(seasonNumber)),
        ])

        setShow(showData)

        const episodeData = seasonData.episodes?.find(
          (ep: Episode) => ep.episode_number === Number.parseInt(episodeNumber),
        )
        setEpisode(episodeData || null)
      } catch (error) {
        console.error("Failed to fetch episode data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, seasonNumber, episodeNumber])

  const handleWatchEpisode = () => {
    if (show && episode && id) {
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

      // Start analytics session
      const episodeDuration =
        show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] * 60 : 45 * 60

      const newSessionId = analytics.startSession(
        "tv",
        Number.parseInt(id),
        show.name,
        show.poster_path,
        episode.season_number,
        episode.episode_number,
        episodeDuration,
      )
      setSessionId(newSessionId)
      setIsPlaying(true)
    }
  }

  const handleClosePlayer = () => {
    if (sessionId) {
      const episodeDuration =
        show?.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] * 60 : 45 * 60
      const finalTime = Math.random() * episodeDuration
      analytics.endSession(sessionId, finalTime)
      setSessionId(null)
    }
    setIsPlaying(false)
  }

  // Update session periodically while playing
  useEffect(() => {
    if (isPlaying && sessionId && show) {
      const interval = setInterval(() => {
        const episodeDuration =
          show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] * 60 : 45 * 60
        const currentTime = Math.random() * episodeDuration

        const additionalData: any = {}
        if (Math.random() > 0.95) additionalData.pauseEvents = 1
        if (Math.random() > 0.98) additionalData.seekEvents = 1
        if (Math.random() > 0.99) additionalData.bufferingEvents = 1
        if (Math.random() > 0.9) additionalData.isFullscreen = Math.random() > 0.5

        analytics.updateSession(sessionId, currentTime, additionalData)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, sessionId, show])

  const formatAirDate = (dateString: string) => {
    if (!dateString) return "TBA"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Play className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
            Loading episode details...
          </p>
        </div>
      </div>
    )
  }

  if (!show || !episode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Episode not found
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

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleClosePlayer}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close Player"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <iframe
          src={`https://player.videasy.net/tv/${id}/${episode.season_number}/${episode.episode_number}?color=fbc9ff&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&noRedirect=true&adblock=true&popup=false&mobile=true`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={`${show.name} - S${episode.season_number}E${episode.episode_number}`}
          referrerPolicy="no-referrer"
          style={{ colorScheme: "normal" }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6 flex items-center space-x-4">
          <Link
            to={`/tv/${id}/season/${seasonNumber}`}
            className="inline-flex items-center space-x-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Season {seasonNumber}</span>
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            to={`/tv/${id}`}
            className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            {show.name}
          </Link>
        </div>

        {/* Episode Details */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={tmdb.getImageUrl(episode.still_path || show.poster_path, "w500")}
                alt={episode.name}
                className="h-96 w-full object-cover md:h-full md:w-80"
              />
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      S{episode.season_number}E{episode.episode_number}
                    </span>
                    <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 mr-1" />
                      {episode.vote_average?.toFixed(1) || "N/A"}
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    {episode.name}
                  </h1>
                  <h2 className="text-xl text-gray-600 dark:text-gray-400 mt-1">{show.name}</h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                {episode.air_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatAirDate(episode.air_date)}
                  </div>
                )}
                {show.episode_run_time && show.episode_run_time.length > 0 && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {show.episode_run_time[0]} minutes
                  </div>
                )}
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

              {episode.overview && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">
                  {episode.overview}
                </p>
              )}

              <button
                onClick={handleWatchEpisode}
                className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-600"
              >
                <Play className="w-5 h-5" />
                <span>Watch Episode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EpisodeDetail
