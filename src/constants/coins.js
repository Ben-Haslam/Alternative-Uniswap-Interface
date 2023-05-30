import * as chains from './chains';

const MAINNETCoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    name: "Ampleforth",
    abbr: "AMPL",
    address: "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
  },
  {
    name: "Wrapped BTC",
    abbr: "WBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  {
    name: "Fei USD",
    abbr: "FEI",
    address: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  },
  {
    name: "frax",
    abbr: "FRAX",
    address: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  },
  {
    name: "Frax Share",
    abbr: "FXS",
    address: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
  },
  {
    name: "renBTC",
    abbr: "renBTC",
    address: "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
  },
  {
    name: "StakeWise",
    abbr: "SWISE",
    address: "0x48C3399719B582dD63eB5AADf12A40B4C3f52FA2",
  },
]

const GÖRLICoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0x73967c6a0904aa032c103b4104747e88c566b1a2",
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0x509ee0d083ddf8ac028f2a56731412edd63223b9",
  },
]

const DOGECHAINCoins = [
  {
    name: "Doge",
    abbr: "WDOGE",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Grimace",
    abbr: "Grimace",
    address: "0x2f90907fD1DC1B7a484b6f31Ddf012328c2baB28",
  },
]

const COINS = new Map();
COINS.set(chains.ChainId.MAINNET, MAINNETCoins);
COINS.set(chains.ChainId.GÖRLI, GÖRLICoins);
COINS.set(chains.ChainId.DOGECHAIN, DOGECHAINCoins)
export default COINS
