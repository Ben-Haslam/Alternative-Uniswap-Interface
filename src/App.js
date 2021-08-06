import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";
import Swap from "./Swap";
import Liquidity from "./Liquidity";
import NarBar from "./NavBar/NavBar";
import CurrencySwapper from "./CurrencySwapper/CurrencySwapper";
import { Route, Link } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import LiquidityDeployer from "./LiquidityDeployer/LiquidityDeployer";
import LiquidityRemover from "./LiquidityDeployer/RemoveLiquidity";

function App() {
  return (
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        <NarBar />
        {/* <Route exact path="/uniswap-react/" component={Swap} /> */}
        <Route exact path="/uniswap-react/" component={CurrencySwapper} />
        <Route
          exact
          path="/uniswap-react/add-liquidity"
          component={LiquidityDeployer}
        />
        <Route
          exact
          path="/uniswap-react/remove-liquidity"
          component={LiquidityRemover}
        />
        {/* <Route exact path="/uniswap-react/liquidity" component={Liquidity} /> */}
      </SnackbarProvider>
    </div>
  );
}

export default App;
