import { Contract, ethers } from "ethers";
import * as COINS from "./constants/coins";

const ROUTER = require("./build/UniswapV2Router02.json");
const ERC20 = require("./build/ERC20.json");
const FACTORY = require("./build/IUniswapV2Factory.json");
const PAIR = require("./build/IUniswapV2Pair.json");

export function getProvider() {
  return new ethers.providers.Web3Provider(window.ethereum);
}

export function getSigner(provider) {
  return provider.getSigner();
}

export function getRouter(address, signer) {
  return new Contract(address, ROUTER.abi, signer);
}

export function getWeth(address, signer) {
  return new Contract(address, ERC20.abi, signer);
}

export function getFactory(address, signer) {
  return new Contract(address, FACTORY.abi, signer);
}

export async function getAccount() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

export async function getConversionRate(
  router,
  token1_address,
  token2_address
) {
  try {
    const amount_out = await router.getAmountsOut(
      ethers.utils.parseEther("1"),
      [token1_address, token2_address]
    );
    const rate = ethers.utils.formatEther(amount_out[1]);
    return Number(rate);
  } catch {
    return false;
  }
}

// This function returns an object with 2 fields: `balance` which container's the account's balance in the particular currency,
// and `symbol` which is the abbreviation of the token name. To work correctly it must be provided with 4 arguments:
//    `accountAddress` - An Ethereum address of the current user's account
//    `address` - An Ethereum address of the currency to check for (either a token or AUT)
//    `provider` - The current provider
//    `signer` - The current signer
export async function getBalanceAndSymbol(
  accountAddress,
  address,
  provider,
  signer
) {
  try {
    if (address === COINS.AUTONITY.address) {
      const balanceRaw = await provider.getBalance(accountAddress);

      return {
        balance: ethers.utils.formatEther(balanceRaw),
        symbol: COINS.AUTONITY.abbr,
      };
    } else {
      const token = new Contract(address, ERC20.abi, signer);
      const balanceRaw = await token.balanceOf(accountAddress);
      const symbol = await token.symbol();

      return {
        balance: ethers.utils.formatEther(balanceRaw),
        symbol: symbol,
      };
    }
  } catch (err) {
    return false;
  }
}

export function doesTokenExist(address, signer) {
  try {
    return new Contract(address, ERC20.abi, signer);
  } catch (err) {
    return false;
  }
}

// This function swaps two particular currencies, it can handle switching from Eth to Token, Token to Eth, and Token to Token.
// No error handling is done, so any issues can be caught with the use of .catch()
// To work correctly, there needs to be 7 arguments:
//    `address1` - An Ethereum address of the currency to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the currency to trade to (either a token or AUT)
//    `amount` - A float or similar number representing the value of address1's currency to trade
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `provider` - The current provider
//    `signer` - The current signer
export async function swapCurrency(
  address1,
  address2,
  amount,
  routerContract,
  accountAddress,
  provider,
  signer
) {
  const currencies = [address1, address2];
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const amountIn = ethers.utils.parseEther(amount.toString());
  const amountOut = await routerContract.callStatic.getAmountsOut(
    amountIn,
    currencies
  );

  const currency1 = new Contract(address1, ERC20.abi, signer);
  await currency1.approve(routerContract.address, amountIn);

  if (address1 === COINS.AUTONITY.address) {
    // Eth -> Token
    await routerContract.swapExactETHForTokens(
      amountOut[1],
      currencies,
      accountAddress,
      deadline,
      { value: amountIn }
    );
  } else if (address2 === COINS.AUTONITY.address) {
    // Token -> Eth
    await routerContract.swapExactTokensForETH(
      amountIn,
      amountOut[1],
      currencies,
      accountAddress,
      deadline
    );
  } else {
    await routerContract.swapExactTokensForTokens(
      amountIn,
      amountOut[1],
      currencies,
      accountAddress,
      deadline
    );
  }
}

// This function returns the reserves stored in a the liquidity pool between the currency of address1 and the currency
// of address2. Some extra logic was needed to make sure that the results were returned in the correct order, as
// `pair.getReserves()` would always return the reserves in the same order regardless of which order the addresses were.
//    `address1` - An Ethereum address of the currency to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the currency to trade to (either a token or AUT)
//    `factory` - The current factory
//    `signer` - The current signer
export async function getReserves(
  address1,
  address2,
  factory,
  signer,
  accountAddress
) {
  const pairAddress = await factory.getPair(address1, address2);
  const pair = new Contract(pairAddress, PAIR.abi, signer);

  try {
    const liquidityTokens_BN = await pair.balanceOf(accountAddress);
    const LiquidityTokens = Number(
      ethers.utils.formatEther(liquidityTokens_BN)
    ).toFixed(2);
    console.log("Liquidity tokens:", LiquidityTokens);

    const reservesRaw = await pair.getReserves();

    let results = [
      Number(ethers.utils.formatEther(reservesRaw[0])).toFixed(2),
      Number(ethers.utils.formatEther(reservesRaw[1])).toFixed(2),
    ];

    return [
      (await pair.token0()) === address1 ? results[0] : results[1],
      (await pair.token1()) === address2 ? results[1] : results[0],
      LiquidityTokens,
    ];
  } catch (err) {
    console.log("no reserves yet");
    return [0, 0, 0];
  }
}

