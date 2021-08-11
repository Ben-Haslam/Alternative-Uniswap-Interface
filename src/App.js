import React from "react";
import "./App.css";
import { ethers } from "ethers";
// import _App from "./ethereum";
// import Swap from "./Swap";
// import Liquidity from "./Liquidity";
import NarBar from "./NavBar/NavBar";
import CurrencySwapper from "./CurrencySwapper/CurrencySwapper";
import { Route, Link } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import LiquidityDeployer from "./LiquidityDeployer/LiquidityDeployer";
import LiquidityRemover from "./LiquidityDeployer/RemoveLiquidity";
import Liquidity from "./LiquidityDeployer/Liquidity";
import { createTheme, ThemeProvider } from "@material-ui/core";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff0000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9e9e9e",
      contrastText: "#ffffff",
    },
  },
});

function App() {
  return (
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        <ThemeProvider theme={theme}>
          <NarBar />
          <Route exact path="/uniswap-react/" component={CurrencySwapper} />
          <Route exact path="/uniswap-react/liquidity" component={Liquidity} />
        </ThemeProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;
