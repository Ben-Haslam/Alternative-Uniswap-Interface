import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";
import {Button} from "@material-ui/core";
import CurrencyDialog from "./CurrencySwapper/CurrencyDialog";
import * as COINS from "./constants/coins";

class Swap extends _App {
  constructor(props) {
    super(props);
    this.state = {
      dialog1Open: false,
      dialog2Open: false,

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
      Factory_address: "0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116",
      Factory: undefined,
      reserves_A_B: [0, 0],
      reserves_A_AUT: [0, 0],
      reserves_B_AUT: [0, 0],
      price_out: [0, 0, 0],
      price_out_AUT: [0, 0, 0],

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

  async SwapTokenforToken(Token1, Token2, _amountIn, _amount_out) {
    const amountIn = ethers.utils.parseEther(_amountIn.toString());
    const amountOut = ethers.utils.parseEther(_amount_out.toString());
    await Token1.approve(this.state.Router_address, amountIn);

    const tokens = [Token1.address, Token2.address];
    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);

    await this.state.Router.swapExactTokensForTokens(
      amountIn,
      amountOut,
      tokens,
      this.state.account,
      deadline
    );
  }

  async SwapTokenforEth(Token1, Token2, _amountIn, _amount_out) {
      const amountIn = ethers.utils.parseEther(_amountIn.toString());
      const amountOut = ethers.utils.parseEther(_amount_out.toString());
      await Token1.approve(this.state.Router_address, amountIn);
  
      const tokens = [Token1.address, Token2.address];
      const time = Math.floor(Date.now() / 1000) + 200000;
      const deadline = ethers.BigNumber.from(time);

    await this.state.Router.swapExactTokensForETH(
      amountIn,
      amountOut,
      tokens,
      this.state.account,
      deadline
    );
  }

  async getSwap(_amount_in, tokens) {
    if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
      const amount_in = ethers.utils.parseEther(_amount_in);
      // Find amount out for token 0 -> token 1
      const amount_out_1 = await this.state.Router.getAmountsOut(
        amount_in,
        [tokens[0], tokens[1]]
      );
      // Find amount out for token 0 -> token 2
      const amount_out_2 = await this.state.Router.getAmountsOut(
        amount_in,
        [tokens[0], tokens[2]]
      );

      const amount_out0 = ethers.utils.formatEther(amount_in);
      const amount_out1 = ethers.utils.formatEther(amount_out_1[1]);
      const amount_out2 = ethers.utils.formatEther(amount_out_2[1]);

      const amount_out_A = [amount_out0, amount_out1, amount_out2];
      return amount_out_A;
    }
  }

  async SwapEthforToken(K, Token_Address) {
    const amountIn = ethers.utils.parseEther(this.state.amountInE.toString());
    const amountOut = ethers.utils.parseEther(
      this.state.amount_outE[K].toString()
    );
    await this.state.Weth.approve(this.state.Router_address, amountIn);

    const tokens = [this.state.Weth_address, Token_Address];
    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);

