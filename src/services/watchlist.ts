// Watchlist service for managing user's watchlist
export interface WatchlistMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  addedAt: number;
}

export interface WatchlistTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  addedAt: number;
}

export interface WatchlistEpisode {
  id: number;
  season_number: number;
  episode_number: number;
  name: string;
  air_date: string;
  watchedAt: number;
}

export interface WatchlistTVGroup {
  show: WatchlistTVShow;
  episodes: WatchlistEpisode[];
}

class WatchlistService {
  private readonly MOVIES_KEY = 'lunastream-watchlist-movies';
  private readonly TV_KEY = 'lunastream-watchlist-tv';
  private readonly RECENTLY_VIEWED_MOVIES_KEY = 'recentlyViewedMovies';
  private readonly RECENTLY_VIEWED_TV_KEY = 'recentlyViewedTVEpisodes';

  // Movies
  getWatchlistMovies(): WatchlistMovie[] {
    try {
      const stored = localStorage.getItem(this.MOVIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load watchlist movies:', error);
      return [];
    }
  }

  addMovieToWatchlist(movie: Omit<WatchlistMovie, 'addedAt'>): void {
    try {
      const movies = this.getWatchlistMovies();
      const exists = movies.some(m => m.id === movie.id);
      
      if (!exists) {
        const newMovie: WatchlistMovie = {
          ...movie,
          addedAt: Date.now()
        };
        movies.unshift(newMovie);
        localStorage.setItem(this.MOVIES_KEY, JSON.stringify(movies));
      }
    } catch (error) {
      console.error('Failed to add movie to watchlist:', error);
    }
  }

  removeMovieFromWatchlist(movieId: number): void {
    try {
      const movies = this.getWatchlistMovies();
      const filtered = movies.filter(m => m.id !== movieId);
      localStorage.setItem(this.MOVIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove movie from watchlist:', error);
    }
  }

  isMovieInWatchlist(movieId: number): boolean {
    return this.getWatchlistMovies().some(m => m.id === movieId);
  }

  // TV Shows
  getWatchlistTV(): Record<number, WatchlistTVGroup> {
    try {
      const stored = localStorage.getItem(this.TV_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load watchlist TV:', error);
      return {};
    }
  }

  addEpisodeToWatchlist(
    show: Omit<WatchlistTVShow, 'addedAt'>,
    episode: Omit<WatchlistEpisode, 'watchedAt'>
  ): void {
    try {
      const tvShows = this.getWatchlistTV();
      
      if (!tvShows[show.id]) {
        tvShows[show.id] = {
          show: { ...show, addedAt: Date.now() },
          episodes: []
        };
      }

      const episodes = tvShows[show.id].episodes;
      const exists = episodes.some(
        ep => ep.season_number === episode.season_number && 
              ep.episode_number === episode.episode_number
      );

      if (!exists) {
        const newEpisode: WatchlistEpisode = {
          ...episode,
          watchedAt: Date.now()
        };
        episodes.unshift(newEpisode);
        
        // Keep only last 10 episodes per show
        tvShows[show.id].episodes = episodes.slice(0, 10);
        localStorage.setItem(this.TV_KEY, JSON.stringify(tvShows));
      }
    } catch (error) {
      console.error('Failed to add episode to watchlist:', error);
    }
  }

  removeShowFromWatchlist(showId: number): void {
    try {
      const tvShows = this.getWatchlistTV();
      delete tvShows[showId];
      localStorage.setItem(this.TV_KEY, JSON.stringify(tvShows));
    } catch (error) {
      console.error('Failed to remove show from watchlist:', error);
    }
  }

  isShowInWatchlist(showId: number): boolean {
    return showId in this.getWatchlistTV();
  }

  // Clear all
  clearWatchlist(): void {
    try {
      localStorage.removeItem(this.MOVIES_KEY);
      localStorage.removeItem(this.TV_KEY);
    } catch (error) {
      console.error('Failed to clear watchlist:', error);
    }
  }

  // Import from recently viewed (for migration)
  importFromRecentlyViewed(): void {
    try {
      // Import movies
      const recentMovies = localStorage.getItem(this.RECENTLY_VIEWED_MOVIES_KEY);
      if (recentMovies) {
        const movies = JSON.parse(recentMovies);
        movies.forEach((movie: any) => {
          this.addMovieToWatchlist({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average || 0
          });
        });
      }

      // Import TV episodes
      const recentTV = localStorage.getItem(this.RECENTLY_VIEWED_TV_KEY);
      if (recentTV) {
        const tvData = JSON.parse(recentTV);
        Object.values(tvData).forEach((group: any) => {
          group.episodes.forEach((episode: any) => {
            this.addEpisodeToWatchlist(
              {
                id: group.show.id,
                name: group.show.name,
                poster_path: group.show.poster_path,
                first_air_date: group.show.first_air_date,
                vote_average: group.show.vote_average || 0
              },
              {
                id: episode.id,
                season_number: episode.season_number,
                episode_number: episode.episode_number,
                name: episode.name,
                air_date: episode.air_date
              }
            );
          });
        });
      }
    } catch (error) {
      console.error('Failed to import from recently viewed:', error);
    }
  }

  // Get combined watchlist for display
  getCombinedWatchlist(): Array<{
    type: 'movie' | 'tv';
    data: WatchlistMovie | WatchlistTVShow;
    lastActivity: number;
  }> {
    const movies = this.getWatchlistMovies().map(movie => ({
      type: 'movie' as const,
      data: movie,
      lastActivity: movie.addedAt
    }));

    const tvShows = Object.values(this.getWatchlistTV()).map(group => ({
      type: 'tv' as const,
      data: group.show,
      lastActivity: Math.max(group.show.addedAt, ...group.episodes.map(ep => ep.watchedAt))
    }));

    return [...movies, ...tvShows].sort((a, b) => b.lastActivity - a.lastActivity);
  }
}

export const watchlistService = new WatchlistService();
