import React, { useState, useEffect } from 'react';
import { Search, Film, TrendingUp, Heart } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { tmdb } from '../services/tmdb';
import { Movie, TVShow } from '../types';
import { watchlistService } from '../services/watchlist';
import GlobalNavbar from './GlobalNavbar';

const HomePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<(Movie | TVShow & { media_type: 'movie' | 'tv' })[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showAllFaves, setShowAllFaves] = React.useState(false);


  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState<any[]>([]);
  const [recentlyViewedTVEpisodes, setRecentlyViewedTVEpisodes] = useState<{ [showId: number]: { show: any, episodes: any[] } }>({});

  // State
  const [favoriteShows, setFavoriteShows] = useState(() => {
    const stored = localStorage.getItem('favoriteShows');
    return stored ? JSON.parse(stored) : [];
  });

  const [favoriteMovies, setFavoriteMovies] = useState(() => {
    const stored = localStorage.getItem('favoriteMovies');
    return stored ? JSON.parse(stored) : [];
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedShows = JSON.parse(localStorage.getItem('favoriteShows') || '[]');
    const storedMovies = JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
    setFavoriteShows(storedShows);
    setFavoriteMovies(storedMovies);
  }, []);

  const toggleFavorite = (item: any) => {
    if (item.type === 'tv') {
      let updatedShows = [...favoriteShows];
      if (favoriteShows.includes(item.show.id)) {
        updatedShows = updatedShows.filter((id) => id !== item.show.id);
      } else {
        updatedShows.unshift(item.show.id);
      }
      setFavoriteShows(updatedShows);
      localStorage.setItem('favoriteShows', JSON.stringify(updatedShows));
    }

    if (item.type === 'movie') {
      let updatedMovies = [...favoriteMovies];
      if (favoriteMovies.includes(item.movie.id)) {
        updatedMovies = updatedMovies.filter((id) => id !== item.movie.id);
      } else {
        updatedMovies.unshift(item.movie.id);
      }
      setFavoriteMovies(updatedMovies);
      localStorage.setItem('favoriteMovies', JSON.stringify(updatedMovies));
    }
  };

  const isFavorited = (item: any) => {
    if (item.type === 'tv') {
      return favoriteShows.includes(item.show.id);
    }
    if (item.type === 'movie') {
      return favoriteMovies.includes(item.movie.id);
    }
    return false;
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewedMovies');
    localStorage.removeItem('recentlyViewedTVEpisodes');
    setRecentlyViewedMovies([]);
    setRecentlyViewedTVEpisodes({});
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('recentlyViewedMovies') || '[]');
    setRecentlyViewedMovies(items);
  }, [id]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('recentlyViewedTVEpisodes') || '{}');
    setRecentlyViewedTVEpisodes(data);
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [moviesData, tvData] = await Promise.all([
          tmdb.getTrendingMovies(),
          tmdb.getTrendingTV()
        ]);
        setTrendingMovies(moviesData.results?.slice(0, 12) || []);
        setTrendingTV(tvData.results?.slice(0, 12) || []);
      } catch (error) {
        console.error('Failed to fetch trending content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const showRecentlyViewed = recentlyViewedMovies.length > 0 || Object.keys(recentlyViewedTVEpisodes).length > 0;

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
                Watch Movies & TV Shows
              </span>
            </h1>
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto transition-colors duration-300 px-4">
              Discover and stream your favorite content with our beautiful, easy-to-use platform
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
                      const value = e.target.value;
                      setQuery(value);
                      if (value.trim().length > 1) {
                        try {
                          const [movieRes, tvRes] = await Promise.all([
                            tmdb.searchMovies(value),
                            tmdb.searchTV(value),
                          ]);
                          const movieResults = (movieRes.results || []).map((item) => ({
                            ...item,
                            media_type: 'movie',
                          }));
                          const tvResults = (tvRes.results || []).map((item) => ({
                            ...item,
                            media_type: 'tv',
                          }));
                          const combined = [...movieResults, ...tvResults]
                            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                            .slice(0, 6);
                          setSuggestions(combined);
                        } catch (error) {
                          console.error('Search error:', error);
                          setSuggestions([]);
                        }
                      } else {
                        setSuggestions([]);
                      }
                    }}
                    placeholder="Search for movies or TV shows..."
                    className="block w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6 text-base sm:text-lg bg-transparent border-0 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-0 focus:outline-none transition-colors duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-6"
                  >
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <span className="hidden sm:inline">Search</span>
                      <Search className="w-4 h-4 sm:hidden" />
                    </div>
                  </button>
                </div>
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 sm:max-h-64 overflow-auto">
                    {suggestions.map((item) => (
                      <li key={`${item.title || item.name}-${item.id}`}>
                        <button
                          onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                          className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-pink-50 dark:hover:bg-gray-700 rounded-xl text-gray-800 dark:text-white transition-colors text-sm sm:text-base"
                        >
                          {item.title || item.name}
                          <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            ({item.media_type === 'movie' ? 'Movie' : 'TV'})
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Favourites Section */}
      {(favoriteMovies.length > 0 || favoriteShows.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12 p-8 relative rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/30 dark:to-gray-800/10 backdrop-blur-lg transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-indigo-400/10 opacity-30 rounded-2xl"></div>
            </div>
            <div className="relative z-10">
              {/* Heading with Unlimit button */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Favorites</h2>
                {[...favoriteMovies, ...favoriteShows].length > 12 && (
                  <button
                    onClick={() => setShowAllFaves(!showAllFaves)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
                  >
                    {showAllFaves ? 'Close' : 'Show All'}
                  </button>
                )}
              </div>

              {/* Unified Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {[...favoriteMovies.map(movie => ({ type: 'movie', data: movie })), ...favoriteShows.map(show => ({ type: 'tv', data: show }))]
                  .slice(0, showAllFaves ? undefined : 12)
                  .map(({ type, data }) => {
                    const isMovie = type === 'movie';
                    const id = data.id;
                    const title = isMovie ? data.title : data.name;

                    // Calculate subtitle
                    let subtitle = '';
                    if (isMovie) {
                      subtitle = data.release_date?.split('-')[0] ?? '';
                    } else {
                      const firstYear = data.first_air_date?.split('-')[0];
                      const lastAirDate = data.last_air_date || data.last_episode_to_air?.air_date;
                      const lastYear = lastAirDate?.split('-')[0];
                      if (firstYear && lastYear) {
                        subtitle = firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`;
                      } else if (firstYear) {
                        subtitle = firstYear;
                      } else {
                        subtitle = 'TV Show';
                      }
                    }

                    const imageUrl = tmdb.getImageUrl(data.poster_path, 'w300');

                    const isFavorited = isMovie
                      ? favoriteMovies.some(fav => fav.id === id)
                      : favoriteShows.some(fav => fav.id === id);

                    const toggleFavorite = () => {
                      if (isMovie) {
                        let favs = JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
                        if (favs.some(fav => fav.id === id)) {
                          favs = favs.filter(fav => fav.id !== id);
                        } else {
                          favs.unshift(data);
                        }
                        localStorage.setItem('favoriteMovies', JSON.stringify(favs));
                        setFavoriteMovies(favs);
                      } else {
                        let favs = JSON.parse(localStorage.getItem('favoriteShows') || '[]');
                        if (favs.some(fav => fav.id === id)) {
                          favs = favs.filter(fav => fav.id !== id);
                        } else {
                          favs.unshift(data);
                        }
                        localStorage.setItem('favoriteShows', JSON.stringify(favs));
                        setFavoriteShows(favs);
                      }
                    };

                    return (
                      <Link
                        key={`${type}-${id}`}
                        to={`/${isMovie ? 'movie' : 'tv'}/${id}`}
                        className="group relative rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm block"
                      >
                        <img
                          src={imageUrl}
                          alt={title}
                          className="w-full h-full object-cover rounded-2xl group-hover:opacity-80 transition-opacity"
                        />

                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent link navigation on button click
                            toggleFavorite();
                          }}
                          aria-label="Toggle Favorite"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-pink-500 p-1 transition-opacity duration-300"
                        >
                          <Heart
                            className="w-7 h-7"
                            fill={isFavorited ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={1.5}
                          />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm">
                          <p className="font-semibold truncate">{title}</p>
                          {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      <br/>

      {/* Trending Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
              Loading trending content...
            </p>
          </div>
        ) : (
          <>
            {/* Trending Movies */}
            <div className="mb-12">
              <h2 className="flex items-center mb-8 text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                <TrendingUp className="w-8 h-8 mr-3 text-pink-500" />
                Trending Movies
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
                        src={tmdb.getImageUrl(movie.poster_path)}
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
                Trending TV Shows
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
                        src={tmdb.getImageUrl(show.poster_path)}
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

      {/* Footer social links */}
      <div className="bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border-t border-pink-200/50 dark:border-gray-700/50 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-3">
            {/* Email */}
            <a
              href="mailto:admin@lunastream.watch"
              className="bg-[#EA4335] hover:bg-[#D33B2C] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Email us"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-envelope"
                viewBox="0 0 16 16"
              >
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
              </svg>
            </a>
            
            {/* Discord */}
            <a
              href="https://discord.gg/8ubGetGGge"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Join our Discord"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-discord"
                viewBox="0 0 16 16"
              >
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
              </svg>
            </a>
            
            {/* TikTok */}
            <a
              href="https://tiktok.com/@lunastream.watch"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-900 text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Follow us on TikTok"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient id="tiktok-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF0050" />
                    <stop offset="50%" stopColor="#FF0050" />
                    <stop offset="100%" stopColor="#00F2EA" />
                  </linearGradient>
                </defs>
                <path 
                  fill="url(#tiktok-gradient)"
                  d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.204-1.864-1.204-2.338h-3.861v14.447c0 .706-.287 1.347-.751 1.81a2.57 2.57 0 0 1-1.81.751c-1.421 0-2.571-1.15-2.571-2.571 0-.706.287-1.347.751-1.81a2.57 2.57 0 0 1 1.81-.751c.283 0 .555.046.81.131V10.14a6.571 6.571 0 0 0-.81-.051c-3.632 0-6.571 2.939-6.571 6.571s2.939 6.571 6.571 6.571 6.571-2.939 6.571-6.571V9.282a9.642 9.642 0 0 0 5.645 1.806V7.227a5.86 5.86 0 0 1-2.001-.665z"
                />
              </svg>
            </a>
            
            {/* Twitter */}
            <a
              href="https://x.com/Lunastreamwatch"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Follow us on Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-twitter"
                viewBox="0 0 16 16"
              >
                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334q.002-.211-.006-.422A6.7 6.7 0 0 0 16 3.542a6.7 6.7 0 0 1-1.889.518 3.3 3.3 0 0 0 1.447-1.817 6.5 6.5 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.32 9.32 0 0 1-6.767-3.429 3.29 3.29 0 0 0 1.018 4.382A3.3 3.3 0 0 1 .64 6.575v.045a3.29 3.29 0 0 0 2.632 3.218 3.2 3.2 0 0 1-.865.115 3 3 0 0 1-.614-.057 3.28 3.28 0 0 0 3.067 2.277A6.6 6.6 0 0 1 .78 13.58a6 6 0 0 1-.78-.045A9.34 9.34 0 0 0 5.026 15" />
              </svg>
            </a>
            
            {/* Telegram */}
            <a
              href="https://t.me/lunastreaming"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0088CC] hover:bg-[#006699] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Join our Telegram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
