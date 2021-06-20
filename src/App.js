import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";
import Swap from "./Swap";
import Liquidity from "./Liquidity";
import NarBar from "./NavBar/NavBar";
import { Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <NarBar />
      <Route exact path="/" component={Swap} />
      <Route exact path="/liquidity" component={Liquidity} />
    </div>
  );
}

export default App;
