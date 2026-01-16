import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

export default function TransactionsPage({ initialCardId = null, initialMode = "all", onBackToCards }) {
  const [cards, setCards] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [err, setErr] = useState("");

  // Form
  const [cardId, setCardId] = useState(initialCardId || "");
  const [amount, setAmount] = useState("10000");
  const [currency, setCurrency] = useState("COP");
  const [description, setDescription] = useState("Pago demo");

  // Filtros (solo para modo all)
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const selectedCard = useMemo(() => cards.find((c) => c.id === cardId), [cards, cardId]);

  async function loadCards() {
    setErr("");
    setLoadingCards(true);
    try {
      const res = await http.get("/cards");
      const list = res.data || [];
      setCards(list);

      // Si vienes desde Cards con una cardId, respétala
      if (initialCardId && list.some((x) => x.id === initialCardId)) {
        setCardId(initialCardId);
      } else if (!cardId && list.length > 0) {
        setCardId(list[0].id);
      }
    } catch (e) {
      setErr("No se pudieron cargar las tarjetas.");
    } finally {
      setLoadingCards(false);
    }
  }

  async function loadAllTransactions() {
    setErr("");
    setLoadingTxs(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await http.get("/transactions", { params });
      setTxs(res.data || []);
    } catch (e) {
      setErr("No se pudo cargar el histórico de transacciones.");
    } finally {
      setLoadingTxs(false);
    }
  }

  async function loadTransactionsByCard(targetCardId) {
    const id = targetCardId || cardId;
    if (!id) return;

    setErr("");
    setLoadingTxs(true);
    try {
      const res = await http.get(`/cards/${id}/transactions`);
      setTxs(res.data || []);
    } catch (e) {
      setErr("No se pudo cargar el histórico por tarjeta.");
    } finally {
      setLoadingTxs(false);
    }
  }

  async function createPayment(e) {
    e.preventDefault();
    setErr("");

    const numAmount = Number(amount);
    if (!cardId) return setErr("Selecciona una tarjeta.");
    if (!Number.isFinite(numAmount) || numAmount <= 0) return setErr("Monto inválido.");
    if (!currency || currency.trim().length !== 3) return setErr("Moneda debe tener 3 letras (ej. COP).");

    try {
      await http.post("/transactions", {
        cardId,
        amount: numAmount,
        currency: currency.trim().toUpperCase(),
        description: description || "",
      });

      // UX: después de pagar, muestra el histórico de ESA tarjeta (más natural)
      await loadTransactionsByCard(cardId);
    } catch (e) {
      setErr("No se pudo registrar el pago. Revisa reglas del backend.");
    }
  }

  // Carga inicial
  useEffect(() => {
    loadCards();
    // Si vienes desde cards => modo por tarjeta, carga por tarjeta
    if (initialMode === "card" && initialCardId) {
      loadTransactionsByCard(initialCardId);
    } else {
      loadAllTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1.6fr" }}>
      <div className="card">
        <div className="topbar" style={{ margin: 0 }}>
          <h3>Nuevo pago</h3>
          <div className="actions">
            <button className="btn secondary" onClick={onBackToCards}>Volver</button>
          </div>
        </div>

        {loadingCards ? (
          <div className="hint">Cargando tarjetas...</div>
        ) : cards.length === 0 ? (
          <div className="hint">No tienes tarjetas. Crea una primero en “Tarjetas”.</div>
        ) : (
          <form onSubmit={createPayment} className="form">
            <label>
              Tarjeta
              <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} •••• {c.last4} {c.nickname ? `(${c.nickname})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Monto
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
            </label>

            <label>
              Moneda (3 letras)
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} />
            </label>

            <label>
              Descripción
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn">Pagar</button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => loadTransactionsByCard(cardId)}
                disabled={!cardId}
                title="Ver histórico de la tarjeta seleccionada"
              >
                Ver historial tarjeta
              </button>
            </div>

            {selectedCard && (
              <div className="hint">
                Seleccionada: <b>{selectedCard.brand}</b> •••• <b>{selectedCard.last4}</b>
              </div>
            )}
          </form>
        )}

        {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}
      </div>

      <div className="card">
        <div className="topbar" style={{ margin: 0 }}>
          <h3>Histórico</h3>
          <div className="actions">
            <button className="btn secondary" onClick={loadAllTransactions} disabled={loadingTxs}>
              Ver todo
            </button>
            <button className="btn secondary" onClick={() => loadTransactionsByCard(cardId)} disabled={!cardId || loadingTxs}>
              Por tarjeta
            </button>
          </div>
        </div>

        <div className="form" style={{ marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              Desde
              <input placeholder="2026-01-01T00:00:00Z" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              Hasta
              <input placeholder="2026-01-16T23:59:59Z" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
          <button className="btn secondary" onClick={loadAllTransactions} disabled={loadingTxs}>
            Aplicar rango (Ver todo)
          </button>
          <div className="hint">Si vienes desde una tarjeta, “Por tarjeta” ya es el flujo recomendado.</div>
        </div>

        {loadingTxs ? (
          <div className="hint" style={{ marginTop: 12 }}>Cargando transacciones...</div>
        ) : txs.length === 0 ? (
          <div className="hint" style={{ marginTop: 12 }}>No hay transacciones todavía.</div>
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tarjeta</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>{shortCard(t.cardId, cards)}</td>
                  <td>{t.description}</td>
                  <td>{formatMoney(t.amount)} {t.currency}</td>
                  <td>{statusLabel(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function shortCard(cardId, cards) {
  const c = cards.find((x) => x.id === cardId);
  if (!c) return cardId?.slice?.(0, 8) ? cardId.slice(0, 8) + "…" : String(cardId);
  return `${c.brand} •••• ${c.last4}`;
}

// Soporta status como number o string
function statusLabel(s) {
  if (typeof s === "number") {
    if (s === 1) return "Approved";
    if (s === 2) return "Declined";
    if (s === 3) return "Reversed";
    return String(s);
  }
  return String(s);
}
