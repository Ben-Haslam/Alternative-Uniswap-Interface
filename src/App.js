import React, { Component, useState } from "react";
import "./App.css";
import { ethers, Contract } from "ethers";

const ROUTER = require("./build/UniswapV2Router02.json");
const ERC20 = require("./build/ERC20.json");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      provider: undefined,
      signer: undefined,
      balance: undefined,
      _TokenA_address: undefined,
      _TokenB_address: undefined,
      TokenA: undefined,
      TokenB: undefined,
      TokenA_balance: undefined,
      TokenB_balance: undefined,
      Token: "",
      Router_address: "0x4489D87C8440B19f11d63FA2246f943F492F3F5F",
      Router: undefined,
      Weth_address: "0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF",
      amountIn: 0,
      amount_out: [undefined, undefined, undefined],
    };
  }

  componentWillMount() {
    this.loadBlockchainData();
  }

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

  async getSwap() {
    if (this.state.TokenA !== undefined && this.state.TokenA !== undefined) {
      let tokens = [
        this.state._TokenA_address,
        this.state._TokenB_address,
        this.state.Weth_address,
      ];

      let amount_in = ethers.utils.parseEther(this.state.amountIn.toString());
      console.log(amount_in);
      let amount_out = await this.state.Router.getAmountsOut(amount_in, tokens);
      console.log(amount_out);
      let amount_out0 = ethers.utils.formatEther(amount_out[0]);
      let amount_out1 = ethers.utils.formatEther(amount_out[1]);
      let amount_out2 = ethers.utils.formatEther(amount_out[2]);
      let amount_out_A = [amount_out0, amount_out1, amount_out2];
      console.log(amount_out_A);
      this.setState({ amount_out: amount_out_A });
    }
  }

  handleSubmitA = (event) => {
    event.preventDefault();
    this.getTokenAData(this.state._TokenA_address);
    this.getSwap();
  };

  handleSubmitB = (event) => {
    event.preventDefault();
    this.getTokenBData(this.state._TokenB_address);
    this.getSwap();
  };

  handleSubmitSwap = (event) => {
    event.preventDefault();
    this.getSwap();
  };

  handleMakeSwap = (event) => {
    event.preventDefault();
    console.log("Swap!");
  };

  handleInputChange = (event) => {
    event.preventDefault();
    this.setState({
      Token: event.target.name,
      [event.target.name]: event.target.value,
    });
  };

  render() {
    return (
      <div>
        <div className="outer">
          <div className="container">
            <h4> React Blockchain App</h4>
            <p> Your account: {this.state.account} </p>
            <p> Your balance: {this.state.balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Token A</h4>

            <form class="myform" onSubmit={this.handleSubmitA}>
              <input
                type="text"
                name="_TokenA_address"
                placeholder="enter token address"
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Submit" />
            </form>

            <p class="Token_message" id="TokenA_message"></p>
            <p class="Token_message"> {this.state.TokenA_balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Token B</h4>

            <form className="myform" onSubmit={this.handleSubmitB}>
              <input
                type="text"
                name="_TokenB_address"
                placeholder="enter token address"
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Submit" />
            </form>

            <p className="Token_message" id="TokenB_message"></p>
            <p className="Token_message"> {this.state.TokenB_balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Swap</h4>
            <form className="myform" onSubmit={this.handleSubmitSwap}>
              <input
                type="text"
                name="amountIn"
                placeholder="enter input amount"
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Submit" />
            </form>

            <form className="swap" onSubmit={this.handleSubmitSwap()}>
              <p>
                Token B out: {this.state.amount_out[1]}{" "}
                <input
                  className="swap_button"
                  type="submit"
                  value="Make swap"
                />
              </p>
            </form>

            <form className="swap" onSubmit={this.handleSubmitSwap()}>
              <p>
                ETH out: {this.state.amount_out[2]}{" "}
                <input
                  className="swap_button"
                  type="submit"
                  value="Make swap"
                />
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
