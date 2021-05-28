import { ethers, Contract } from "ethers";
import { Component } from "react";
const ROUTER = require("./build/UniswapV2Router02.json");
const ERC20 = require("./build/ERC20.json");

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
    this.setState({ Router: Router });
  }

  async getTokenAData(address) {
    try {
      let TokenA = new Contract(address, ERC20.abi, this.state.signer);

      let TokenA_balance_0 = await TokenA.balanceOf(this.state.account);
      let TokenA_balance_1 = ethers.utils.formatEther(TokenA_balance_0);
      let TokenA_symbol = await TokenA.symbol();

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
      let TokenB = new Contract(address, ERC20.abi, this.state.signer);

      let TokenB_balance_0 = await TokenB.balanceOf(this.state.account);
      let TokenB_balance_1 = ethers.utils.formatEther(TokenB_balance_0);
      let TokenB_symbol = await TokenB.symbol();

      this.setState({ TokenB_balance: TokenB_balance_1 });
      this.setState({ TokenB: TokenB });
      document.getElementById("TokenB_message").innerHTML =
        TokenB_symbol.concat(" balance: ");
    } catch (err) {
      document.getElementById("TokenB_message").innerHTML =
        "Error: Please enter a valid token address";
    }
  }
}

export default _App;
