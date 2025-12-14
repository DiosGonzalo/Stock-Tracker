import { useState, useEffect } from 'react'
import axios from 'axios'
import StockForm from './components/stockForm'
import StockList from './components/StockList'
import './App.css' // Importamos los estilos

function App() {
  const [stocks, setStocks] = useState([])

  // Función para cargar los datos del Backend
  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio')
      setStocks(response.data)
    } catch (error) {
      console.error("Error cargando portafolio:", error)
    }
  }

  // Cargar datos al iniciar la página
  useEffect(() => {
    fetchPortfolio()
  }, [])

  return (
    <div className="container">
      <header className="header">
        <h1>🚀 Mi Stock Tracker</h1>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <StockForm onStockAdded={fetchPortfolio} />
        </div>
        <div className="right-panel">
          <StockList stocks={stocks} onDelete={fetchPortfolio} />
        </div>
      </div>
    </div>
  )
}

export default App