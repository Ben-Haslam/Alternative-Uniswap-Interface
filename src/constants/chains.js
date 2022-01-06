export const networks = [3,4,5,42,123,444800, 444900]

export const ChainId = {
  // MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  KOVAN: 42,
  DEVNET: 444800,
  AUTONITY: 444900,
  PARASTATE: 123
};

export const routerAddress = new Map();
// routerAddress.set(ChainId.MAINNET, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.ROPSTEN, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.RINKEBY, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.GÖRLI, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.KOVAN, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.DEVNET, "0x04e555283D37aE85F6eB311fe2578F3B3f3dFc52");
routerAddress.set(ChainId.AUTONITY, "0x04e555283D37aE85F6eB311fe2578F3B3f3dFc52");
routerAddress.set(ChainId.PARASTATE, "0x5d78A893b0666bEDeBf242b8d098A6030ADAD373");

