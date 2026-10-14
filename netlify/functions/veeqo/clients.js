// Clientes del portal. tokenHash = SHA-256 del codigo de acceso (el codigo NO se guarda aca).
// Para agregar uno: generar un codigo largo y aleatorio, calcular su SHA-256 y sumar la fila.
module.exports = [
  {
    "id": "admin",
    "name": "MyFullGuy Admin",
    "admin": true,
    "tokenHash": "9cf931ab3828b0a3de8eeb8a4199be06b861ca3c0d041f5a355e6372413a59da"
  },
  {
    "id": "auron",
    "name": "AURON",
    "brands": [
      "AURON"
    ],
    "channels": [
      "Auron Smart FBA",
      "Auron Smart"
    ],
    "tokenHash": "6546592011a7c523780205553dd000315603ffcce7909544016bd2b389527075"
  },
  {
    "id": "goota",
    "name": "Goota",
    "brands": [
      "Goota"
    ],
    "channels": [
      "Goota Amazon Seller FBA",
      "Goota Amazon Seller",
      "Goota Shopify Store"
    ],
    "tokenHash": "d2b47ce47533b4cf4b1ec52bed4fc703775f14ff34db0232fd93a50e94e14796"
  },
  {
    "id": "aquila",
    "name": "Aquila (Sofnova)",
    "brands": [
      "Aquila - Dinamic"
    ],
    "channels": [
      "Sofnova - Backpack FBA",
      "Sofnova - Backpack"
    ],
    "tokenHash": "6224390c6de2ac07d3bd7ba159e5bd0bde54ec36a693986c0f10c3f72e6779e7"
  },
  {
    "id": "porto",
    "name": "Porto Boutique",
    "brands": [
      "Porto Boutique",
      "Ruh Natural"
    ],
    "channels": [
      "Porto Boutique Shopify channel",
      "Porto Walmart channel",
      "Etsy Store",
      "Amazon Channel",
      "Amazon Channel FBA",
      "Merged Orders"
    ],
    "tokenHash": "7834d372a99a4b5f048182db234822cd9cf1e84c9b263b87b88ece56052acdad"
  }
];
