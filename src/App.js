import React, {Component, useState} from 'react';
import './App.css';
import { ethers, Contract } from 'ethers';

const Router = require('./build/UniswapV2Router02.json');
const ERC20 = require('./build/ERC20.json');

let _TokenA_address = '0x1d29BD2ACedBff15A59e946a4DE26d5257447727';




class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      provider: undefined,
      signer: undefined,
      balance: undefined,
      _TokenA_address: undefined,
      TokenA_address: undefined,
      TokenA_balance: undefined,
      TokenB_address: undefined,
      TokenB_balance: undefined
    }
    
  }

  componentWillMount() {
    this.loadBlockchainData()
  }

  async getTokenAData(address){
    let TokenA = new Contract(
      address,
      ERC20.abi,
      this.state.signer
    );

    let TokenA_balance_0 = await TokenA.balanceOf(this.state.account);
    let TokenA_balance_1 = ethers.utils.formatEther(TokenA_balance_0);

    this.setState({TokenA_address: TokenA.address});
    this.setState({TokenA_balance: TokenA_balance_1});
  }

  async getTokenBData(address){
    let TokenB = new Contract(
      address,
      ERC20.abi,
      this.state.signer
    );

    let TokenB_balance_0 = await TokenB.balanceOf(this.state.account);
    let TokenB_balance_1 = ethers.utils.formatEther(TokenB_balance_0);

    this.setState({TokenB_address: TokenB.address});
    this.setState({TokenB_balance: TokenB_balance_1});
  }

  async loadBlockchainData() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let balance_0 = await provider.getBalance(accounts[0]);
    let balance_1 = ethers.utils.formatEther(balance_0);

    this.setState({account: accounts[0]});
    this.setState({provider: provider});
    this.setState({signer: signer});
    this.setState({balance: balance_1});

    // await this.getTokenAData(this.state._TokenA_address)
    await this.getTokenBData('0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA')
    // Fetch account
  }

  handleSubmit = (event) => {
      event.preventDefault()
  }

  handleInputChange = (event) => {
      event.preventDefault()
      if (event.target.value.length == 42){
        this.getTokenAData(event.target.value)
      } 
      

  }

  render() {
    return (
      <div>
        <div className="outer">
          <div className="container">
            <h4> React Blockchain App</h4>
            <p> Your account: {this.state.account} </p>
            <p> Your balance: {this.state.balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Token A</h4>

            <form onSubmit={this.handleSubmit}>
              <label>
                address: 
                <input type="text" name="TokenA_address" placeholder="enter token address" onChange={this.handleInputChange} />
              </label>
              <input type="submit" value="Submit" />
            </form>
            
            <p> address: {this.state.TokenA_address}</p>
            <p> balance: {this.state.TokenA_balance}</p>
          </div>
        </div>

        <div className="outer">
          <div className="container">
            <h4> Token B</h4>
            <p> address: {this.state.TokenB_address}</p>
            <p> balance: {this.state.TokenB_balance}</p>
          </div>
        </div>


    
      </div>
    );
  }
}

export default App;
