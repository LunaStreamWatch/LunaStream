export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
  popularity: number
}

export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  genre_ids: number[]
  origin_country: string[]
  popularity: number
}

export interface SearchResponse {
  page: number
  results: (Movie | TVShow)[]
  total_pages: number
  total_results: number
}

export interface MovieDetails extends Movie {
  runtime: number
  genres: { id: number; name: string }[]
  production_companies: { id: number; name: string }[]
}

export interface TVDetails extends TVShow {
  episode_run_time: any
  number_of_seasons: number
  number_of_episodes: number
  genres: { id: number; name: string }[]
  seasons: Season[]
}

export interface Season {
  id: number
  name: string
  overview?: string
  season_number: number
  episode_count: number
  air_date: string
  poster_path: string | null
}

export interface Episode {
  id: number
  name: string
  episode_number: number
  season_number: number
  air_date: string
  overview: string
  still_path?: string | null
  vote_average?: number
}

export interface EpisodeDetails extends Episode {
  crew: Array<{
    id: number
    name: string
    job: string
    department: string
  }>
  guest_stars: Array<{
    id: number
    name: string
    character: string
    profile_path: string | null
  }>
}
