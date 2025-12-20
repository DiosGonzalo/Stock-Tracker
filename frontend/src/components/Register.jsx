import { useState } from 'react'
import axios from 'axios'

function Register({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username || !password) return setError('Rellena usuario y contraseña')

    setLoading(true)
    try {
      await axios.post('/api/register', { username, password })
      const resp = await axios.post('/api/login', { username, password })
      const { access_token } = resp.data
      if (access_token) {
        localStorage.setItem('token', access_token)
        localStorage.setItem('username', username)
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        onLogin && onLogin(username)
      } else {
        setError('Registro correcto pero no se pudo iniciar sesión automáticamente')
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Error registrando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-panel">
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit} className="stacked-form">
        <label className="input-label">Usuario</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
        <label className="input-label">Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        <div className="input-group">
          <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </div>
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  )
}

export default Register