// Function used to add Liquidity to any pair of tokens or token-AUT
// To work correctly, there needs to be 9 arguments:
//    `address1` - An Ethereum address of the currency to add from (either a token or AUT)
//    `address2` - An Ethereum address of the currency to add to (either a token or AUT)
//    `amount1` - A float or similar number representing the value of address1's currency to add
//    `amount2` - A float or similar number representing the value of address2's currency to add
//    `amount1Min` - A float or similar number representing the minimum of address1's currency to add
//    `amount2Min` - A float or similar number representing the minimum of address2's currency to add
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `provider` - The current provider
//    `signer` - The current signer
export async function addLiquidity(
  address1,
  address2,
  amount1,
  amount2,
  amount1Min,
  amount2Min,
  routerContract,
  account,
  signer
) {
  const amountInA = ethers.utils.parseEther(amount1.toString());
  const amountInB = ethers.utils.parseEther(amount2.toString());

  const amountAMin = ethers.utils.parseEther(amount1Min.toString());
  const amountBMin = ethers.utils.parseEther(amount2Min.toString());

  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const token1 = new Contract(address1, ERC20.abi, signer);
  const token2 = new Contract(address2, ERC20.abi, signer);

  await token1.approve(routerContract.address, amountInA);
  await token2.approve(routerContract.address, amountInB);

  console.log([
    address1,
    address2,
    Number(amountInA),
    Number(amountInB),
    Number(amountAMin),
    Number(amountBMin),
    account,
    deadline,
  ]);

  if (address1 === COINS.AUTONITY.address) {
    // Eth + Token
    await routerContract.addLiquidityETH(
      address2,
      amountInB,
      amountBMin,
      amountAMin,
      account,
      deadline,
      { value: amountInA }
    );
  } else if (address2 === COINS.AUTONITY.address) {
    // Token + Eth
    await routerContract.addLiquidityETH(
      address1,
      amountInA,
      amountAMin,
      amountBMin,
      account,
      deadline,
      { value: amountInB }
    );
  } else {
    // Token + Token
    await routerContract.addLiquidity(
      address1,
      address2,
      amountInA,
      amountInB,
      amountAMin,
      amountBMin,
      account,
      deadline
    );
  }
}

// Exactly the same as above but executes a static call to get the result of the liquidity addition for a preview
export async function addLiquidityTest(
  address1,
  address2,
  amount1,
  amount2,
  amount1Min,
  amount2Min,
  routerContract,
  account,
  signer
) {
  const amountInA = ethers.utils.parseEther(amount1.toString());
  const amountInB = ethers.utils.parseEther(amount2.toString());

  const amountAMin = ethers.utils.parseEther(amount1Min.toString());
  const amountBMin = ethers.utils.parseEther(amount2Min.toString());

  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  if (address1 === COINS.AUTONITY.address) {
    // Eth + Token
    await routerContract.callStatic
      .addLiquidityETH(
        address2,
        amountInB,
        amountBMin,
        amountAMin,
        account,
        deadline,
        { value: amountInA }
      )
      .then((values) => {
        console.log(values);
        console.log("tokenA in: ", ethers.utils.formatEther(values[0]));
        console.log("tokenB in: ", ethers.utils.formatEther(values[1]));
        console.log(
          "liquidity tokens out: ",
          ethers.utils.formatEther(values[2])
        );
      });
  } else if (address2 === COINS.AUTONITY.address) {
    // Token + Eth
    await routerContract.callStatic
      .addLiquidityETH(
        address1,
        amountInA,
        amountAMin,
        amountBMin,
        account,
        deadline,
        { value: amountInB }
      )
      .then((values) => {
        console.log(values);
        console.log(values);
        console.log("tokenA in: ", ethers.utils.formatEther(values[0]));
        console.log("tokenB in: ", ethers.utils.formatEther(values[1]));
        console.log(
          "liquidity tokens out: ",
          ethers.utils.formatEther(values[2])
        );
      });
  } else {
    // Token + Token
    await routerContract.callStatic
      .addLiquidity(
        address1,
        address2,
        amountInA,
        amountInB,
        amountAMin,
        amountBMin,
        account,
        deadline
      )
      .then((values) => {
        console.log(values);
        console.log(values);
        console.log("tokenA in: ", ethers.utils.formatEther(values[0]));
        console.log("tokenB in: ", ethers.utils.formatEther(values[1]));
        console.log(
          "liquidity tokens out: ",
          ethers.utils.formatEther(values[2])
        );
      });
  }
}