    await this.state.Router.swapExactETHForTokens(
      amountOut,
      tokens,
      this.state.account,
      deadline,
      { value: amountIn }
    );
  }

  handleSubmit = {
    submitA: (address) => {
      this.getTokenAData(address);
    },

    submitB: (address) => {
      this.getTokenBData(address);
    },

    submitSwap: (e) => {
      e.preventDefault();
      let tokens = [
        this.state._TokenA_address,
        this.state._TokenB_address,
        this.state.Weth_address,
      ];

      this.getSwap(this.state.amountIn.toString(), tokens).then((values) => {
        this.setState({ amount_out: values });
      });
    },

    swapAB: (e) => {
      e.preventDefault();
      console.log("Swap B!");
      this.SwapTokenforToken(
        this.state.TokenA,
        this.state.TokenB,
        this.state.amountIn,
        this.state.amount_out[1]
      );
    },

    swapAE: (e) => {
      e.preventDefault();
      console.log("Swap E!");
      this.SwapTokenforEth(
        this.state.TokenA,
        this.state.Weth,
        this.state.amountIn,
        this.state.amount_out[2]
      );
    },

    submitSwapE: (e) => {
      e.preventDefault();
      let tokens = [
        this.state.Weth_address,
        this.state._TokenA_address,
        this.state._TokenB_address,
      ];

      this.getSwap(this.state.amountInE.toString(), tokens).then((values) => {
        this.setState({ amount_outE: values });
      });
      console.log("Get swap E");
    },

    swapEA: (e) => {
      e.preventDefault();
      console.log("Swap A!");
      this.SwapEthforToken(1, this.state._TokenA_address);
    },

    swapEB: (e) => {
      e.preventDefault();
      console.log("Swap B!");
      this.SwapEthforToken(2, this.state._TokenA_address);
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

        const tokens = [
          this.state._TokenA_address,
          this.state._TokenB_address,
          this.state.Weth_address,
        ];

        this.getSwap("1", tokens).then((values) => {
          values[0] = Number(values[0]).toFixed(6);
          values[1] = Number(values[1]).toFixed(6);
          values[2] = Number(values[2]).toFixed(6);
          this.setState({ price_out: values });
        });
      }
    },

    getReserves_AUT: (e) => {
      e.preventDefault();
      if (this.state.TokenA !== undefined && this.state.TokenB !== undefined) {
        this.getPair(this.state._TokenA_address, this.state.Weth_address).then(
            (values) => {
              this.setState({
                reserves_A_AUT: values,
              });
            }
        );

        this.getPair(this.state._TokenB_address, this.state.Weth_address).then(
            (values) => {
              this.setState({
                reserves_B_AUT: values,
              });
            }
        );

        const tokens = [
          this.state.Weth_address,
          this.state._TokenA_address,
          this.state._TokenB_address,
        ];

        this.getSwap("1", tokens).then((values) => {
          values[0] = Number(values[0]).toFixed(6);
          values[1] = Number(values[1]).toFixed(6);
          values[2] = Number(values[2]).toFixed(6);
          this.setState({price_out_AUT: values});
        });
      }
    }
  };

  handleInputChange = (event) => {
    event.preventDefault();
    this.setState({
      Token: event.target.name,
      [event.target.name]: event.target.value,
    });
  };

  onToken1Selected = (address) => {
    this.setState({ dialog1Open: false })
    if (address) {
      this.setState({ _TokenA_address: address });
      this.handleSubmit.submitA(address);
    }
  }

  onToken2Selected = (address) => {
    this.setState({ dialog2Open: false })
    if (address) {
      this.setState({ _TokenB_address: address });
      this.handleSubmit.submitB(address);
    }
  }

  render() {
    return (
      <div>
        <CurrencyDialog open={this.state.dialog1Open} coins={COINS.ALL} onClose={this.onToken1Selected.bind(this)}/>
        <CurrencyDialog open={this.state.dialog2Open} coins={COINS.ALL} onClose={this.onToken2Selected.bind(this)}/>

        <div className="outer">
          <div className="container">
            <h4> Swap tokens / AUT</h4>
            <p> Your account: {this.state.account} </p>
            <p> Your balance: {this.state.balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Token A</h4>

            <Button
                color="primary"
                onClick={() => this.setState({dialog1Open: true})}
            >
              Select Token
            </Button>

            <p class="Token_message" id="TokenA_message"></p>
            <p class="Token_message"> {this.state.TokenA_balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Token B</h4>

              <Button
                  color="primary"
                  onClick={() => this.setState({dialog2Open: true})}
              >
                Select Token
              </Button>

            <p className="Token_message" id="TokenB_message"></p>
            <p className="Token_message"> {this.state.TokenB_balance}</p>
          </div>
        </div>

        {/* Swap Token A */}
        <div className="outer">
          <div className="container">
            <h4> Swap Token A</h4>

            {/* Get Reserves & price */}
            <form
              className="column"
              name="GetReserves"
              onSubmit={this.handleSubmit.getReserves}
            >
              <p> Token A reserves: {this.state.reserves_A_B[0]}</p>
              <p> Token B reserves: {this.state.reserves_A_B[1]}</p>
              <input type="submit" value="Get Reserves" />
            </form>

            <div className="column">
              <p> Token A / B price: {this.state.price_out[1]}</p>
              <p> Token A/AUT price: {this.state.price_out[2]}</p>
            </div>

            <form
              className="myform"
              name="SubmitSwap"
              onSubmit={this.handleSubmit.submitSwap}
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
            <form className="swap" name="swapAB" onSubmit={this.handleSubmit.swapAB}>
              <label>Token B out: {this.state.amount_out[1]}</label>
              <input className="swap_button" type="submit" value="Swap" />
            </form>

            {/* Swap for AUT */}
            <form className="swap" name="swapAE" onSubmit={this.handleSubmit.swapAE}>
              <label>AUT out: {this.state.amount_out[2]}</label>
              <input className="swap_button" type="submit" value="Swap" />
            </form>
          </div>
        </div>

        {/* Swap AUT */}
        <div className="outer">
          <div className="container">
            <h4> Swap AUT</h4>

            {/* Get Reserves & price */}
            <form
              className="column_aut"
              name="GetReserves_AUT"
              onSubmit={this.handleSubmit.getReserves_AUT}
            >
              <p> Token A reserves: {this.state.reserves_A_AUT[0]}</p>
              <p> AUT reserves: {this.state.reserves_A_AUT[1]}</p>
              <input type="submit" value="Get Reserves AUT" />
            </form>

            <div className="column_aut">
              <p> Token B reserves: {this.state.reserves_B_AUT[0]}</p>
              <p> AUT reserves: {this.state.reserves_B_AUT[1]}</p>
            </div>

            <div className="column_aut">
              <p> Token AUT/A price: {this.state.price_out_AUT[1]}</p>
              <p> Token AUT/B price: {this.state.price_out_AUT[2]}</p>
            </div>

            <form
              className="myform"
              name="SubmitSwapE"
              onSubmit={this.handleSubmit.submitSwapE}
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
            <form className="swap" name="swapEA" onSubmit={this.handleSubmit.swapEA}>
              <label>Token A out: {this.state.amount_outE[1]}</label>
              <input className="swap_button" type="submit" value="Swap" />
            </form>

            {/* Swap for B */}
            <form className="swap" name="swapEB" onSubmit={this.handleSubmit.swapEB}>
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
