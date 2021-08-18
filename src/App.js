import React from "react";
import "./App.css";
import { ethers } from "ethers";
import NarBar from "./NavBar/NavBar";
import CurrencySwapper from "./CurrencySwapper/CurrencySwapper";
import { Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Liquidity from "./LiquidityDeployer/Liquidity";
import ConnectWalletPage from "./Components/connectWalletPage";
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
  // Check if wallet is here:
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return (
      <div className="App">
        <SnackbarProvider maxSnack={3}>
          <ThemeProvider theme={theme}>
            <NarBar />
            <Route exact path="/uniswap-react/" component={CurrencySwapper} />
            <Route
              exact
              path="/uniswap-react/liquidity"
              component={Liquidity}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </div>
    );
  } catch (err) {
    return (
      <div className="App">
        <SnackbarProvider maxSnack={3}>
          <ThemeProvider theme={theme}>
            <ConnectWalletPage />
          </ThemeProvider>
        </SnackbarProvider>
      </div>
    );
  }
}

export default App;
