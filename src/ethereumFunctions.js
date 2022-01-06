import { Contract, ethers } from "ethers";
import * as chains from "./constants/chains";
import COINS from "./constants/coins";

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

export async function getNetwork(provider) {
  const network = await provider.getNetwork();
  return network.chainId;
}

export function getRouter(address, signer) {
  return new Contract(address, ROUTER.abi, signer);
}

export async function checkNetwork(provider) {
  const chainId = getNetwork(provider);
  if (chains.networks.includes(chainId)){
    return true
  }
  return false;
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

//This function checks if a ERC20 token exists for a given address
//    `address` - The Ethereum address to be checked
//    `signer` - The current signer
export function doesTokenExist(address, signer) {
  try {
    return new Contract(address, ERC20.abi, signer);
  } catch (err) {
    return false;
  }
}

export async function getDecimals(token) {
  const decimals = await token.decimals().then((result) => {
      return result;
    }).catch((error) => {
      console.log('No tokenDecimals function for this token, set to 0');
      return 0;
    });
    return decimals;
}

// This function returns an object with 2 fields: `balance` which container's the account's balance in the particular token,
// and `symbol` which is the abbreviation of the token name. To work correctly it must be provided with 4 arguments:
//    `accountAddress` - An Ethereum address of the current user's account
//    `address` - An Ethereum address of the token to check for (either a token or AUT)
//    `provider` - The current provider
//    `signer` - The current signer
export async function getBalanceAndSymbol(
  accountAddress,
  address,
  provider,
  signer,
  weth_address,
  coins
) {
  try {
    if (address === weth_address) {
      const balanceRaw = await provider.getBalance(accountAddress);

      return {
        balance: ethers.utils.formatEther(balanceRaw),
        symbol: coins[0].abbr,
      };
    } else {
      const token = new Contract(address, ERC20.abi, signer);
      const tokenDecimals = await getDecimals(token);
      const balanceRaw = await token.balanceOf(accountAddress);
      const symbol = await token.symbol();

      return {
        balance: balanceRaw*10**(-tokenDecimals),
        symbol: symbol,
      };
    }
  } catch (error) {
    console.log ('The getBalanceAndSymbol function had an error!');
    console.log (error)
    return false;
  }
}

// This function swaps two particular tokens / AUT, it can handle switching from AUT to ERC20 token, ERC20 token to AUT, and ERC20 token to ERC20 token.
// No error handling is done, so any issues can be caught with the use of .catch()
// To work correctly, there needs to be 7 arguments:
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `amount` - A float or similar number representing the value of address1's token to trade
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `signer` - The current signer
export async function swapTokens(
  address1,
  address2,
  amount,
  routerContract,
  accountAddress,
  signer
) {
  const tokens = [address1, address2];
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const token1 = new Contract(address1, ERC20.abi, signer);
  const tokenDecimals = await getDecimals(token1);
  
  const amountIn = ethers.utils.parseUnits(amount, tokenDecimals);
  const amountOut = await routerContract.callStatic.getAmountsOut(
    amountIn,
    tokens
  );

  await token1.approve(routerContract.address, amountIn);
  const wethAddress = await routerContract.WETH();

  if (address1 === wethAddress) {
    // Eth -> Token
    await routerContract.swapExactETHForTokens(
      amountOut[1],
      tokens,
      accountAddress,
      deadline,
      { value: amountIn }
    );
  } else if (address2 === wethAddress) {
    // Token -> Eth
    await routerContract.swapExactTokensForETH(
      amountIn,
      amountOut[1],
      tokens,
      accountAddress,
      deadline
    );
  } else {
    await routerContract.swapExactTokensForTokens(
      amountIn,
      amountOut[1],
      tokens,
      accountAddress,
      deadline
    );
  }
}

//This function returns the conversion rate between two token addresses
//    `address1` - An Ethereum address of the token to swaped from (either a token or AUT)
//    `address2` - An Ethereum address of the token to swaped to (either a token or AUT)
//    `amountIn` - Amount of the token at address 1 to be swaped from
//    `routerContract` - The router contract to carry out this swap
export async function getAmountOut(
  address1,
  address2,
  amountIn,
  routerContract,
  signer
) {
  try {
    const token1 = new Contract(address1, ERC20.abi, signer);
    const token1Decimals = await getDecimals(token1);

    const token2 = new Contract(address2, ERC20.abi, signer);
    const token2Decimals = await getDecimals(token2);

    const values_out = await routerContract.getAmountsOut(
      ethers.utils.parseUnits(String(amountIn), token1Decimals),
      [address1, address2]
    );
    const amount_out = values_out[1]*10**(-token2Decimals);
    console.log('amount out: ', amount_out)
    return Number(amount_out);
  } catch {
    return false;
  }
}

// This function calls the pair contract to fetch the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2. Some extra logic was needed to make sure that the results were returned in the correct order, as
// `pair.getReserves()` would always return the reserves in the same order regardless of which order the addresses were.
//    `address1` - An Ethereum address of the token to trade from (either a ERC20 token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a ERC20 token or AUT)
//    `pair` - The pair contract for the two tokens
export async function fetchReserves(address1, address2, pair, signer) {
  try {

    // Get decimals for each coin
    const coin1 = new Contract(address1, ERC20.abi, signer);
    const coin2 = new Contract(address2, ERC20.abi, signer);

    const coin1Decimals = await getDecimals(coin1);
    const coin2Decimals = await getDecimals(coin2);

    // Get reserves
    const reservesRaw = await pair.getReserves();

    // Put the results in the right order
    const results =  [
      (await pair.token0()) === address1 ? reservesRaw[0] : reservesRaw[1],
      (await pair.token1()) === address2 ? reservesRaw[1] : reservesRaw[0],
    ];

    // Scale each to the right decimal place
    return [
      (results[0]*10**(-coin1Decimals)),
      (results[1]*10**(-coin2Decimals))
    ]
  } catch (err) {
    console.log("error!");
    console.log(err);
    return [0, 0];
  }
}

// This function returns the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2, as well as the liquidity tokens owned by accountAddress for that pair.
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `factory` - The current factory
//    `signer` - The current signer
export async function getReserves(
  address1,
  address2,
  factory,
  signer,
  accountAddress
) {
  try {
    const pairAddress = await factory.getPair(address1, address2);
    const pair = new Contract(pairAddress, PAIR.abi, signer);
  
    if (pairAddress !== '0x0000000000000000000000000000000000000000'){
  
      const reservesRaw = await fetchReserves(address1, address2, pair, signer);
      const liquidityTokens_BN = await pair.balanceOf(accountAddress);
      const liquidityTokens = Number(
        ethers.utils.formatEther(liquidityTokens_BN)
      );
    
      return [
        reservesRaw[0].toPrecision(6),
        reservesRaw[1].toPrecision(6),
        liquidityTokens,
      ];
    } else {
      console.log("no reserves yet");
      return [0,0,0];
    }
  }catch (err) {
    console.log("error!");
    console.log(err);
    return [0, 0, 0];
  }
}
