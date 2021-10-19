import * as chains from './chains';

const autonityCoins = [
  {
    name: "Auton",
    abbr: "AUT",
    address: "0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF", // Weth address
  },
  {
    name: "Token A",
    abbr: "TA",
    address: "0x1d29BD2ACedBff15A59e946a4DE26d5257447727",
  },
  {
    name: "Token B",
    abbr: "TB",
    address: "0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA",
  },
  {
    name: "Token C",
    abbr: "TC",
    address: "0xC8E25055A4666F39179abE06d466F5A98423863F",
  },
  {
    name: "Token D",
    abbr: "TD",
    address: "0x23238098F2B4dd9Ba3bb8bc78b639dD113da697e",
  }
]

const COINS = new Map();
// routerAddress.set(ChainId.MAINNET, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
COINS.set(chains.ChainId.ROPSTEN, []);
COINS.set(chains.ChainId.RINKEBY, []);
COINS.set(chains.ChainId.GÖRLI, []);
COINS.set(chains.ChainId.KOVAN, []);
COINS.set(chains.ChainId.AUTONITY, autonityCoins);
export default COINS