import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";

class App extends _App {
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

  async SwapTokenforToken() {
    let amountIn = ethers.utils.parseEther(this.state.amountIn.toString());
    let amountOut = ethers.utils.parseEther(
      this.state.amount_out[1].toString()
    );
    await this.state.TokenA.approve(this.state.Router_address, amountIn);

    let tokens = [this.state._TokenA_address, this.state._TokenB_address];
    let time = Math.floor(Date.now() / 1000) + 200000;
    let deadline = ethers.BigNumber.from(time);

    await this.state.Router.swapExactTokensForTokens(
      amountIn,
      amountOut,
      tokens,
      this.state.account,
      deadline
    );

    await this.getTokenAData(this.state._TokenA_address);
    await this.getTokenBData(this.state._TokenB_address);
    await this.getSwap();
  }

  async SwapTokenforEth() {
    let amountIn = ethers.utils.parseEther(this.state.amountIn.toString());
    let amountOut = ethers.utils.parseEther(
      this.state.amount_out[2].toString()
    );
    await this.state.TokenA.approve(this.state.Router_address, amountIn);

    let tokens = [this.state._TokenA_address, this.state.Weth_address];
    let time = Math.floor(Date.now() / 1000) + 200000;
    let deadline = ethers.BigNumber.from(time);

    await this.state.Router.swapExactTokensForETH(
      amountIn,
      amountOut,
      tokens,
      this.state.account,
      deadline
    );

    await this.loadBlockchainData();
    await this.getTokenAData(this.state._TokenA_address);
    await this.getSwap();
  }

  async getSwap() {
    if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
      let tokens = [
        this.state._TokenA_address,
        this.state._TokenB_address,
        this.state.Weth_address,
      ];

      let amount_in = ethers.utils.parseEther(this.state.amountIn.toString());
      let amount_out = await this.state.Router.getAmountsOut(amount_in, tokens);
      let amount_out0 = ethers.utils.formatEther(amount_out[0]);
      let amount_out1 = ethers.utils.formatEther(amount_out[1]);
      let amount_out2 = ethers.utils.formatEther(amount_out[2]);
      let amount_out_A = [amount_out0, amount_out1, amount_out2];
      console.log(amount_out_A);
      this.setState({ amount_out: amount_out_A });
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (event.target.name === "SubmitA") {
      this.getTokenAData(this.state._TokenA_address);
      this.getSwap();
    }
    if (event.target.name === "SubmitB") {
      this.getTokenBData(this.state._TokenB_address);
      this.getSwap();
    }
    if (event.target.name === "SubmitSwap") {
      this.getSwap();
    }
    if (event.target.name === "swapB") {
      console.log("Swap B!");
      this.SwapTokenforToken();
    }
    if (event.target.name === "swapE") {
      console.log("Swap E!");
      this.SwapTokenforEth();
    }
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
            <h4> Uniswap Autonity App</h4>
            <p> Your account: {this.state.account} </p>
            <p> Your balance: {this.state.balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Token A</h4>

            <form class="myform" name="SubmitA" onSubmit={this.handleSubmit}>
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

            <form
              className="myform"
              name="SubmitB"
              onSubmit={this.handleSubmit}
            >
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

        {/* Submit amount */}
        <div className="outer">
          <div className="container">
            <h4> Swap</h4>
            <form
              className="myform"
              name="SubmitSwap"
              onSubmit={this.handleSubmit}
            >
              <input
                type="text"
                name="amountIn"
                placeholder="enter input amount"
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Submit" />
            </form>

            {/* Swap B */}
            <form className="swap" name="swapB" onSubmit={this.handleSubmit}>
              <label>Token B out: {this.state.amount_out[1]}</label>
              <input
                className="swap_button"
                name="swapB"
                type="submit"
                value="Swap"
              />
            </form>

            {/* Swap ETH */}
            <form className="swap" name="swapE" onSubmit={this.handleSubmit}>
              <label>ETH out: {this.state.amount_out[2]}</label>
              <input
                className="swap_button"
                name="swapE"
                type="submit"
                value="Swap"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
