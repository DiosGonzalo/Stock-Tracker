import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import StockForm from './components/StockForm'
import StockList from './components/StockList'
import LiveTicker from './components/LiveTicker'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  const [stocks, setStocks] = useState([])
  const [assets, setAssets] = useState([])
  const [activeView, setActiveView] = useState('portfolio')
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('EUROPE')
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const [authView, setAuthView] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  const countries = [
    { code: 'EUROPE', label: 'Europa' },
    { code: 'US', label: 'Estados Unidos' },
    { code: 'GB', label: 'Reino Unido' },
    { code: 'ASIA', label: 'Asia' },
    { code: 'COMMODITIES', label: 'Materias Primas' },
    { code: 'CURRENCIES', label: 'Divisas' },
    { code: 'CRYPTOCURRENCIES', label: 'Criptomonedas' },
    { code: 'RATES', label: 'Índices & Tasas' },
  ]

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/portfolio')
      setStocks(response.data)
    } catch (error) {
      console.error('Error cargando portafolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (usernameArg) => {
    const token = localStorage.getItem('token')
    // If the login callback provided a username, persist it in state
    if (usernameArg) setUsername(usernameArg)
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsAuthenticated(true)
      await fetchPortfolio()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setIsAuthenticated(false)
    setStocks([])
  }

  const fetchAssets = async (country = selectedCountry) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/countryStocks/${country}`)
      setAssets(response.data)
    } catch (error) {
      console.error('Error cargando activos:', error)
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchPortfolio()
      setIsAuthenticated(true)
    }
    const stored = localStorage.getItem('username')
    if (stored) setUsername(stored)
  }, [])

  useEffect(() => {
    if (activeView === 'list') {
      fetchAssets(selectedCountry)
    }
  }, [activeView, selectedCountry])

  const summary = useMemo(() => {
    if (!stocks.length) return { total: 0, avg: 0 }
    const total = stocks.reduce((acc, stock) => acc + (stock.price || 0), 0)
    return {
      total: stocks.length,
      avg: total / stocks.length,
    }
  }, [stocks])

  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
    []
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-square">ST</div>
          <h1>StockTracker</h1>
        </div>

        <nav className="nav">
          <p className="nav-label">Menú Principal</p>
          <button
            className={`nav-item ${activeView === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveView('portfolio')}
          >
            Mi Portafolio
          </button>
          <button
            className={`nav-item ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            Explorar Mercado
          </button>
          <button
            className={`nav-item ${activeView === 'live' ? 'active' : ''}`}
            onClick={() => setActiveView('live')}
          >
            Cotización en Vivo
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</div>
            <div className="user-info">
              <span className="user-name">{username || 'Usuario'}</span>
             
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        {!isAuthenticated ? (
          <div className="centered-card">
            {authView === 'login' ? (
              <Login onLogin={handleLogin} onNavigate={setAuthView} />
            ) : (
              <Register onLogin={handleLogin} />
            )}
          </div>
        ) : (
        <>
        <header className="page-header">
          <div>
            <h2>{activeView === 'list' ? 'Explorador de Mercado' : activeView === 'portfolio' ? 'Dashboard Financiero' : 'Cotización en Vivo'}</h2>
            <p className="muted">
              Datos actualizados al {lastUpdated}
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-secondary"
              type="button"
              onClick={fetchPortfolio}
              disabled={loading}
            >
              {loading ? 'Sincronizando...' : 'Actualizar Datos'}
            </button>
            <button className="btn-ghost" onClick={handleLogout} style={{marginLeft:8}}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="stats-row">
          <div className="card stat-card">
            <div className="stat-label">Total Activos</div>
            <div className="stat-value">{summary.total}</div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Valor Promedio</div>
            <div className="stat-value">
              {summary.avg ? `$${summary.avg.toFixed(2)}` : '—'}
            </div>
          </div>

          <div className="card form-card-compact">
            <h3>Añadir rápida</h3>
            <StockForm onStockAdded={fetchPortfolio} />
          </div>
        </section>

        <section className="card data-card">
          <div className="card-header-row">
            <div className="tabs">
               <h3>{activeView === 'list' ? 'Explorador de Mercado' : activeView === 'portfolio' ? 'Mis Inversiones' : 'Tiempo Real'}</h3>
            </div>
            
            <div className="header-controls">
              {activeView === 'list' && (
                <select
                  className="minimal-select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="table-wrapper">
            {activeView === 'list' ? (
              <StockList stocks={assets} onDelete={fetchPortfolio} />
            ) : activeView === 'portfolio' ? (
              <StockList stocks={stocks} onDelete={fetchPortfolio} />
            ) : (
              <LiveTicker portfolio={stocks} />
            )}
          </div>
        </section>
        </>
        )}
      </main>
    </div>
  )
}

export default App