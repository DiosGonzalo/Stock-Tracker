import axios from 'axios'

function StockList({ stocks, onDelete }) {
  
  const handleDelete = async (id) => {
    if(!window.confirm("¿Seguro que quieres eliminarla?")) return;
    
    try {
      await axios.delete(`/api/portfolio/${id}`)
      onDelete() // Recargamos la lista
    } catch (error) {
      console.error("Error eliminando", error)
    }
  }

  if (stocks.length === 0) {
    return <div className="empty-state">No tienes acciones en seguimiento. ¡Añade una!</div>
  }

  return (
    <div className="card">
      <h2>Mi Portafolio</h2>
      <table className="stock-table">
        <thead>
          <tr>
            <th>Símbolo</th>
            <th>Precio</th>
            <th>Moneda</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td className="symbol">{stock.symbol}</td>
              <td className="price">${stock.price?.toFixed(2)}</td>
              <td>{stock.currency}</td>
              <td>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(stock.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StockList