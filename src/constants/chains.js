export const networks = [1,5, 2000]

export const ChainId = {
  MAINNET: 1,
  GÖRLI: 5,
  DOGECHAIN: 2000
};

export const routerAddress = new Map();
routerAddress.set(ChainId.MAINNET, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.GÖRLI, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
routerAddress.set(ChainId.DOGECHAIN, "0x6258c967337D3faF0C2ba3ADAe5656bA95419d5f");

