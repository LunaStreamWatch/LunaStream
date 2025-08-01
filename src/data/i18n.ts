export const languages = [
  { name: 'English', shortname: 'en', flag: '🇬🇧' },
  { name: 'Dansk', shortname: 'dk', flag: '🇩🇰' },
];

export const translations = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_search: 'Search',
    nav_discover: 'Discover',
    nav_vault: 'Vault',
    nav_donate: 'Donate',
    nav_language: 'Language',
    nav_theme: 'Theme',
    
    // Home page
    home_heading_title: 'Watch Movies & TV Shows',
    home_heading_subtitle: 'Discover and stream your favorite content with our beautiful, easy-to-use platform',
    home_now_playing: 'Now Playing',
    home_coming_soon: 'Coming Soon',
    home_trending_loading: 'Loading trending content...',
    home_trending_fetch_error: 'Failed to fetch trending content:',
    
    // Search
    search_fail_error: 'Search fail:',
    search_results_for: 'Search Results for',
    search_no_results: 'No results found',
    search_no_results_for: 'No results found for',
    search_stay_safe_warning: 'Based on your search term, you might find disturbing content. Please stay safe.',
    search_stay_safe_continue: 'Continue anyway',
    search_placeholder: 'Search movies and TV shows...',
    
    // Content types
    content_movie_singular: 'Movie',
    content_movie_plural: 'Movies',
    content_tv_singular: 'TV Show',
    content_tv_plural: 'TV Shows',
    content_trending: 'Trending',
    content_genre_singular: 'Genre',
    content_genre_plural: 'Genres',
    content_no_image: 'No Image',
    content_n_a: 'N/A',
    
    // Filtering and sorting
    filter_show_results: 'Showing',
    filter_of: 'of',
    filter_result_singular: 'result',
    filter_result_plural: 'results',
    filter_popularity: 'Popularity',
    filter_relevance: 'Relevance',
    filter_everything: 'Everything',
    filter_all: 'All',
    filter_descending_short: 'Desc',
    filter_ascending_short: 'Asc',
    filter_rating: 'Rating',
    filter_release_date: 'Release Date',
    filter_newest: 'Newest',
    filter_oldest: 'Oldest',
    filter_loading: 'Loading',
    
    // Navigation buttons
    nav_previous: 'Previous',
    nav_next: 'Next',
    
    // Vault
    vault_tagline: 'Your personal collection of movies, shows, and favorites',
    vault_search_placeholder: 'Search your vault...',
    vault_watchlist: 'Watchlist',
    vault_favorites: 'Favourites',
    vault_statistics: 'Statistics',
    vault_my_content: 'My',
    vault_my_tv: 'My',
    vault_my_playlist: 'My',
    vault_recently_watched: 'Recently Watched',
    vault_clear_all_watchlist: 'Clear All',
    vault_clear_all_favorites: 'Clear All',
    vault_browse_content: 'Browse Content',
    vault_favorite: 'Favourite',
    vault_statistics_title: 'Your Vault Statistics',
    vault_total: 'Total',
    vault_watched: 'Watched',
    vault_content_breakdown: 'Content Breakdown',
    vault_breakdown: ' Breakdown',
    vault_keep_building_title: 'Keep Building Your Vault!',
    vault_keep_building_subtitle: 'Discover new content and continue growing your personal collection.',
    vault_browse_trending: 'Browse Trending',
    vault_search_content: 'Search Content',
    vault_search_your_vault: 'Search your vault',
    
    // Common actions
    action_play: 'Play',
    action_watch: 'Watch',
    action_add_to_watchlist: 'Add to Watchlist',
    action_remove_from_watchlist: 'Remove from Watchlist',
    action_add_to_favorites: 'Add to Favorites',
    action_remove_from_favorites: 'Remove from Favorites',
    action_clear: 'Clear',
    action_delete: 'Delete',
    action_edit: 'Edit',
    action_save: 'Save',
    action_cancel: 'Cancel',
    action_confirm: 'Confirm',
    action_continue: 'Continue',
    
    // Time and dates
    time_just_now: 'Just now',
    time_minutes_ago: '{count} minutes ago',
    time_hours_ago: '{count} hours ago',
    time_days_ago: '{count} days ago',
    time_weeks_ago: '{count} weeks ago',
    time_months_ago: '{count} months ago',
    time_years_ago: '{count} years ago',
    
    // Status messages
    status_loading: 'Loading...',
    status_error: 'Error',
    status_success: 'Success',
    status_no_data: 'No data available',
    status_empty: 'Empty',
    status_offline: 'You are offline',
    status_online: 'You are back online',
    
    // Confirmation dialogs
    confirm_clear_watchlist: 'Are you sure you want to clear your entire watchlist?',
    confirm_clear_favorites: 'Are you sure you want to clear all favorites?',
    confirm_delete_item: 'Are you sure you want to delete this item?',
    
    // Accessibility
    accessibility_menu_button: 'Menu',
    accessibility_close_button: 'Close',
    accessibility_search_button: 'Search',
    accessibility_language_selector: 'Language selector',
    accessibility_theme_toggle: 'Toggle theme',
    accessibility_play_button: 'Play',
    accessibility_pause_button: 'Pause',
    accessibility_volume_control: 'Volume control',
    
    // Admin Login
    admin_login_title: 'LunaStream Admin',
    admin_login_subtitle: 'Access the analytics dashboard',
    admin_login_username_label: 'Username',
    admin_login_username_placeholder: 'Enter username',
    admin_login_password_label: 'Password',
    admin_login_password_placeholder: 'Enter password',
    admin_login_signing_in: 'Signing in...',
    admin_login_sign_in: 'Sign In',
    admin_login_secure_access: 'Secure Access',
    admin_login_security_notice: 'This admin panel provides access to real-time analytics and user data. Please ensure you have proper authorization.',
    admin_login_invalid_credentials: 'Invalid username or password',
    admin_login_network_error: 'Network error. Please try again.',
    
    // Admin Panel
    admin_panel_dashboard_title: 'Admin Dashboard',
    admin_panel_live_data: 'Live Data',
    admin_panel_refresh: 'Refresh',
    admin_panel_logout: 'Logout',
    admin_panel_analytics_title: 'Real-Time Analytics Dashboard',
    admin_panel_analytics_subtitle: 'Live streaming analytics and comprehensive user insights',
    admin_panel_last_updated: 'Last updated',
    admin_panel_auto_refresh: 'Auto-refresh every 15s',
    admin_panel_tab_overview: 'Overview',
    admin_panel_tab_content: 'Content',
    admin_panel_tab_users: 'Users',
    admin_panel_total_views: 'Total Views',
    admin_panel_live_viewers: 'Live Viewers',
    admin_panel_watch_time: 'Watch Time',
    admin_panel_completion_rate: 'Completion Rate',
    admin_panel_live_viewers_title: 'Live Viewers',
    admin_panel_no_one_watching: 'No one is currently watching',
    admin_panel_activity_trends: '7-Day Activity Trends',
    admin_panel_views: 'views',
    admin_panel_viewers: 'viewers',
    admin_panel_most_watched: 'Most Watched',
    admin_panel_longest_sessions: 'Longest Sessions',
    admin_panel_best_completion: 'Best Completion',
    admin_panel_most_rewatched: 'Most Rewatched',
    admin_panel_top_movies: 'Top Movies',
    admin_panel_no_movie_data: 'No movie data available',
    admin_panel_top_tv_shows: 'Top TV Shows',
    admin_panel_no_tv_data: 'No TV show data available',
    admin_panel_user_engagement: 'User Engagement',
    admin_panel_avg_sessions_user: 'Avg Sessions/User',
    admin_panel_avg_time_user: 'Avg Time/User',
    admin_panel_return_rate: 'Return Rate',
    admin_panel_device_distribution: 'Device Distribution',
    admin_panel_session_duration: 'Session Duration',
    admin_panel_browser_distribution: 'Browser Distribution',
    admin_panel_operating_system: 'Operating System',
  },
  
  dk: {
    // Navigation
    nav_home: 'Hjem',
    nav_search: 'Søg',
    nav_discover: 'Udforsk',
    nav_vault: 'Arkiv',
    nav_donate: 'Doner',
    nav_language: 'Sprog',
    nav_theme: 'Tema',
    
    // Home page
    home_heading_title: 'Se film og TV-serier',
    home_heading_subtitle: 'Udforsk og stream dit yndlingsindhold med vores smukke og brugervenlige platform',
    home_now_playing: 'Vises nu',
    home_coming_soon: 'Kommer snart',
    home_trending_loading: 'Indlæser populært indhold...',
    home_trending_fetch_error: 'Hentning af populært indhold mislykkedes:',
    
    // Search
    search_fail_error: 'Søgefejl:',
    search_results_for: 'Søgeresultater for',
    search_no_results: 'Ingen resultater fundet',
    search_no_results_for: 'Ingen resultater fundet for',
    search_stay_safe_warning: 'Baseret på din søgning kan du støde på foruroligende indhold. Pas venligst på dig selv.',
    search_stay_safe_continue: 'Fortsæt alligevel',
    search_placeholder: 'Søg efter film og TV-serier...',
    
    // Content types
    content_movie_singular: 'Film',
    content_movie_plural: 'Film',
    content_tv_singular: 'TV-serie',
    content_tv_plural: 'TV-serier',
    content_trending: 'Populære',
    content_genre_singular: 'Genre',
    content_genre_plural: 'Genrer',
    content_no_image: 'Intet billede',
    content_n_a: '–',
    
    // Filtering and sorting
    filter_show_results: 'Viser',
    filter_of: 'af',
    filter_result_singular: 'resultat',
    filter_result_plural: 'resultater',
    filter_popularity: 'Popularitet',
    filter_relevance: 'Relevans',
    filter_everything: 'Alt',
    filter_all: 'Alle',
    filter_descending_short: 'Fald',
    filter_ascending_short: 'Stig',
    filter_rating: 'Bedømmelse',
    filter_release_date: 'Udgivelsesdato',
    filter_newest: 'Nyeste',
    filter_oldest: 'Ældste',
    filter_loading: 'Indlæser',
    
    // Navigation buttons
    nav_previous: 'Forrige',
    nav_next: 'Næste',
    
    // Vault
    vault_tagline: 'Din personlige samling af film, serier og favoritter',
    vault_search_placeholder: 'Søg i dit arkiv...',
    vault_watchlist: 'Watchlist',
    vault_favorites: 'Favoritter',
    vault_statistics: 'Statistik',
    vault_my_content: 'Min',
    vault_my_tv: 'Min',
    vault_my_playlist: 'Mine',
    vault_recently_watched: 'For nylig set',
    vault_clear_all_watchlist: 'Ryd alt',
    vault_clear_all_favorites: 'Ryd alle',
    vault_browse_content: 'Gennemse indhold',
    vault_favorite: 'Favorit',
    vault_statistics_title: 'Dine arkiv-statistikker',
    vault_total: 'Total',
    vault_watched: 'Set',
    vault_content_breakdown: 'Indholdsoversigt',
    vault_breakdown: ' oversigt',
    vault_keep_building_title: 'Fortsæt med at opbygge dit arkiv!',
    vault_keep_building_subtitle: 'Udforsk nyt indhold og fortsæt med at udvide din personlige samling.',
    vault_browse_trending: 'Udforsk det populære',
    vault_search_content: 'Søg indhold',
    vault_search_your_vault: 'Søg dit arkiv',
    
    // Common actions
    action_play: 'Afspil',
    action_watch: 'Se',
    action_add_to_watchlist: 'Tilføj til watchlist',
    action_remove_from_watchlist: 'Fjern fra watchlist',
    action_add_to_favorites: 'Tilføj til favoritter',
    action_remove_from_favorites: 'Fjern fra favoritter',
    action_clear: 'Ryd',
    action_delete: 'Slet',
    action_edit: 'Rediger',
    action_save: 'Gem',
    action_cancel: 'Annuller',
    action_confirm: 'Bekræft',
    action_continue: 'Fortsæt',
    
    // Time and dates
    time_just_now: 'Lige nu',
    time_minutes_ago: 'for {count} minutter',
    time_hours_ago: 'for {count} timer',
    time_days_ago: 'for {count} dage',
    time_weeks_ago: 'for {count} uger',
    time_months_ago: 'for {count} måneder',
    time_years_ago: 'for {count} år',
    
    // Status messages
    status_loading: 'Indlæser...',
    status_error: 'Fejl',
    status_success: 'Succes',
    status_no_data: 'Ingen data tilgængelig',
    status_empty: 'Tom',
    status_offline: 'Du er offline',
    status_online: 'Du er tilbage online',
    
    // Confirmation dialogs
    confirm_clear_watchlist: 'Er du sikker på, at du vil rydde hele din watchlist?',
    confirm_clear_favorites: 'Er du sikker på, at du vil rydde alle favoritter?',
    confirm_delete_item: 'Er du sikker på, at du vil slette dette element?',
    
    // Accessibility
    accessibility_menu_button: 'Menu',
    accessibility_close_button: 'Luk',
    accessibility_search_button: 'Søg',
    accessibility_language_selector: 'Sprogvælger',
    accessibility_theme_toggle: 'Skift tema',
    accessibility_play_button: 'Afspil',
    accessibility_pause_button: 'Pause',
    accessibility_volume_control: 'Lydstyrke',
    
    // Admin Login
    admin_login_title: 'LunaStream Admin',
    admin_login_subtitle: 'Få adgang til analyse-dashboardet',
    admin_login_username_label: 'Brugernavn',
    admin_login_username_placeholder: 'Indtast brugernavn',
    admin_login_password_label: 'Adgangskode',
    admin_login_password_placeholder: 'Indtast adgangskode',
    admin_login_signing_in: 'Logger ind...',
    admin_login_sign_in: 'Log ind',
    admin_login_secure_access: 'Sikker adgang',
    admin_login_security_notice: 'Dette adminpanel giver adgang til realtidsanalyse og brugerdata. Sørg for, at du har den rette tilladelse.',
    admin_login_invalid_credentials: 'Ugyldigt brugernavn eller adgangskode',
    admin_login_network_error: 'Netværksfejl. Prøv igen.',
    
    // Admin Panel
    admin_panel_dashboard_title: 'Admin Dashboard',
    admin_panel_live_data: 'Live-data',
    admin_panel_refresh: 'Opdater',
    admin_panel_logout: 'Log ud',
    admin_panel_analytics_title: 'Realtidsanalyse-dashboard',
    admin_panel_analytics_subtitle: 'Live streaming-analyse og brugeroverblik',
    admin_panel_last_updated: 'Sidst opdateret',
    admin_panel_auto_refresh: 'Auto-opdatering hvert 15. sekund',
    admin_panel_tab_overview: 'Overblik',
    admin_panel_tab_content: 'Indhold',
    admin_panel_tab_users: 'Brugere',
    admin_panel_total_views: 'Samlede visninger',
    admin_panel_live_viewers: 'Live-seere',
    admin_panel_watch_time: 'Seertid',
    admin_panel_completion_rate: 'Gennemførselsrate',
    admin_panel_live_viewers_title: 'Live-seere',
    admin_panel_no_one_watching: 'Ingen ser med lige nu',
    admin_panel_activity_trends: '7-dages aktivitetstendenser',
    admin_panel_views: 'visninger',
    admin_panel_viewers: 'seere',
    admin_panel_most_watched: 'Mest sete',
    admin_panel_longest_sessions: 'Længste sessioner',
    admin_panel_best_completion: 'Bedste gennemførelse',
    admin_panel_most_rewatched: 'Mest genset',
    admin_panel_top_movies: 'Topfilm',
    admin_panel_no_movie_data: 'Ingen filmdata tilgængelig',
    admin_panel_top_tv_shows: 'Top TV-serier',
    admin_panel_no_tv_data: 'Ingen TV-seriedata tilgængelig',
    admin_panel_user_engagement: 'Brugerengagement',
    admin_panel_avg_sessions_user: 'Gns. sessioner/bruger',
    admin_panel_avg_time_user: 'Gns. tid/bruger',
    admin_panel_return_rate: 'Tilbagevendingsrate',
    admin_panel_device_distribution: 'Enhedsfordeling',
    admin_panel_session_duration: 'Sessionsvarighed',
    admin_panel_browser_distribution: 'Browserfordeling',
    admin_panel_operating_system: 'Styresystem',
  },
};

