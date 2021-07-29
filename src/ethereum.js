import {Contract, ethers} from "ethers";
import {Component} from "react";

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

export async function getTokenDate(account, address, signer) {
  try {
    const token = new Contract(address, ERC20.abi, signer);

    const balance0 = await token.balanceOf(account);
    const balance1 = ethers.utils.formatEther(balance0);
    const symbol = await token.symbol();

    return {
      token: token,
      balance: balance1,
      symbol: symbol
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

export async function swapTokenForToken(address1, address2, amount, router, account) {
  const tokens = [address1, address2];
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const amountIn = ethers.utils.parseEther(amount.toString());
  const amountOut = await router.callStatic.getAmountsOut(amountIn, tokens);

  const token = new Contract(address1, ERC20.abi, getSigner(getProvider()))
  await token.approve(router.address, amountIn);

  await router.callStatic.swapExactTokensForTokens(
      amountIn,
      amountOut[1],
      tokens,
      account,
      deadline
  );
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
