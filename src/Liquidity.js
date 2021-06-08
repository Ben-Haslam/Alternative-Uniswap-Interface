import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";

class Liquidity extends _App {
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
    };
  }

  componentWillMount() {
    this.loadBlockchainData();
  }

  handleSubmit = (event) => {
    event.preventDefault();
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
            <h4> Deploy liquidity</h4>
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
      </div>
    );
  }
}

export default Liquidity;
