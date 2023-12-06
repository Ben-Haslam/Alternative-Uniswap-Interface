import * as chains from './chains';

const REDSTONECoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Orbs",
    abbr: "🔮",
    address: "0xE7E4cdF4d2A2A6FCf7c6f4B4178c0715169Ca6a6",
  },
  {
    name: "Beanus",
    abbr: "BEANS",
    address: "0x4D0A21B14dC3093D30c3cC4d8b32bDd65FeBf92c",
  },
]

const COINS = new Map();
COINS.set(chains.ChainId.REDSTONE, REDSTONECoins);
export default COINS
