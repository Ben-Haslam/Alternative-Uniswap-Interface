import {Contract, ethers} from "ethers";
import {Component} from "react";
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
  return new Contract(
      address,
      ROUTER.abi,
      signer
  );
}

export function getWeth(address, signer) {
  return new Contract(
      address,
      ERC20.abi,
      signer
  );
}

export function getFactory(address, signer) {
  return new Contract(
      address,
      FACTORY.abi,
      signer
  );
}

export async function getAccount() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

export async function getConversionRate(router, token1_address, token2_address) {
  try {
    const amount_out = await router.getAmountsOut(ethers.utils.parseEther("1"), [token1_address, token2_address]);
    const rate = ethers.utils.formatEther(amount_out[1]);
    return Number(rate);
  }
  catch {
    return false;
  }
}

// This function returns an object with 2 fields: `balance` which container's the account's balance in the particular currency,
// and `symbol` which is the abbreviation of the token name. To work correctly it must be provided with 4 arguments:
//    `accountAddress` - An Ethereum address of the current user's account
//    `address` - An Ethereum address of the currency to check for (either a token or AUT)
//    `provider` - The current provider
//    `signer` - The current signer
export async function getBalanceAndSymbol(accountAddress, address, provider, signer) {
  try {
    if (address === COINS.AUTONITY.address) {
      const balanceRaw = await provider.getBalance(accountAddress);

      return {
        balance: ethers.utils.formatEther(balanceRaw),
        symbol: COINS.AUTONITY.abbr
      }
    }
    else {
      const token = new Contract(address, ERC20.abi, signer);
      const balanceRaw = await token.balanceOf(accountAddress);
      const symbol = await token.symbol();

      return {
        balance: ethers.utils.formatEther(balanceRaw),
        symbol: symbol
      }
    }
  }
  catch (err) {
    return false
  }
}

export function doesTokenExist(address, signer) {
  try {
    return new Contract(address, ERC20.abi, signer)
  }
  catch (err) {
    return false
  }
}

// This function swaps two particular currencies, it can handle switching from Eth to Token, Token to Eth, and Token to Token.
// No error handling is done, so any issues can be caught with the use of .catch()
// To work correctly, there needs to be 7 arguments:
//    `address1` - An Ethereum address of the currency to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the currency to trade to (either a token or AUT)
//    `amount` - A float or similar number representing how many of address1's currency to trade
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `provider` - The current provider
//    `signer` - The current signer
export async function swapCurrency(address1, address2, amount, routerContract, accountAddress, provider, signer) {
  const currencies = [address1, address2];
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const amountIn = ethers.utils.parseEther(amount.toString());
  const amountOut = await routerContract.callStatic.getAmountsOut(amountIn, currencies);

  const currency1 = new Contract(address1, ERC20.abi, signer)
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
  }
  else if (address2 === COINS.AUTONITY.address) {
    // Token -> Eth
    await routerContract.swapExactTokensForETH(
        amountIn,
        amountOut[1],
        currencies,
        accountAddress,
        deadline
    );
  }
  else {
    await routerContract.swapExactTokensForTokens(
        amountIn,
        amountOut[1],
        currencies,
        accountAddress,
        deadline
    );
  }
}

export class _App extends Component {
  async loadBlockchainData() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let balance_0 = await provider.getBalance(accounts[0]);
    let balance_1 = ethers.utils.formatEther(balance_0);

    this.setState({ account: accounts[0] });
    this.setState({ provider: provider });
    this.setState({ signer: signer });
    this.setState({ balance: balance_1 });

    const Router = new Contract(
        this.state.Router_address,
        ROUTER.abi,
        this.state.signer
    );

    const Weth = new Contract(
        this.state.Weth_address,
        ERC20.abi,
        this.state.signer
    );

    const Factory = new Contract(
        this.state.Factory_address,
        FACTORY.abi,
        this.state.provider
    );

    this.setState({ Router: Router });
    this.setState({ Weth: Weth });
    this.setState({ Factory: Factory });
  }

  async getTokenAData(address) {
    try {
      const TokenA = new Contract(address, ERC20.abi, this.state.signer);

      const TokenA_balance_0 = await TokenA.balanceOf(this.state.account);
      const TokenA_balance_1 = ethers.utils.formatEther(TokenA_balance_0);
      const TokenA_symbol = await TokenA.symbol();

      this.setState({ TokenA_balance: TokenA_balance_1 });
      this.setState({ TokenA: TokenA });
      document.getElementById("TokenA_message").innerHTML =
          TokenA_symbol.concat(" balance: ");
    } catch (err) {
      document.getElementById("TokenA_message").innerHTML =
          "Error: Please enter a valid token address";
    }
  }

  async getTokenBData(address) {
    try {
      const TokenB = new Contract(address, ERC20.abi, this.state.signer);

      const TokenB_balance_0 = await TokenB.balanceOf(this.state.account);
      const TokenB_balance_1 = ethers.utils.formatEther(TokenB_balance_0);
      const TokenB_symbol = await TokenB.symbol();

      this.setState({ TokenB_balance: TokenB_balance_1 });
      this.setState({ TokenB: TokenB });
      document.getElementById("TokenB_message").innerHTML =
          TokenB_symbol.concat(" balance: ");
    } catch (err) {
      document.getElementById("TokenB_message").innerHTML =
          "Error: Please enter a valid token address";
    }
  }

  async getPair(address0, address1) {
    if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
      const Factory = this.state.Factory;
      const pairAddress = await Factory.getPair(address0, address1);

      const pair = new Contract(pairAddress, PAIR.abi, this.state.signer);
      const reserves_BN = await pair.getReserves();

      const reserves0 = Number(
          ethers.utils.formatEther(reserves_BN[0])
      ).toFixed(2);
      const reserves1 = Number(
          ethers.utils.formatEther(reserves_BN[1])
      ).toFixed(2);

      return [reserves0, reserves1];
    }
  }
}

export default _App;
