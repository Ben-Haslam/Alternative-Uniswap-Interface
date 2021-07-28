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
      reserves_A_B: [undefined, undefined],
      Liquidity_transfer: [0, 0, 0],
      amountInETH: 0,
      amountAMin: 0,
      amountBMin: 0,
      amountETHMin: 0,
      Token: "",

      Router_address: "0x4489D87C8440B19f11d63FA2246f943F492F3F5F",
      Router: undefined,
      Factory_address: "0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116",
      Factory: undefined,
      reserves_A: 0,
      reserves_B: 0,
      Weth_address: "0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF",
      Weth: undefined,
    };
  }

  componentWillMount() {
    this.loadBlockchainData();
  }

  async addLiquidity() {
    const amountInA = ethers.utils.parseEther(this.state.amountInA.toString());
    const amountInB = ethers.utils.parseEther(this.state.amountInB.toString());

    const amountAMin = ethers.utils.parseEther(
      this.state.amountAMin.toString()
    );
    const amountBMin = ethers.utils.parseEther(
      this.state.amountBMin.toString()
    );

    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);

    await this.state.TokenA.approve(this.state.Router_address, amountInA);
    await this.state.TokenB.approve(this.state.Router_address, amountInB);

    await this.state.Router.addLiquidity(
      this.state._TokenA_address,
      this.state._TokenB_address,
      amountInA,
      amountInB,
      amountAMin,
      amountBMin,
      this.state.account,
      deadline
    );
  }

  async addLiquidityTest() {
    const amountInA = ethers.utils.parseEther(this.state.amountInA.toString());
    const amountInB = ethers.utils.parseEther(this.state.amountInB.toString());

    const amountAMin = ethers.utils.parseEther(
      this.state.amountAMin.toString()
    );
    const amountBMin = ethers.utils.parseEther(
      this.state.amountBMin.toString()
    );

    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);

    console.log("Balls");

    await this.state.Router.callStatic.addLiquidity(
      this.state._TokenA_address,
      this.state._TokenB_address,
      amountInA,
      amountInB,
      amountAMin,
      amountBMin,
      this.state.account,
      deadline
    ).then((values) => {
      console.log(values);

      const liquidity0 = ethers.utils.formatEther(values[0]);
      const liquidity1 = ethers.utils.formatEther(values[1]);
      const liquidity2 = ethers.utils.formatEther(values[2]);

      console.log("tokenA in: ", ethers.utils.formatEther(values[0]));
      console.log("tokenB in: ", ethers.utils.formatEther(values[1]));
      console.log(
        "liquidity tokens out: ",
        ethers.utils.formatEther(values[2])
      );

      this.setState({ Liquidity_transfer: [liquidity0, liquidity1, liquidity2] });

    });


  }

  handleSubmit = {
    submitA: (e) => {
      e.preventDefault();
      this.getTokenAData(this.state._TokenA_address);
    },

    submitB: (e) => {
      e.preventDefault();
      this.getTokenBData(this.state._TokenB_address);
    },

    deployLiquidityTest: (e) => {
      e.preventDefault();
      this.addLiquidityTest();
    },

    deployLiquidity: (e) => {
      e.preventDefault();
      this.addLiquidity();
    },

    getReserves: (e) => {
      e.preventDefault();
      if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
        this.getPair(
            this.state._TokenA_address,
            this.state._TokenB_address
        ).then((values) => {
          this.setState({
            reserves_A_B: values,
          });
        });
      }
    }
  }

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

        {/* Token A */}
        <div className="outer">
          <div className="container">
            <h4> Token A</h4>

            <form
              class="myform"
              name="SubmitA"
              onSubmit={this.handleSubmit.submitA}
            >
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

        {/* Token B */}
        <div className="outer">
          <div className="container">
            <h4> Token B</h4>

            <form
              className="myform"
              name="SubmitB"
              onSubmit={this.handleSubmit.submitB}
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

        {/* Deploy liquidity */}
        <div className="outer">
          <div className="container">
            <h4> Deploy A/B liquidity </h4>

            <form
              className="myform"
              name="GetReserves"
              onSubmit={this.handleSubmit.getReserves}
            >
              <p> Token A reserves: {this.state.reserves_A_B[0]}</p>
              <p> Token B reserves: {this.state.reserves_A_B[1]}</p>
              <input type="submit" value="Get Reserves" />
            </form>

            <form
              className="myform"
              name="Deploy Liquidity Test"
              onSubmit={this.handleSubmit.deployLiquidityTest}
            >
              <input
                type="text"
                name="amountInA"
                placeholder="Amount in Token A"
                onChange={this.handleInputChange}
              />

              <input
                type="text"
                name="amountInB"
                placeholder="Amount in Token B"
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Submit" />
            </form>

            <form
              className="myform"
              name="Deploy Liquidity"
              onSubmit={this.handleSubmit.deployLiquidity}
            >
              <p> TokenA in: {this.state.Liquidity_transfer[0]}</p>
              <p> TokenB in: {this.state.Liquidity_transfer[1]}</p>
              <p> Liquidity tokens out: {this.state.Liquidity_transfer[1]}</p>
              <input type="submit" value="Deploy Liquidity" />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Liquidity;
