// ─────────────────────────────────────────────────────────
// CONFIGURACIÓN DE CLIENTES
// Agregá o editá clientes acá. El token es la clave del URL.
// Ejemplo de acceso: https://tu-portal.netlify.app/?token=auron2024
//
// brands: array de marcas exactas como aparecen en Veeqo
// name: nombre para mostrar en el portal
// ─────────────────────────────────────────────────────────

const CLIENTS = {
  // Token especial para vos — ve TODO
  "admin": {
    name: "MyFullGuy Admin",
    admin: true
  },

  // Clientes — editá los tokens y marcas
  "auron2024": {
    name: "AURON",
    brands: ["AURON"]
  },
  "porto2024": {
    name: "Porto Boutique",
    brands: ["Porto Boutique"]
  },
  "sofnova2024": {
    name: "Sofnova",
    brands: ["Fujian Yueke New Material Co., LTD."]
  },
  // Agregá más clientes acá:
  // "token123": { name: "Nombre cliente", brands: ["Marca en Veeqo"] },
};
