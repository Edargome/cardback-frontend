import { useMemo, useState } from "react";
import LoginPage from "./pages/LoginPage";
import CardsPage from "./pages/CardsPage";
import TransactionsPage from "./pages/TransactionsPage";
import { getTokens } from "./auth/authStore";

export default function App() {
  const initialLogged = useMemo(() => !!getTokens().accessToken, []);
  const [logged, setLogged] = useState(initialLogged);
  const [tab, setTab] = useState("cards"); // cards | tx

  if (!logged) return <LoginPage onLogin={() => setLogged(true)} />;

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="topbar" style={{ margin: 0 }}>
          <h2 style={{ margin: 0 }}>CardBack</h2>
          <div className="actions">
            <button
              className={`btn ${tab === "cards" ? "" : "secondary"}`}
              onClick={() => setTab("cards")}
            >
              Tarjetas
            </button>
            <button
              className={`btn ${tab === "tx" ? "" : "secondary"}`}
              onClick={() => setTab("tx")}
            >
              Transacciones
            </button>
            <button className="btn danger" onClick={() => setLogged(false)}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {tab === "cards" ? (
        <CardsPage onLogout={() => setLogged(false)} />
      ) : (
        <TransactionsPage />
      )}
    </div>
  );
}
