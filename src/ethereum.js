import {Contract, ethers} from "ethers";
import {Component} from "react";

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

  doesTokenExist(address) {
    try {
      return new Contract(address, ERC20.abi, this.state.signer)
    }
    catch (err) {
      return false
    }
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
