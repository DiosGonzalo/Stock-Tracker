import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import StockForm from './components/StockForm'
import StockList from './components/StockList'
import LiveTicker from './components/LiveTicker'
import './App.css'

function App() {
  const [stocks, setStocks] = useState([])
  const [assets, setAssets] = useState([])
  const [activeView, setActiveView] = useState('portfolio')
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('EUROPE')

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
    fetchPortfolio()
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
        month: 'short',
      }),
    []
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <p className="eyebrow">Panel</p>
            <h1>Stock Tracker</h1>
          </div>
        </div>

        <nav className="nav">
          <button
            className={`nav-item ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            Lista stocks
          </button>
          <button
            className={`nav-item ${activeView === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveView('portfolio')}
          >
            Mis stocks
          </button>
          <button
            className={`nav-item ${activeView === 'live' ? 'active' : ''}`}
            onClick={() => setActiveView('live')}
          >
            Precio en vivo
          </button>
          <button className="nav-item muted" type="button" disabled>
            Alertas (pronto)
          </button>
        </nav>

        <div className="sidebar-hint">
          <p>Gestiona tus símbolos y mantén el pulso del mercado desde un solo lugar.</p>
          <span className="pill">En vivo</span>
        </div>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Actualizado {lastUpdated}</p>
            <h2>Tu hub bursátil</h2>
            <p className="muted">
              Cambia entre vistas, añade nuevos símbolos y controla tu portafolio.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="ghost-btn"
              type="button"
              onClick={fetchPortfolio}
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Refrescar datos'}
            </button>
          </div>
        </header>

        <section className="cards-grid">
          <div className="card stat-card highlight">
            <div className="stat-label">En seguimiento</div>
            <div className="stat-value">{summary.total}</div>
            <div className="stat-sub">acciones guardadas</div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Precio medio</div>
            <div className="stat-value">
              {summary.avg ? `$${summary.avg.toFixed(2)}` : '—'}
            </div>
            <div className="stat-sub">promedio de los símbolos cargados</div>
          </div>

          <div className="card form-card">
            <h2>Añadir acción</h2>
            <StockForm onStockAdded={fetchPortfolio} />
          </div>
        </section>

        <section className="card data-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">{activeView === 'list' ? 'Mercado seguido' : activeView === 'portfolio' ? 'Tu cartera' : 'En directo'}</p>
              <h3>{activeView === 'list' ? 'Lista stocks' : activeView === 'portfolio' ? 'Mis stocks' : 'Precio en vivo'}</h3>
            </div>
            <div className="header-controls">
              {activeView === 'list' && (
                <select
                  className="country-select"
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
              {activeView !== 'live' && (
                <span className="pill subtle">{(activeView === 'list' ? assets.length : stocks.length)} activos</span>
              )}
            </div>
          </div>

          {activeView === 'list' ? (
            <StockList stocks={assets} onDelete={fetchPortfolio} />
          ) : activeView === 'portfolio' ? (
            <StockList stocks={stocks} onDelete={fetchPortfolio} />
          ) : (
            <LiveTicker portfolio={stocks} />
          )}
        </section>
      </main>
    </div>
  )
}

export default App