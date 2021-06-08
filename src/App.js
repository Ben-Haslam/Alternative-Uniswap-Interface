import React from "react";
import "./App.css";
import { ethers } from "ethers";
import _App from "./ethereum";
import Swap from "./Swap";
import Liquidity from "./Liquidity";
import NarBar from "./NavBar";
import Markdown_test from "./Markdown";
import { Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <NarBar />
      <Route exact path="/" component={Swap} />
      <Route exact path="/liquidity" component={Liquidity} />
      <Route exact path="/markdown" component={Markdown_test} />
    </div>
  );
}

export default App;
