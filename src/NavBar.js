import React from "react";
import { Link, link } from "react-router-dom";

function NavBar() {
  return (
    <ul>
      <li>
        <Link to="/">Swap</Link>
      </li>
      <li>
        <Link to="/liquidity">Deply Liquidity </Link>
      </li>
      <li>
        <Link to="/markdown">Markdown File </Link>
      </li>
    </ul>
  );
}

export default NavBar;
