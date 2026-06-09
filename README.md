# Veeqo Client Portal

Portal web para visualizar inventario y órdenes de Veeqo.

## Estructura

```
veeqo-portal/
├── index.html                  ← Frontend (una sola página)
├── netlify.toml                ← Config de Netlify
├── netlify/
│   └── functions/
│       └── veeqo.js            ← Proxy serverless a la API de Veeqo
└── README.md
```

## Deploy en Netlify (5 minutos)

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/veeqo-portal.git
git push -u origin main
```

### 2. Conectar en Netlify
1. Entrar a [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Conectar tu repo de GitHub
4. Build settings: dejar todo vacío (no hay build step)
5. Click "Deploy site"

### 3. Agregar tu API Key de Veeqo
En Netlify → Site settings → Environment variables:
- Key: `VEEQO_API_KEY`
- Value: tu API key de Veeqo

> Para obtener tu API key: en Veeqo → Settings → API Keys

### 4. Re-deploy
Después de agregar la env var, hacer un re-deploy (Deploys → Trigger deploy).

## Funcionalidades

- **Inventario**: lista de productos con SKU, marca, stock y precio. Filtro por marca y búsqueda.
- **Órdenes Activas**: órdenes en proceso (awaiting fulfillment, allocated, printed, picked, ready to ship).
- **Historial**: órdenes pasadas (shipped, delivered, cancelled, refunded).

## Customización

- Para cambiar el nombre del portal: editar `<title>` y el texto `Portal de Clientes` en `index.html`
- Para agregar tu logo: reemplazar el div `.logo` en el header
- Para restringir acceso: agregar Netlify Identity o HTTP basic auth en `netlify.toml`
