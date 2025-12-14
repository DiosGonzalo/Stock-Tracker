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
      // Llamamos a TU backend
      await axios.post('/api/portfolio', { symbol: symbol })
      setSymbol('') // Limpiamos el input
      onStockAdded() // Avisamos al padre para que recargue la lista
    } catch (err) {
      setError('Error: Acción no encontrada o ya existe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card form-card">
      <h2>Añadir Acción</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
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
    </div>
  )
}

export default StockForm