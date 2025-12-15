import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

function LiveTicker({ portfolio }) {
  const [selected, setSelected] = useState('')
  const [price, setPrice] = useState(null)
  const [currency, setCurrency] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [chartImage, setChartImage] = useState('')
  const [loadingChart, setLoadingChart] = useState(false)

  const options = useMemo(
    () => portfolio.map((s) => ({ value: s.symbol, label: s.symbol })),
    [portfolio]
  )

  const startStream = async (symbol) => {
    try {
      setError('')
      await axios.get(`/api/webSocket/${symbol}`)
      setRunning(true)
    } catch (e) {
      setError('No se pudo iniciar el WebSocket')
    }
  }

  const fetchQuote = async (symbol) => {
    try {
      const res = await axios.get(`/api/quote/${symbol}`)
      setPrice(res.data.price)
      setCurrency(res.data.currency)
    } catch (e) {
      setError('Error obteniendo precio en vivo')
    }
  }

  const fetchChart = async (symbol) => {
    try {
      setLoadingChart(true)
      const res = await axios.get(`/api/chart/${symbol}`)
      setChartImage(res.data.image)
    } catch (e) {
      console.error('Error obteniendo gráfica')
    } finally {
      setLoadingChart(false)
    }
  }

  useEffect(() => {
    if (!selected) return
    startStream(selected)
    fetchChart(selected)
    const interval = setInterval(() => fetchQuote(selected), 2000)
    return () => clearInterval(interval)
  }, [selected])

  return (
    <div className="card live-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Precio en directo</p>
          <h3>Ticker en vivo</h3>
        </div>
      </div>

      <div className="live-controls">
        <select
          className="country-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Selecciona un símbolo</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {running && <span className="pill">Streaming</span>}
      </div>

      <div className="live-readout">
        {selected ? (
          <>
            <div className="price-display">
              <span className="symbol">{selected}</span>
              <span className="price">{price ? `$${price.toFixed(2)}` : '—'}</span>
              <span className="chip">{currency || 'USD'}</span>
            </div>
            <div className="chart-container">
              {loadingChart ? (
                <div className="empty-state">Cargando gráfica...</div>
              ) : chartImage ? (
                <img
                  src={`data:image/png;base64,${chartImage}`}
                  alt={`${selected} chart`}
                  className="stock-chart"
                />
              ) : (
                <div className="empty-state">Gráfica no disponible</div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">Elige un símbolo para comenzar</div>
        )}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  )
}

export default LiveTicker