// Helper function for interpolation (futureproof for different word orders)
export const interpolate = (template: string, values: Record<string, string | number>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
};

// Helper function to get pluralized text
export const getPluralized = (
  translations: Record<string, string>,
  key: string,
  count: number,
  language: string
): string => {
  const singularKey = `${key}_singular`;
  const pluralKey = `${key}_plural`;
  
  if (language === 'dk') {
    // Danish pluralization rules
    if (count === 1) {
      return translations[singularKey] || translations[key] || key;
    } else {
      return translations[pluralKey] || translations[key] || key;
    }
  } else {
    // English pluralization rules
    if (count === 1) {
      return translations[singularKey] || translations[key] || key;
    } else {
      return translations[pluralKey] || translations[key] || key;
    }
  }
};

// Helper function to get time-ago text with proper interpolation
export const getTimeAgo = (
  translations: Record<string, string>,
  minutes: number,
  language: string
): string => {
  if (minutes < 1) {
    return translations.time_just_now;
  } else if (minutes < 60) {
    return interpolate(translations.time_minutes_ago, { count: minutes });
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return interpolate(translations.time_hours_ago, { count: hours });
  } else if (minutes < 10080) {
    const days = Math.floor(minutes / 1440);
    return interpolate(translations.time_days_ago, { count: days });
  } else if (minutes < 43200) {
    const weeks = Math.floor(minutes / 10080);
    return interpolate(translations.time_weeks_ago, { count: weeks });
  } else if (minutes < 525600) {
    const months = Math.floor(minutes / 43200);
    return interpolate(translations.time_months_ago, { count: months });
  } else {
    const years = Math.floor(minutes / 525600);
    return interpolate(translations.time_years_ago, { count: years });
  }
};
