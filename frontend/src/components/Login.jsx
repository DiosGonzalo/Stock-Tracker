import { useState } from 'react'
import axios from 'axios'

function Login({ onLogin, onNavigate }) {
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
      const resp = await axios.post('/api/login', { username, password })
      const { access_token } = resp.data
      if (access_token) {
        localStorage.setItem('token', access_token)
        localStorage.setItem('username', username)
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        onLogin && onLogin(username)
      } else {
        setError('Respuesta inválida del servidor')
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-panel">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="stacked-form">
        <label className="input-label">Usuario</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
        <label className="input-label">Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        <div className="input-group">
          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div style={{marginTop:8}}>
          <small>¿No tienes cuenta? <button type="button" className="link-btn" onClick={() => onNavigate && onNavigate('register')}>Crear cuenta</button></small>
        </div>
      </form>
    </div>
  )
}

export default Login
