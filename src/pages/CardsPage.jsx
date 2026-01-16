import { useEffect, useState } from "react";
import { http } from "../api/http";
import { clearTokens } from "../auth/authStore";

export default function CardsPage({ onLogout, onGoTransactions }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [brand, setBrand] = useState("Visa");
  const [last4, setLast4] = useState("1234");
  const [token, setToken] = useState("tok_demo_1234");
  const [nickname, setNickname] = useState("Personal");

  async function loadCards() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get("/cards");
      setCards(res.data || []);
    } catch (e) {
      setErr("No se pudieron cargar las tarjetas. Revisa API/Token.");
    } finally {
      setLoading(false);
    }
  }

  async function createCard(e) {
    e.preventDefault();
    setErr("");

    const cleanLast4 = String(last4 ?? "").replace(/\D/g, "");
    if (cleanLast4.length !== 4) return setErr("Last4 debe tener 4 dígitos.");

    try {
      await http.post("/cards", { brand, last4: cleanLast4, token, nickname });
      await loadCards();
      setToken((t) => t + "_x");
    } catch (e) {
      setErr("No se pudo crear la tarjeta. Valida datos o restricciones en API.");
    }
  }

  async function deleteCard(id) {
    setErr("");
    try {
      await http.delete(`/cards/${id}`);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setErr("No se pudo eliminar la tarjeta.");
    }
  }

  function logout() {
    clearTokens();
    onLogout();
  }

  useEffect(() => {
    loadCards();
  }, []);

  return (
    <div className="grid">
      <div className="card">
        <h3>Nueva tarjeta</h3>
        <form onSubmit={createCard} className="form">
          <label>
            Franquicia
            <input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </label>

          <label>
            Tarjeta (ultimos 4 dígitos)
            <input
              value={last4}
              onChange={(e) => setLast4(e.target.value)}
              maxLength={4}
              inputMode="numeric"
            />
          </label>

          <label>
            Token
            <input value={token} onChange={(e) => setToken(e.target.value)} />
          </label>

          <label>
            Nombre personalizado
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </label>

          <button className="btn">Crear</button>
        </form>

        {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}
      </div>

      <div className="card">
        <div className="topbar" style={{ margin: 0 }}>
          <h3>Listado</h3>
          <div className="actions">
            <button className="btn secondary" onClick={loadCards}>Refrescar</button>
            <button className="btn danger" onClick={logout}>Salir</button>
          </div>
        </div>

        {loading ? (
          <div className="hint" style={{ marginTop: 12 }}>Cargando...</div>
        ) : cards.length === 0 ? (
          <div className="hint" style={{ marginTop: 12 }}>No hay tarjetas todavía.</div>
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Franquicia</th>
                <th>Tarjeta</th>
                <th>Nombre personalizado</th>
                <th>Creada</th>
                <th style={{ width: 220 }}></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id}>
                  <td>{c.brand}</td>
                  <td>{c.last4}</td>
                  <td>{c.nickname}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      className="btn secondary small"
                      onClick={() => onGoTransactions?.(c.id)}
                      title="Ver histórico de esta tarjeta"
                    >
                      Transacciones
                    </button>
                    <button
                      className="btn danger small"
                      onClick={() => deleteCard(c.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="hint" style={{ marginTop: 10 }}>
          Tip: entra a “Transacciones” desde una tarjeta para ir con la tarjeta preseleccionada.
        </p>
      </div>
    </div>
  );
}
