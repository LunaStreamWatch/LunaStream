"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./components/HomePage"
import SearchResults from "./components/SearchResults"
import MovieDetail from "./components/MovieDetail"
import TVDetail from "./components/TVDetail"
import SeasonDetail from "./components/SeasonDetail"
import EpisodeDetail from "./components/EpisodeDetail"
import LastUpdated from "./components/LastUpdated"
import DonatePage from "./components/DonatePage"
import VersionPage from "./components/VersionPage"
import AdminLogin from "./components/AdminLogin"
import AdminPanel from "./components/AdminPanel"
import NotFoundPage from "./components/NotFoundPage"
import ScrollToTopButton from "./components/ScrollToTop"
import Watchlist from "./components/Watchlist"
import Vault from "./components/Vault"

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  useEffect(() => {
    // Check if admin is already authenticated
    const checkAuth = async () => {
      const isLocalAuth = localStorage.getItem("lunastream-admin-auth") === "true"
      if (isLocalAuth) {
        // Verify with server
        const { authService } = await import("./services/auth")
        const verification = await authService.verifyToken()
        setIsAdminAuthenticated(verification.success)
        if (!verification.success) {
          // Clear invalid auth
          localStorage.removeItem("lunastream-admin-auth")
        }
      } else {
        setIsAdminAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true)
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
  }

  return (
    <Router>
      {/*<CustomCursor />*/}
      <ScrollToTopButton />
      {/* Define routes for the application */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<TVDetail />} />
        <Route path="/tv/:id/season/:seasonNumber" element={<SeasonDetail />} />
        <Route path="/tv/:id/season/:seasonNumber/episode/:episodeNumber" element={<EpisodeDetail />} />
        <Route path="/v" element={<VersionPage />} />
        <Route path="/last-updated" element={<LastUpdated />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route
          path="/admin"
          element={
            isAdminAuthenticated ? (
              <AdminPanel onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />
        <Route path="/vault" element={<Vault />} />
        <Route path="/watchlist" element={<Watchlist />} /> {/* Redirects to /vault */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
