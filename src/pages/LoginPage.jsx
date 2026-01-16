import { useState } from "react";
import { http } from "../api/http";
import { setTokens } from "../auth/authStore";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin123*");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await http.post("/auth/login", { username, password });
      setTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
      onLogin();
    } catch (err) {
      setError("Credenciales inválidas o API no disponible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>CardBack · Login</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Usuario
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </label>

          <label>
            Contraseña
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button disabled={loading} className="btn">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="hint">
          Tip: prueba con <b>admin / Admin123*</b> (si tus seeds están iguales).
        </p>
      </div>
    </div>
  );
}
