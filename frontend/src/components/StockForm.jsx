import { useState } from 'react'
import axios from 'axios'

function StockForm({ onStockAdded }) {
  const [symbol, setSymbol] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!symbol) return

    setLoading(true)
    setError('')

    try {
      await axios.post('/api/portfolio', { symbol: symbol })
      setSymbol('')
      onStockAdded()
    } catch (err) {
      setError('Error: Acción no encontrada o ya existe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stacked-form">
      <label className="input-label" htmlFor="symbol">
        Símbolo
      </label>
      <div className="input-group">
        <input
          id="symbol"
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ej: AAPL, TSLA, GOOGL"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Añadir'}
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
    </form>
  )
}

export default StockForm