export const networks = [3,4,5,42,123, 1337, 444800, 444900]

export const ChainId = {
  // MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  KOVAN: 42,
  DEVNET: 444800,
  AUTONITY: 444900,
  PARASTATE: 123,
  GANCHE: 1337
};

export const routerAddress = new Map();
// routerAddress.set(ChainId.MAINNET, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.ROPSTEN, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.RINKEBY, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.GÖRLI, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.KOVAN, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.DEVNET, "0x04e555283D37aE85F6eB311fe2578F3B3f3dFc52");
routerAddress.set(ChainId.AUTONITY, "0x04e555283D37aE85F6eB311fe2578F3B3f3dFc52");
routerAddress.set(ChainId.PARASTATE, "0x07a1905D44feeA439ceFAabd11a63bEf684abE11");
routerAddress.set(ChainId.GANCHE, "0x0F44AC51198D8F99847db6C431448dBC673428f1");

