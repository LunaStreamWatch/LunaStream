import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Tv, ChevronDown, X, Info } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { analytics } from '../services/analytics';
import { TVDetails, Episode } from '../types';
import ThemeToggle from './ThemeToggle';

const TVDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showDescriptions, setShowDescriptions] = useState<{ [key: number]: boolean }>({});
  const [recentlyViewedTV, setRecentlyViewedTV] = useState<any[]>([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('recentlyViewedTV') || '[]');
    setRecentlyViewedTV(items);
  }, [id]);

      

  useEffect(() => {
    const fetchShow = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const showData = await tmdb.getTVDetails(parseInt(id));
        setShow(showData);
        if (showData.seasons && showData.seasons.length > 0) {
          const firstSeason = showData.seasons.find(s => s.season_number > 0) || showData.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (error) {
        console.error('Failed to fetch TV show:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShow();
  }, [id]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id || selectedSeason === 0) return;
      
      setEpisodesLoading(true);
      try {
        const seasonData = await tmdb.getTVSeasons(parseInt(id), selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [id, selectedSeason]);

  useEffect(() => {
    if (show) {
      const existing = JSON.parse(localStorage.getItem('recentlyViewedTV') || '[]');

      // Remove duplicates by filtering out this show if already in the list
      const filtered = existing.filter((item: any) => item.id !== show.id);

      // Add current show to the start
      const updated = [{ 
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        first_air_date: show.first_air_date
      }, ...filtered];

      // Limit to 10 items max
      localStorage.setItem('recentlyViewedTV', JSON.stringify(updated.slice(0, 10)));
    }
  }, [show]);


  const handleWatchEpisode = (episode: Episode) => {
    if (show && id) {
      // Start real analytics session with poster path and episode details
      const episodeDuration = show.episode_run_time && show.episode_run_time.length > 0 
        ? show.episode_run_time[0] * 60 // Convert minutes to seconds
        : 45 * 60; // Default 45 minutes

      const newSessionId = analytics.startSession(
        'tv', 
        parseInt(id), 
        show.name,
        show.poster_path,
        episode.season_number, 
        episode.episode_number,
        episodeDuration
      );
      setSessionId(newSessionId);
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  const handleClosePlayer = () => {
    if (sessionId) {
      // End analytics session with final time
      const episodeDuration = show?.episode_run_time && show.episode_run_time.length > 0 
        ? show.episode_run_time[0] * 60 
        : 45 * 60;
      const finalTime = Math.random() * episodeDuration; // Simulate watch time
      analytics.endSession(sessionId, finalTime);
      setSessionId(null);
    }
    setIsPlaying(false);
    setCurrentEpisode(null);
  };

  // Update session periodically while playing
  useEffect(() => {
    if (isPlaying && sessionId && show) {
      const interval = setInterval(() => {
        // Simulate realistic progression through the episode
        const episodeDuration = show.episode_run_time && show.episode_run_time.length > 0 
          ? show.episode_run_time[0] * 60 
          : 45 * 60;
        const currentTime = Math.random() * episodeDuration;
        
        // Simulate user interactions
        const additionalData: any = {};
        if (Math.random() > 0.95) additionalData.pauseEvents = 1;
        if (Math.random() > 0.98) additionalData.seekEvents = 1;
        if (Math.random() > 0.99) additionalData.bufferingEvents = 1;
        if (Math.random() > 0.9) additionalData.isFullscreen = Math.random() > 0.5;
        
        analytics.updateSession(sessionId, currentTime, additionalData);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, sessionId, show]);

  const toggleDescription = (episodeId: number) => {
    setShowDescriptions(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  const formatAirDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Show not found</h2>
          <Link to="/" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors">Go back home</Link>
        </div>
      </div>
    );
  }

  if (isPlaying && currentEpisode) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Close Button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleClosePlayer}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close Player"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Video Player with Enhanced Ad Blocking */}
        <iframe
          src={`https://player.videasy.net/tv/${id}/${currentEpisode.season_number}/${currentEpisode.episode_number}?color=fbc9ff&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&noRedirect=true&adblock=true&popup=false`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={`${show.name} - S${currentEpisode.season_number}E${currentEpisode.episode_number}`}
          referrerPolicy="no-referrer"
          style={{
            colorScheme: 'normal',
            filter: 'none'
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LunaStream
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/"
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show Details */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 overflow-hidden mb-8 transition-colors duration-300">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={tmdb.getImageUrl(show.poster_path, 'w500')}
                alt={show.name}
                className="h-96 w-full object-cover md:h-full md:w-80"
              />
            </div>
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{show.name}</h1>
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1" />
                  {show.vote_average.toFixed(1)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(show.first_air_date).getFullYear()}
                </div>
                <div>
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
                </div>
                <div>
                  {show.number_of_episodes} Episodes
                </div>
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

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">{show.overview}</p>
            </div>
          </div>
        </div>

        {/* Season Selector & Episodes */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Episodes</h2>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                className="appearance-none bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                {show.seasons
                  .filter(season => season.season_number > 0)
                  .map((season) => (
                    <option key={season.id} value={season.season_number} className="bg-gray-800">
                      Season {season.season_number}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

          {/* Episodes List */}
          {episodesLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mx-auto mb-4">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading episodes...</p>
            </div>
          ) : (
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
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {episode.name}
                        </h3>
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
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">{episode.overview}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Recently Viewed Block here */}
          {recentlyViewedTV.length > 0 && (
            <div className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Recently Viewed</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recentlyViewedTV.map((item) => (
                  <Link
                    key={item.id}
                    to={`/tv/${item.id}`}
                    className="group relative rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <img
                      src={tmdb.getImageUrl(item.poster_path, 'w300')}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-sm">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-xs">{item.first_air_date?.split('-')[0]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TVDetail;