import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";
import Swap from "./Swap";
import Liquidity from "./Liquidity";
import NarBar from "./NavBar/NavBar";
import CurrencySwapper from "./CurrencySwapper/CurrencySwapper"
import { Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <NarBar />
      <Route exact path="/uniswap-react/" component={Swap} />
      <Route exact path="/uniswap-react/swap-beta" component={CurrencySwapper} />
      <Route exact path="/uniswap-react/liquidity" component={Liquidity} />
    </div>
  );
}

export default App;
