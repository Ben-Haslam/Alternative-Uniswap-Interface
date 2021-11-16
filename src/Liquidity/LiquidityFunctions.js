import { Contract, ethers } from "ethers";
import { fetchReserves, getDecimals } from "../ethereumFunctions";

const ERC20 = require("../build/ERC20.json");
const PAIR = require("../build/IUniswapV2Pair.json");

// Function used to add Liquidity to any pair of tokens or token-AUT
// To work correctly, there needs to be 9 arguments:
//    `address1` - An Ethereum address of the coin to add from (either a token or AUT)
//    `address2` - An Ethereum address of the coin to add to (either a token or AUT)
//    `amount1` - A float or similar number representing the value of address1's coin to add
//    `amount2` - A float or similar number representing the value of address2's coin to add
//    `amount1Min` - A float or similar number representing the minimum of address1's coin to add
//    `amount2Min` - A float or similar number representing the minimum of address2's coin to add
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
  const token1 = new Contract(address1, ERC20.abi, signer);
  const token2 = new Contract(address2, ERC20.abi, signer);

  const token1Decimals = await getDecimals(token1);
  const token2Decimals = await getDecimals(token2);

  const amountIn1 = ethers.utils.parseUnits(amount1, token1Decimals);
  const amountIn2 = ethers.utils.parseUnits(amount2, token2Decimals);

  const amount1Min = ethers.utils.parseUnits(amount1min, token1Decimals);
  const amount2Min = ethers.utils.parseUnits(amount2min, token2Decimals);

  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  await token1.approve(routerContract.address, amountIn1);
  await token2.approve(routerContract.address, amountIn2);

  const wethAddress = await routerContract.WETH();

  console.log([
    address1,
    address2,
    amountIn1,
    amountIn2,
    amount1Min,
    amount2Min,
    account,
    deadline,
  ]);

  if (address1 === wethAddress) {
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
  } else if (address2 === wethAddress) {
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

// Function used to remove Liquidity from any pair of tokens or token-AUT
// To work correctly, there needs to be 9 arguments:
//    `address1` - An Ethereum address of the coin to recieve (either a token or AUT)
//    `address2` - An Ethereum address of the coin to recieve (either a token or AUT)
//    `liquidity_tokens` - A float or similar number representing the value of liquidity tokens you will burn to get tokens back
//    `amount1Min` - A float or similar number representing the minimum of address1's coin to recieve
//    `amount2Min` - A float or similar number representing the minimum of address2's coin to recieve
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
  const token1 = new Contract(address1, ERC20.abi, signer);
  const token2 = new Contract(address2, ERC20.abi, signer);

  const token1Decimals = await getDecimals(token1);
  const token2Decimals = await getDecimals(token2);

  const Getliquidity = (liquidity_tokens)=>{
    if (liquidity_tokens < 0.001){
      return ethers.BigNumber.from(liquidity_tokens*10**18);
    }
    return ethers.utils.parseUnits(String(liquidity_tokens), 18);
  }

  const liquidity = Getliquidity(liquidity_tokens);
  console.log('liquidity: ', liquidity);

  const amount1Min = ethers.utils.parseUnits(String(amount1min), token1Decimals);
  const amount2Min = ethers.utils.parseUnits(String(amount2min), token2Decimals);

  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const wethAddress = await routerContract.WETH();
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

  if (address1 === wethAddress) {
    // Eth + Token
    await routerContract.removeLiquidityETH(
      address2,
      liquidity,
      amount2Min,
      amount1Min,
      account,
      deadline
    );
  } else if (address2 === wethAddress) {
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

const quote = (amount1, reserve1, reserve2) => {
  const amount2 = amount1 * (reserve2 / reserve1);
  return [amount2];
};

// Function used to get a quote of the liquidity addition
//    `address1` - An Ethereum address of the coin to recieve (either a token or AUT)
//    `address2` - An Ethereum address of the coin to recieve (either a token or AUT)
//    `amountA_desired` - The prefered value of the first token that the user would like to deploy as liquidity
//    `amountB_desired` - The prefered value of the second token that the user would like to deploy as liquidity
//    `factory` - The current factory
//    `signer` - The current signer

async function quoteMintLiquidity(
  address1,
  address2,
  amountA,
  amountB,
  factory,
  signer
){
  const MINIMUM_LIQUIDITY = 1000;
  let _reserveA = 0;
  let _reserveB = 0;
  let totalSupply = 0;
  [_reserveA, _reserveB, totalSupply] = await factory.getPair(address1, address2).then(async (pairAddress) => {
    if (pairAddress !== '0x0000000000000000000000000000000000000000'){
      const pair = new Contract(pairAddress, PAIR.abi, signer);

      const reservesRaw = await fetchReserves(address1, address2, pair, signer); // Returns the reserves already formated as ethers
      const reserveA = reservesRaw[0];
      const reserveB = reservesRaw[1];
    
      const _totalSupply = await pair.totalSupply();
      const totalSupply = Number(ethers.utils.formatEther(_totalSupply));
      return [reserveA, reserveB, totalSupply]
    } else {
      return [0,0,0]
    }
  });

  const token1 = new Contract(address1, ERC20.abi, signer);
  const token2 = new Contract(address2, ERC20.abi, signer);

  // Need to do all this decimals work to account for 0 decimal numbers

  const token1Decimals = await getDecimals(token1);
  const token2Decimals = await getDecimals(token2);

  const valueA = amountA*(10**token1Decimals);
  const valueB = amountB*(10**token2Decimals);

  const reserveA = _reserveA*(10**token1Decimals);
  const reserveB = _reserveB*(10**token2Decimals);

  if (totalSupply == 0){
    return Math.sqrt(((valueA * valueB)-MINIMUM_LIQUIDITY))*10**(-18);
  };
  
  return (
    Math.min(valueA*totalSupply/reserveA, valueB*totalSupply/reserveB)
  );
};

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

  const reservesRaw = await fetchReserves(address1, address2, pair, signer); // Returns the reserves already formated as ethers
  const reserveA = reservesRaw[0];
  const reserveB = reservesRaw[1];

  if (reserveA === 0 && reserveB === 0) {
    const amountOut = await quoteMintLiquidity(
      address1,
      address2,
      amountADesired,
      amountBDesired,
      factory,
      signer);
    return [
      amountADesired,
      amountBDesired,
      amountOut.toPrecision(8),
    ];
  } else {
    const amountBOptimal = quote(amountADesired, reserveA, reserveB);
    if (amountBOptimal <= amountBDesired) {
      const amountOut = await quoteMintLiquidity(
        address1,
        address2,
        amountADesired,
        amountBOptimal,
        factory,
        signer);
      return [
        amountADesired,
        amountBOptimal,
        amountOut.toPrecision(8),
      ];
    } else {
      const amountAOptimal = quote(
        amountBDesired,
        reserveB,
        reserveA
      );
      const amountOut = await quoteMintLiquidity(
        address1,
        address2,
        amountAOptimal,
        amountBDesired,
        factory,
        signer);
      return [
        amountAOptimal,
        amountBDesired,
        amountOut.toPrecision(8),
      ];
    }
  }
}

// Function used to get a quote of the liquidity removal
//    `address1` - An Ethereum address of the coin to recieve (either a token or AUT)
//    `address2` - An Ethereum address of the coin to recieve (either a token or AUT)
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

  const reservesRaw = await fetchReserves(address1, address2, pair, signer); // Returns the reserves already formated as ethers
  const reserveA = reservesRaw[0];
  const reserveB = reservesRaw[1];

  const feeOn =
    (await factory.feeTo()) !== 0x0000000000000000000000000000000000000000;

  const _kLast = await pair.kLast();
  const kLast = Number(ethers.utils.formatEther(_kLast));

  const _totalSupply = await pair.totalSupply();
  let totalSupply = Number(ethers.utils.formatEther(_totalSupply));

  if (feeOn && kLast > 0) {
    const feeLiquidity =
      (totalSupply * (Math.sqrt(reserveA * reserveB) - Math.sqrt(kLast))) /
      (5 * Math.sqrt(reserveA * reserveB) + Math.sqrt(kLast));
    totalSupply = totalSupply + feeLiquidity;
  }

  const Aout = (reserveA * liquidity) / totalSupply;
  const Bout = (reserveB * liquidity) / totalSupply;

  return [liquidity, Aout, Bout];
}
