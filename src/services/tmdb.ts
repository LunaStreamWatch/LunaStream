const API_KEY = "762f9abeaf5a0a96795dee0bb3989df9"
const BASE_URL = "https://api.themoviedb.org/3"

export const tmdb = {
  searchMovies: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    return response.json()
  },

  searchTV: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    return response.json()
  },

  // New function to search for episodes across all shows
  searchEpisodes: async (query: string) => {
    // TMDB doesn't have a direct episode search, so we'll search TV shows
    // and then search within their episodes
    const tvResponse = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    const tvData = await tvResponse.json()

    const episodeResults = []

    // For each show, search through seasons to find matching episodes
    for (const show of (tvData.results || []).slice(0, 5)) {
      // Limit to first 5 shows for performance
      try {
        for (let seasonNum = 1; seasonNum <= Math.min(show.number_of_seasons || 1, 3); seasonNum++) {
          const seasonResponse = await fetch(`${BASE_URL}/tv/${show.id}/season/${seasonNum}?api_key=${API_KEY}`)
          const seasonData = await seasonResponse.json()

          if (seasonData.episodes) {
            const matchingEpisodes = seasonData.episodes.filter(
              (episode: any) =>
                episode.name.toLowerCase().includes(query.toLowerCase()) ||
                episode.overview?.toLowerCase().includes(query.toLowerCase()),
            )

            matchingEpisodes.forEach((episode: any) => {
              episodeResults.push({
                ...episode,
                show_id: show.id,
                show_name: show.name,
                show_poster_path: show.poster_path,
                media_type: "episode",
              })
            })
          }
        }
      } catch (error) {
        console.error(`Error searching episodes for show ${show.id}:`, error)
      }
    }

    return { results: episodeResults }
  },

  getTrendingMovies: async () => {
    const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`)
    return response.json()
  },

  getTrendingTV: async () => {
    const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`)
    return response.json()
  },

  getMovieDetails: async (id: number) => {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`)
    return response.json()
  },

  getTVDetails: async (id: number) => {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`)
    return response.json()
  },

  getTVSeasons: async (id: number, seasonNumber: number) => {
    const response = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`)
    return response.json()
  },

  // New function to get specific episode details
  getEpisodeDetails: async (tvId: number, seasonNumber: number, episodeNumber: number) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${API_KEY}`,
    )
    return response.json()
  },

  getTVCredits: async (id: number) => {
    const response = await fetch(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`)
    return response.json()
  },

  getMovieCredits: async (id: number) => {
    const response = await fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`)
    return response.json()
  },

  getImageUrl: (path: string | null, size = "w500") => {
    if (!path)
      return "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop"
    return `https://image.tmdb.org/t/p/${size}${path}`
  },
}
