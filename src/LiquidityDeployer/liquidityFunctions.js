import { Contract, ethers } from "ethers";
import { func } from "prop-types";
import * as COINS from "../constants/coins";

import { fetchReserves } from "../ethereumFunctions";

const ROUTER = require("../build/UniswapV2Router02.json");
const ERC20 = require("../build/ERC20.json");
const FACTORY = require("../build/IUniswapV2Factory.json");
const PAIR = require("../build/IUniswapV2Pair.json");

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
  amount1min,
  amount2min,
  routerContract,
  account,
  signer
) {
  const amountIn1 = ethers.utils.parseEther(amount1.toString());
  const amountIn2 = ethers.utils.parseEther(amount2.toString());

  const amount1Min = ethers.utils.parseEther(amount1min.toString());
  const amount2Min = ethers.utils.parseEther(amount2min.toString());

  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const token1 = new Contract(address1, ERC20.abi, signer);
  const token2 = new Contract(address2, ERC20.abi, signer);

  await token1.approve(routerContract.address, amountIn1);
  await token2.approve(routerContract.address, amountIn2);

  console.log([
    address1,
    address2,
    Number(amountIn1),
    Number(amountIn2),
    Number(amount1Min),
    Number(amount2Min),
    account,
    deadline,
  ]);

  if (address1 === COINS.AUTONITY.address) {
    // Eth + Token
    await routerContract.addLiquidityETH(
      address2,
      amountIn2,
      amount2Min,
      amount1Min,
      account,
      deadline,
      { value: amountIn1 }
    );
  } else if (address2 === COINS.AUTONITY.address) {
    // Token + Eth
    await routerContract.addLiquidityETH(
      address1,
      amountIn1,
      amount1Min,
      amount2Min,
      account,
      deadline,
      { value: amountIn2 }
    );
  } else {
    // Token + Token
    await routerContract.addLiquidity(
      address1,
      address2,
      amountIn1,
      amountIn2,
      amount1Min,
      amount2Min,
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
  amount1min,
  amount2min,
  routerContract,
  account,
  signer
) {
  const amountIn1 = ethers.utils.parseEther(amount1.toString());
  const amountIn2 = ethers.utils.parseEther(amount2.toString());

  const amount1Min = ethers.utils.parseEther(amount1min.toString());
  const amount2Min = ethers.utils.parseEther(amount2min.toString());

  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  if (address1 === COINS.AUTONITY.address) {
    // Eth + Token
    const values = await routerContract.callStatic.addLiquidityETH(
      address2,
      amountIn2,
      amount2Min,
      amount1Min,
      account,
      deadline,
      { value: amountIn1 }
    );
    // return ethers.utils.formatEther(values[2]);
  } else if (address2 === COINS.AUTONITY.address) {
    // Token + Eth
    const values = await routerContract.callStatic
      .addLiquidityETH(
        address1,
        amountIn1,
        amount1Min,
        amount2Min,
        account,
        deadline,
        { value: amountIn2 }
      )
      .then((values) => {
        console.log("tokenA in: ", ethers.utils.formatEther(values[0]));
        console.log("tokenB in: ", ethers.utils.formatEther(values[1]));
        console.log(
          "liquidity tokens out: ",
          ethers.utils.formatEther(values[2])
        );
      });
    // return ethers.utils.formatEther(values[2]);
  } else {
    // Token + Token
    const values = await routerContract.callStatic
      .addLiquidity(
        address1,
        address2,
        amountIn1,
        amountIn2,
        amount1Min,
        amount2Min,
        account,
        deadline
      )
      .then((values) => {
        console.log("tokenA in: ", ethers.utils.formatEther(values[0]));
        console.log("tokenB in: ", ethers.utils.formatEther(values[1]));
        console.log(
          "liquidity tokens out: ",
          ethers.utils.formatEther(values[2])
        );
      });
    // return ethers.utils.formatEther(values[2]);
  }
}

// Function used to remove Liquidity from any pair of tokens or token-AUT
// To work correctly, there needs to be 9 arguments:
//    `address1` - An Ethereum address of the currency to recieve (either a token or AUT)
//    `address2` - An Ethereum address of the currency to recieve (either a token or AUT)
//    `liquidity_tokens` - A float or similar number representing the value of liquidity tokens you will burn to get tokens back
//    `amount1Min` - A float or similar number representing the minimum of address1's currency to recieve
//    `amount2Min` - A float or similar number representing the minimum of address2's currency to recieve
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `provider` - The current provider
//    `signer` - The current signer
export async function removeLiquidity(
  address1,
  address2,
  liquidity_tokens,
  amount1min,
  amount2min,
  routerContract,
  account,
  signer,
  factory
) {
  const liquidity = ethers.utils.parseEther(liquidity_tokens.toString());

  const amount1Min = ethers.utils.parseEther(amount1min.toString());
  const amount2Min = ethers.utils.parseEther(amount2min.toString());

  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const pairAddress = await factory.getPair(address1, address2);
  const pair = new Contract(pairAddress, PAIR.abi, signer);

  await pair.approve(routerContract.address, liquidity);

  console.log([
    address1,
    address2,
    Number(liquidity),
    Number(amount1Min),
    Number(amount2Min),
    account,
    deadline,
  ]);

  if (address1 === COINS.AUTONITY.address) {
    // Eth + Token
    await routerContract.removeLiquidityETH(
      address2,
      liquidity,
      amount2Min,
      amount1Min,
      account,
      deadline
    );
  } else if (address2 === COINS.AUTONITY.address) {
    // Token + Eth
    await routerContract.removeLiquidityETH(
      address1,
      liquidity,
      amount1Min,
      amount2Min,
      account,
      deadline
    );
  } else {
    // Token + Token
    await routerContract.removeLiquidity(
      address1,
      address2,
      liquidity,
      amount1Min,
      amount2Min,
      account,
      deadline
    );
  }
}

const quote = (amountA, reserveA, reserveB) => {
  const amountB = amountA * (reserveB / reserveA);
  return amountB;
};

// Function used to get a quote of the liquidity addition
//    `address1` - An Ethereum address of the currency to recieve (either a token or AUT)
//    `address2` - An Ethereum address of the currency to recieve (either a token or AUT)
//    `amountA_desired` - The prefered value of the first token that the user would like to deploy as liquidity
//    `amountB_desired` - The prefered value of the second token that the user would like to deploy as liquidity
//    `factory` - The current factory
//    `signer` - The current signer

export async function quoteAddLiquidity(
  address1,
  address2,
  amountADesired,
  amountBDesired,
  factory,
  signer
) {
  const pairAddress = await factory.getPair(address1, address2);
  const pair = new Contract(pairAddress, PAIR.abi, signer);

  const reservesRaw = await fetchReserves(address1, address2, pair); // Returns the reserves already formated as ethers
  const reserveA = reservesRaw[0];
  const reserveB = reservesRaw[1];

  if (reserveA == 0 && reserveB == 0) {
    return [amountADesired.toString(), amountBDesired.toString()];
  } else {
    const amountBOptimal = quote(amountADesired, reserveA, reserveB);
    if (amountBOptimal <= amountBDesired) {
      return [amountADesired.toString(), amountBOptimal.toString()];
    } else {
      const amountAOptimal = quote(amountBDesired, reserveB, reserveA);
      return [amountAOptimal.toString(), amountBDesired.toString()];
    }
  }
}

// Function used to get a quote of the liquidity removal
//    `address1` - An Ethereum address of the currency to recieve (either a token or AUT)
//    `address2` - An Ethereum address of the currency to recieve (either a token or AUT)
//    `liquidity` - The amount of liquidity tokens the user will burn to get their tokens back
//    `factory` - The current factory
//    `signer` - The current signer

export async function quoteRemoveLiquidity(
  address1,
  address2,
  liquidity,
  factory,
  signer
) {
  const pairAddress = await factory.getPair(address1, address2);
  console.log("pair address", pairAddress);
  const pair = new Contract(pairAddress, PAIR.abi, signer);

  const reservesRaw = await fetchReserves(address1, address2, pair); // Returns the reserves already formated as ethers
  const reserveA = reservesRaw[0];
  const reserveB = reservesRaw[1];

  // const Aout =
  //   (liquidity * Math.sqrt(2)) /
  //   Math.sqrt(1 + Math.pow(reserveB / reserveA, 2));
  // const Bout =
  //   (liquidity * Math.sqrt(2)) /
  //   Math.sqrt(1 + Math.pow(reserveA / reserveB, 2));

  const Aout = liquidity * Math.sqrt(reserveA / reserveB);
  const Bout = liquidity * Math.sqrt(reserveB / reserveA);

  return [liquidity, Aout, Bout];
}
