import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";

class Swap extends _App {
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
      Weth: undefined,
      amountIn: 0,
      amount_out: [undefined, undefined, undefined],
      amountInE: 0,
      amount_outE: [undefined, undefined, undefined],
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

  async SwapEthforToken(K, Token_Address) {
    let amountIn = ethers.utils.parseEther(this.state.amountInE.toString());
    let amountOut = ethers.utils.parseEther(
      this.state.amount_outE[K].toString()
    );
    await this.state.Weth.approve(this.state.Router_address, amountIn);

    let tokens = [this.state.Weth_address, Token_Address];
    let time = Math.floor(Date.now() / 1000) + 200000;
    let deadline = ethers.BigNumber.from(time);

    await this.state.Router.swapExactETHForTokens(
      amountOut,
      tokens,
      this.state.account,
      deadline,
      { value: amountIn }
    );
  }

  async getSwapE() {
    if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
      let tokens = [
        this.state.Weth_address,
        this.state._TokenA_address,
        this.state._TokenB_address,
      ];

      let amount_in = ethers.utils.parseEther(this.state.amountInE.toString());
      let amount_out = await this.state.Router.getAmountsOut(amount_in, tokens);
      let amount_out0 = ethers.utils.formatEther(amount_out[0]);
      let amount_out1 = ethers.utils.formatEther(amount_out[1]);
      let amount_out2 = ethers.utils.formatEther(amount_out[2]);
      let amount_out_A = [amount_out0, amount_out1, amount_out2];
      console.log(amount_out_A);
      this.setState({ amount_outE: amount_out_A });
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
    if (event.target.name === "swapAB") {
      console.log("Swap B!");
      this.SwapTokenforToken();
    }
    if (event.target.name === "swapAE") {
      console.log("Swap E!");
      this.SwapTokenforEth();
    }
    if (event.target.name === "SubmitSwapE") {
      this.getSwapE();
      console.log("Get swap E");
    }
    if (event.target.name === "swapEA") {
      console.log("Swap A!");
      this.SwapEthforToken(1, this.state._TokenA_address);
    }
    if (event.target.name === "swapEB") {
      console.log("Swap B!");
      this.SwapEthforToken(2, this.state._TokenA_address);
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

        {/* Swap Token A */}
        <div className="outer">
          <div className="container">
            <h4> Swap Token</h4>
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

            {/* Swap for B */}
            <form className="swap" name="swapAB" onSubmit={this.handleSubmit}>
              <label>Token B out: {this.state.amount_out[1]}</label>
              <input className="swap_button" type="submit" value="Swap" />
            </form>

            {/* Swap for ETH */}
            <form className="swap" name="swapAE" onSubmit={this.handleSubmit}>
              <label>ETH out: {this.state.amount_out[2]}</label>
              <input className="swap_button" type="submit" value="Swap" />
            </form>
          </div>
        </div>

        {/* Swap ETH */}
        <div className="outer">
          <div className="container">
            <h4> Swap ETH</h4>
            <form
              className="myform"
              name="SubmitSwapE"
              onSubmit={this.handleSubmit}
            >
              <input
                type="text"
                name="amountInE"
                placeholder="enter input amount"
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Submit" />
            </form>

            {/* Swap for A */}
            <form className="swap" name="swapEA" onSubmit={this.handleSubmit}>
              <label>Token A out: {this.state.amount_outE[1]}</label>
              <input className="swap_button" type="submit" value="Swap" />
            </form>

            {/* Swap for B */}
            <form className="swap" name="swapEB" onSubmit={this.handleSubmit}>
              <label>Token B out: {this.state.amount_outE[2]}</label>
              <input className="swap_button" type="submit" value="Swap" />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Swap;
