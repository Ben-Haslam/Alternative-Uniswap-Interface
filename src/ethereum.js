import { ethers, Contract } from "ethers";
import { Component } from "react";
const ROUTER = require("./build/UniswapV2Router02.json");
const ERC20 = require("./build/ERC20.json");
const FACTORY = require("./build/IUniswapV2Factory.json");
const PAIR = require("./build/IUniswapV2Pair.json");

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

  async getPair() {
    if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
      const Factory = this.state.Factory;
      const pairAddress = await Factory.getPair(
        this.state._TokenA_address,
        this.state._TokenB_address
      );

      const pair = new Contract(pairAddress, PAIR.abi, this.state.signer);
      const reserves = await pair.getReserves();

      console.log(
        "reserves for token A",
        ethers.utils.formatEther(reserves[0])
      );
      console.log(
        "reserves for token B",
        ethers.utils.formatEther(reserves[1])
      );

      this.setState({ reserves_A: ethers.utils.formatEther(reserves[0]) });
      this.setState({ reserves_B: ethers.utils.formatEther(reserves[1]) });
    }
  }

  async getPairETH(token) {
    if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
      const Factory = this.state.Factory;
      const pairAddress = await Factory.getPair(
        this.state._TokenA_address,
        this.state._TokenB_address
      );

      const pair = new Contract(pairAddress, PAIR.abi, this.state.signer);
      const reserves = await pair.getReserves();

      console.log(
        "reserves for token A",
        ethers.utils.formatEther(reserves[0])
      );
      console.log(
        "reserves for token B",
        ethers.utils.formatEther(reserves[1])
      );

      this.setState({ reserves_A: ethers.utils.formatEther(reserves[0]) });
      this.setState({ reserves_B: ethers.utils.formatEther(reserves[1]) });
    }
  }
}

export default _App;
