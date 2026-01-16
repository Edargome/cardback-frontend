
---

# README para el repo **cardback-frontend** (Frontend)

# cardback-frontend — React (Vite) para CardBack API

Frontend en **React + Vite** para consumir la API **CardBack**:
- Login / Refresh Token
- CRUD de Cards (listar, crear, eliminar)
- Transactions: crear pago + histórico (global y por tarjeta)

Estructura base del repo: `public/`, `src/`, `vite.config.js`, `package.json`. :contentReference[oaicite:6]{index=6}

---

## Requisitos

- Node.js 18+ (recomendado)
- Backend corriendo (repo: https://github.com/Edargome/CardBack)

---

## Configuración

### URL del Backend
Crea un archivo `.env.local` en la raíz:

```env
VITE_API_BASE_URL=http://localhost:5256
