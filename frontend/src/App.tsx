import { useState, useEffect, useCallback } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Navbar } from "./components/layout/Navbar"
import "./App.css"

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

function App() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("auth_user")

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    }
    setChecking(false)
  }, [])

  useEffect(() => {
    if (!checking) {
      if (!token || !user) {
        navigate("/login", { replace: true })
      }
    }
  }, [checking, token, user, navigate])

  const handleLogin = useCallback((newToken: string, newUser: AuthUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem("auth_token", newToken)
    localStorage.setItem("auth_user", JSON.stringify(newUser))
    navigate("/", { replace: true })
  }, [navigate])

  const handleLogout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    navigate("/login", { replace: true })
  }, [navigate])

  if (checking) {
    return null
  }

  if (!token || !user) {
    return <Outlet context={{ onLogin: handleLogin }} />
  }

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="app-main">
        <section className="app-view">
          <Outlet context={{ user, token, onLogout: handleLogout }} />
        </section>
      </main>
    </div>
  )
}

export default App