import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { Link } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';
import { useLanguage } from './LanguageContext';
import { translations } from '../data/i18n';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

const ITEMS_PER_PAGE = 18; // number of items to show per page (adjust as needed)
const MAX_PAGES_TO_FETCH = 30; // max pages to fetch from each source (to limit requests)

const ComingSoon: React.FC = () => {
  const [allResults, setAllResults] = useState<MediaItem[]>([]); // store all results fetched
  const [filteredResults, setFilteredResults] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputPage, setInputPage] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  // Fetch all pages of movies and TV shows on mount
  useEffect(() => {
    const fetchAllPages = async () => {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      try {
        // Helper to fetch all pages for movies or TV shows
        const fetchAll = async (
          fetchFn: (query: string) => Promise<any>,
          dateParam: string,
          mediaType: 'movie' | 'tv'
        ): Promise<MediaItem[]> => {
          let allItems: MediaItem[] = [];
          for (let p = 1; p <= MAX_PAGES_TO_FETCH; p++) {
            const data = await fetchFn(`${dateParam}&page=${p}`);
            if (!data.results || data.results.length === 0) break;

            const items = data.results
              .filter((item: any) => 
                (mediaType === 'movie' ? item.release_date >= today : item.first_air_date >= today)
              )
              .map((item: any) => ({ ...item, media_type: mediaType }));

            allItems = allItems.concat(items);

            if (p >= data.total_pages) break;
          }
          return allItems;
        };

        const movies = await fetchAll(
          tmdb.discoverMovies,
          `sort_by=release_date.asc&release_date.gte=${today}`,
          'movie'
        );
        const tvShows = await fetchAll(
          tmdb.discoverTV,
          `sort_by=first_air_date.asc&first_air_date.gte=${today}`,
          'tv'
        );

        // Combine and sort by date ascending
        const combined = [...movies, ...tvShows].sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '').getTime();
          return dateA - dateB;
        });

        setAllResults(combined);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching coming soon:', err);
        setError(t.status_failed_to_load);
        setLoading(false);
      }
    };

    fetchAllPages();
  }, []);

  // Filter results when searchQuery or allResults change
  useEffect(() => {
    const filtered = allResults.filter(item => {
      const title = item.title || item.name || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredResults(filtered);
    setPage(1);
    setInputPage('1');
  }, [searchQuery, allResults]);

  // Calculate total pages based on filtered results and items per page
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / ITEMS_PER_PAGE));

  // Debounced page update on inputPage change
  useEffect(() => {
    if (inputPage === '') return;

    const newPage = Number(inputPage);
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      const timer = setTimeout(() => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [inputPage, totalPages, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      setInputPage(String(page + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      setInputPage(String(page - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFirstPage = () => {
    if (page !== 1) {
      setPage(1);
      setInputPage('1');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLastPage = () => {
    if (page !== totalPages) {
      setPage(totalPages);
      setInputPage(String(totalPages));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputPage(val);
    }
  };

  const handlePageInputSubmit = () => {
    const newPage = Number(inputPage);
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setInputPage(String(page));
      if (inputRef.current) inputRef.current.blur();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  // Slice filtered results for current page
  const paginatedResults = filteredResults.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
          <span className="bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Coming Soon
          </span>
        </h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search by title or name..."
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-700 dark:text-gray-300">{t.status_loading}</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : paginatedResults.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">{t.status_no_upcoming_content}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {paginatedResults.map(item => {
                const isMovie = item.media_type === 'movie';
                const title = isMovie ? item.title : item.name;
                const date = isMovie ? item.release_date : item.first_air_date;

                return (
                  <Link
                    key={`${item.media_type}-${item.id}`}
                    to={`/${isMovie ? 'movie' : 'tv'}/${item.id}`}
                    className="group bg-white/80 dark:bg-gray-800/80 rounded-xl overflow-hidden shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(item.poster_path)}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-purple-400">
                        {title}
                      </h3>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{date ? new Date(date).toLocaleDateString() : t.content_tba}</span>
                        <span>★ {item.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-10 gap-4 flex-wrap">
              <button
                onClick={handleFirstPage}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
                title={t.nav_first_page}
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || loading}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
              >
                <ArrowLeft className="inline-block mr-2" size={18} /> {t.coming_soon_prev}
              </button>

              <span className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {t.nav_page}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  className="w-16 text-center rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={inputPage}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputSubmit}
                  onKeyDown={handleInputKeyDown}
                  disabled={loading}
                  ref={inputRef}
                />
                {t.nav_of} {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages || loading}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
              >
                {t.coming_soon_next} <ArrowRight className="inline-block ml-2" size={18} />
              </button>
              <button
                onClick={handleLastPage}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40"
                title={t.nav_last_page}
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

export default ComingSoon;
