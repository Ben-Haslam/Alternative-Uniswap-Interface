export const ChainId = {
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  KOVAN: 42,
  AUTONITY: 444900,
};

export const routerAddress = new Map()
routerAddress.set(ChainId.AUTONITY, "0x4489D87C8440B19f11d63FA2246f943F492F3F5F")

export const wethAddress = new Map()
wethAddress.set(ChainId.AUTONITY, "0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF")

export const factoryAddress = new Map()
factoryAddress.set(ChainId.AUTONITY, "0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116")

