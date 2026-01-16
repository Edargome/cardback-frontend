
---

# README para el repo **cardback-frontend** (Frontend)

# cardback-frontend — React (Vite) para CardBack API

Frontend en **React + Vite** para consumir la API **CardBack**:
- Login / Refresh Token
- CRUD de Cards (listar, crear, eliminar)
- Transactions: crear pago + histórico (global y por tarjeta)

Estructura base del repo: `public/`, `src/`, `vite.config.js`, `package.json`. :contentReference[oaicite:6]{index=6}

---

## Requisito de Node (importante)

Este proyecto usa **Vite v6**, por lo tanto **NO es compatible con Node 18**.

### Versiones soportadas
- **Node.js 20.19+** o
- **Node.js 22.12+** (recomendado)

Si intentas ejecutar con Node 18, verás errores como:
- `Vite requires Node.js version 20.19+ or 22.12+`
- `TypeError: crypto.hash is not a function`

---

## Configuración

### URL del Backend
Crea un archivo `.env.local` en la raíz:

```env
VITE_API_BASE_URL=http://localhost:5256
