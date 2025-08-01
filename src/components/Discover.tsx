import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { Link } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';

import { languages, translations } from '../data/i18n'

import { useLanguage } from "./LanguageContext"

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
  overview: string;
  backdrop_path: string | null;
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  popularity: number;
  overview: string;
  backdrop_path: string | null;
}

type MediaItem = (Movie | TVShow) & { media_type?: 'movie' | 'tv' };

const ITEMS_PER_PAGE = 18;
const MAX_PAGES_TO_FETCH = 10;

const Discover: React.FC = () => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'all'>('movie');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');

  const [allResults, setAllResults] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { language, setLanguage } = useLanguage()
  const t = translations[language] || translations.en

  // State and ref for pagination input
  const [inputPage, setInputPage] = useState('1');
  const inputRef = useRef<HTMLInputElement>(null);

  const API_KEY = '762f9abeaf5a0a96795dee0bb3989df9';
  const BASE_URL = 'https://api.themoviedb.org/3';

  useEffect(() => {
    if (mediaType === 'all') {
      setGenres([]);
      setSelectedGenre('');
      return;
    }
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${BASE_URL}/genre/${mediaType}/list?api_key=${API_KEY}`);
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genres.');
      }
    };
    fetchGenres();
  }, [mediaType]);

  const fetchPageData = async (pageNum: number, type: 'movie' | 'tv', params: string) => {
    if (type === 'movie') {
      return tmdb.discoverMovies(`${params}&page=${pageNum}`);
    } else {
      return tmdb.discoverTV(`${params}&page=${pageNum}`);
    }
  };

  const fetchAllResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let adjustedSortBy = sortBy;
      if (mediaType === 'tv' && sortBy.startsWith('release_date')) {
        adjustedSortBy = sortBy.replace('release_date', 'first_air_date');
      }

      let baseParams = `sort_by=${adjustedSortBy}`;
      if (selectedGenre && mediaType !== 'all') {
        baseParams += `&with_genres=${selectedGenre}`;
      }

      let combinedResults: MediaItem[] = [];

      if (mediaType === 'movie' || mediaType === 'tv') {
        for (let p = 1; p <= MAX_PAGES_TO_FETCH; p++) {
          const data = await fetchPageData(p, mediaType, baseParams);
          if (!data || !data.results) break;

          const typedResults = data.results.map((item: any) => ({
            ...item,
            media_type: mediaType,
          }));

          combinedResults = combinedResults.concat(typedResults);

          if (p >= data.total_pages) break;
        }
      } else {
        let movieResults: MediaItem[] = [];
        let tvResults: MediaItem[] = [];

        const movieSortBy = sortBy.startsWith('release_date')
          ? sortBy.replace('first_air_date', 'release_date')
          : sortBy;

        const movieParams = `sort_by=${movieSortBy}` + (selectedGenre ? `&with_genres=${selectedGenre}` : '');
        const tvParams = baseParams;

        for (let p = 1; p <= MAX_PAGES_TO_FETCH; p++) {
          const [movieData, tvData] = await Promise.all([
            tmdb.discoverMovies(`${movieParams}&page=${p}`),
            tmdb.discoverTV(`${tvParams}&page=${p}`),
          ]);

          if (movieData && movieData.results) {
            movieResults = movieResults.concat(
              movieData.results.map((m: any) => ({ ...m, media_type: 'movie' }))
            );
          }
          if (tvData && tvData.results) {
            tvResults = tvResults.concat(
              tvData.results.map((t: any) => ({ ...t, media_type: 'tv' }))
            );
          }

          if (p >= movieData.total_pages && p >= tvData.total_pages) break;
        }

        combinedResults = movieResults.concat(tvResults);

        combinedResults.sort((a, b) => {
          let valA: any, valB: any;

          if (sortBy.startsWith('release_date')) {
            const dateA = a.media_type === 'movie' ? a.release_date : a.first_air_date;
            const dateB = b.media_type === 'movie' ? b.release_date : b.first_air_date;
            valA = dateA ? new Date(dateA).getTime() : 0;
            valB = dateB ? new Date(dateB).getTime() : 0;
          } else if (sortBy.startsWith('vote_average')) {
            valA = a.vote_average;
            valB = b.vote_average;
          } else if (sortBy.startsWith('popularity')) {
            valA = a.popularity;
            valB = b.popularity;
          } else {
            valA = a.popularity;
            valB = b.popularity;
          }

          return sortBy.endsWith('asc') ? valA - valB : valB - valA;
        });
      }

      setAllResults(combinedResults);
      setPage(1);
      setInputPage('1');

    } catch (err) {
      console.error('Error fetching discover results:', err);
      setError('Failed to load results. Please try again.');
      setAllResults([]);
    } finally {
      setLoading(false);
    }
  }, [mediaType, selectedGenre, sortBy]);

  useEffect(() => {
    fetchAllResults();
  }, [fetchAllResults]);

  const totalPages = useMemo(() => Math.ceil(allResults.length / ITEMS_PER_PAGE), [allResults]);

  const pagedResults = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return allResults.slice(start, start + ITEMS_PER_PAGE);
  }, [allResults, page]);

  // Handlers

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMediaType(e.target.value as 'movie' | 'tv' | 'all');
    setSelectedGenre('');
    setPage(1);
    setInputPage('1');
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value === '' ? '' : Number(e.target.value));
    setPage(1);
    setInputPage('1');
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(1);
    setInputPage('1');
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
      setInputPage(String(page + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
      setInputPage(String(page - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFirstPage = () => {
    setPage(1);
    setInputPage('1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLastPage = () => {
    setPage(totalPages);
    setInputPage(String(totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numbers or empty string
    if (/^\d*$/.test(val)) {
      setInputPage(val);
    }
  };

  const handlePageInputSubmit = () => {
    let num = Number(inputPage);
    if (isNaN(num) || num < 1) {
      num = 1;
    } else if (num > totalPages) {
      num = totalPages;
    }
    setPage(num);
    setInputPage(String(num));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePageInputSubmit();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
          <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t.nav_discover} {mediaType === 'all' ? t.filter_everything : mediaType === 'movie' ? t.content_movie_plural : t.content_tv_plural}
          </span>
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <select
            onChange={handleMediaTypeChange}
            value={mediaType}
            className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
          >
            <option value="movie">{t.movies}</option>
            <option value="tv">{t.tvs}</option>
                            <option value="all">{t.filter_all}</option>
          </select>

          {mediaType !== 'all' && (
            <select
              onChange={handleGenreChange}
              value={selectedGenre}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
            >
                              <option value="">{t.filter_all} {t.content_genre_plural}</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          )}

          <select
            onChange={handleSortByChange}
            value={sortBy}
            className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
          >
                            <option value="popularity.desc">{t.filter_popularity} ({t.filter_descending_short})</option>
                <option value="popularity.asc">{t.filter_popularity} ({t.filter_ascending_short})</option>
                <option value="vote_average.desc">{t.filter_popularity} ({t.filter_descending_short})</option>
                          <option value="vote_average.asc">{t.filter_rating} ({t.filter_ascending_short})</option>
              <option value="release_date.desc">{t.filter_release_date} ({t.filter_newest})</option>
              <option value="release_date.asc">{t.filter_release_date} ({t.filter_oldest})</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-700 dark:text-gray-300">{t.loading}...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : pagedResults.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400">{t.search_no_results}.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {pagedResults.map(item => {
                const isMovie = (item.media_type || mediaType) === 'movie';
                const title = isMovie ? (item as Movie).title : (item as TVShow).name;
                const date = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date;
                const posterUrl = item.poster_path ? tmdb.getImageUrl(item.poster_path) : 'https://via.placeholder.com/300x450?text=No+Image';
                return (
                  <Link
                    key={item.id}
                    to={`/${isMovie ? 'movie' : 'tv'}/${item.id}`}
                    className="group bg-white/80 dark:bg-gray-800/80 rounded-xl overflow-hidden shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-purple-400">
                        {title}
                      </h3>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{date ? new Date(date).getFullYear() : 'N/A'}</span>
                        <span>★ {item.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex justify-center items-center mt-10 gap-4 flex-wrap">
              <button
                onClick={handleFirstPage}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
                title="First Page"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || loading}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
              >
                <ArrowLeft className="inline-block mr-2" size={18} /> Prev
              </button>

              {/* Pagination Controls continued */}
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Page{' '}
                <input
                  type="text"
                  ref={inputRef}
                  value={inputPage}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputSubmit}
                  onKeyDown={handleInputKeyDown}
                  className="w-12 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white"
                />{' '}
                of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages || loading}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
              >
                Next <ArrowRight className="inline-block ml-2" size={18} />
              </button>
              <button
                onClick={handleLastPage}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
                title="Last Page"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
