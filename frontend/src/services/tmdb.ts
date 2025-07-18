const API_KEY = '762f9abeaf5a0a96795dee0bb3989df9';
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdb = {
  searchMovies: async (query: string) => {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    return response.json();
  },

  searchTV: async (query: string) => {
    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    return response.json();
  },

  getTrendingMovies: async () => {
    const response = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
    );
    return response.json();
  },

  getTrendingTV: async () => {
    const response = await fetch(
      `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`
    );
    return response.json();
  },

  getMovieDetails: async (id: number) => {
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}`
    );
    return response.json();
  },

  getTVDetails: async (id: number) => {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}`
    );
    return response.json();
  },

  getTVSeasons: async (id: number, seasonNumber: number) => {
    const response = await fetch(
      `${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`
    );
    return response.json();
  },

  getTVCredits: async (id: number) => {
    const response = await fetch(
      `${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`
    );
    return response.json();
  },

  getMovieCredits: async (id: number) => {
    const response = await fetch(
      `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    );
    return response.json();
  },


  getImageUrl: (path: string | null, size: string = 'w500') => {
    if (!path)
      return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
};
