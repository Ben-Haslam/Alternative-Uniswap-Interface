# How I made a Uniswap interface from scratch

## Intro

With the goal of allowing users to easily make swaps and deploy or remove liquidity on the Autonity network, I decided to make an interface for Uniswap contracts deployed on the network.

Initially, I wanted to fork the official Uniswap interface for our own private network, but it couldn't be done for various reasons that are out of scope for this blog. For this reason, and because I wanted to have a smaller codebase that I understood top to bottom, I decided to write my own simpler application.

I used ReactJS for the project, with the EthersJS module to connect to the blockchain via metamask in the browser, and MaterialUI for the frontend. As it was a static site, I used github pages to host the application.

This first blog describes the code for the swap part of the application. I'll first go through the functions needed to connect and make calls and transactions with the Ethereum blockchain backend, and secondly explain the React frontend, which makes extensive use of hooks and MaterialUI. This is written with the expectation that the reader already has a good understanding of ReactJS, as well as a knowledge of how Uniswap works. I won't explain generic React components such as the NavBar, as this blog will be long enough without that!

Checkout the raw code at the repo [https://clearmatics.github.io/autonity-uniswap-interface/]().

## Ethereum Functions

### Connecting to the blockchain

My original plan was to use the javascript module Web3 to connect to the blockchain via metamask in the browser, but metamask dropped support for it in January 2021, so I instead used EthersJS. EthersJS is also a much smaller module than Web3, which means your application will load faster.

In the file `ethereumFunctions.js`, I defined the function `getProvider`, which connects to the Ethereum provider (metamask or another wallet) in the browser, and the function `getSigner`, which is used to sign transactions. Using the EthersJS Contract class, I defined functions that returned contract objects for the Router, Weth and Factory contracts that I had deployed onto the blockchain previously. For these the Contract class took the address, ABI of the deployed smart contract and the EthersJS signer as parameters.

I also defined a function `getAccount`, which prompts the user to select accounts to use from the connected wallet.

#### ethereumFunctions.js

```javascript
import { Contract, ethers } from "ethers";
import * as COINS from "./constants/coins";

const ROUTER = require("./build/UniswapV2Router02.json");
const ERC20 = require("./build/ERC20.json");
const FACTORY = require("./build/IUniswapV2Factory.json");
const PAIR = require("./build/IUniswapV2Pair.json");

export function getProvider() {
  return new ethers.providers.Web3Provider(window.ethereum);
}

export function getSigner(provider) {
  return provider.getSigner();
}

export function getRouter(address, signer) {
  return new Contract(address, ROUTER.abi, signer);
}

export function getWeth(address, signer) {
  return new Contract(address, ERC20.abi, signer);
}

export function getFactory(address, signer) {
  return new Contract(address, FACTORY.abi, signer);
}

export async function getAccount() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}
```

These functions were all imported into the `CoinSwapper.js` file, and used to set their corresponding state variables using `React.useState` hooks, from line 70:

#### CoinSwapper.js

```javascript
const [provider, setProvider] = React.useState(getProvider());
const [signer, setSigner] = React.useState(getSigner(provider));
const [account, setAccount] = React.useState(undefined); // This is populated in a react hook
const [router, setRouter] = React.useState(
getRouter("0x4489D87C8440B19f11d63FA2246f943F492F3F5F", signer)
);
const [weth, setWeth] = React.useState(
getWeth("0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF", signer)
);
const [factory, setFactory] = React.useState(
getFactory("0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116", signer)
);
```

### ERC20 token functions

The next two functions in the `ethereumFunctions.js` file are used to get information on the token addresses chosen or provided by the user.

`doesTokenExist` does a check to make sure the address provided corresponds to a token deployed on the blockchain:

```javascript
export function doesTokenExist(address, signer) {
  try {
    return new Contract(address, ERC20.abi, signer);
  } catch (err) {
    return false;
  }
}
```

`getBalanceAndSymbol` checks if a provided address is the address of the Weth contract on the blockchain, in which case it returns the native AUT balance of the user. Otherwise it returns the ERC20 token balance of the user, along with the symbol of the token (e.g. TA, TB, etc):

```javascript
export async function getBalanceAndSymbol(
  accountAddress,
  address,
  provider,
  signer
) {
  try {
    if (address === COINS.AUTONITY.address) {
      const balanceRaw = await provider.getBalance(accountAddress);

      return {
        balance: ethers.utils.formatEther(balanceRaw),
        symbol: COINS.AUTONITY.abbr,
      };
    } else {
      const token = new Contract(address, ERC20.abi, signer);
      const balanceRaw = await token.balanceOf(accountAddress);
      const symbol = await token.symbol();

      return {
        balance: ethers.utils.formatEther(balanceRaw),
        symbol: symbol,
      };
    }
  } catch (err) {
    return false;
  }
}
```

This function checks if the address is the Weth address by comparing it to `COINS.AUTONITY.address`, an array of the default tokens exported from `constants/coins.js`.

### The swap function

The `swapTokens` function in `ethereumFunctions.js` makes a transaction to the Router contract on the blockchain to perform one of three different swaps, depending on the token addresses provided to it, `address1` and `address2`.

- If `address1` is the address of the Weth contract, it calls the Router function `swapExactETHForTokens`
- If `address2` is the address of the Weth contract, it calls the Router function `swapExactTokensForETH`
- If neither `address1` or `address2` is the address of the Weth contract, and the `swapTokens` function calls the Router function `swapExactTokensForTokens`

```javascript
export async function swapTokens(
  address1,
  address2,
  amount,
  routerContract,
  accountAddress,
  signer
) {
  const tokens = [address1, address2];
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const amountIn = ethers.utils.parseEther(amount.toString());
  const amountOut = await routerContract.callStatic.getAmountsOut(
    amountIn,
    tokens
  );

  const token1 = new Contract(address1, ERC20.abi, signer);
  await token1.approve(routerContract.address, amountIn);

  if (address1 === COINS.AUTONITY.address) {
    // Eth -> Token
    await routerContract.swapExactETHForTokens(
      amountOut[1],
      tokens,
      accountAddress,
      deadline,
      { value: amountIn }
    );
  } else if (address2 === COINS.AUTONITY.address) {
    // Token -> Eth
    await routerContract.swapExactTokensForETH(
      amountIn,
      amountOut[1],
      tokens,
      accountAddress,
      deadline
    );
  } else {
    await routerContract.swapExactTokensForTokens(
      amountIn,
      amountOut[1],
      tokens,
      accountAddress,
      deadline
    );
  }
}
```

The function `getAmountOut` is used to get a preview of a swap. It calls the Router function `getAmountsOut` with the amount of the first token and an array of the addresses of the tokens to be swapped as parameters. It returns the amount out of the second token.

```javascript
export async function getAmountOut(
  address1,
  address2,
  amountIn,
  routerContract
) {
  try {
    const values_out = await routerContract.getAmountsOut(
      ethers.utils.parseEther(amountIn),
      [address1, address2]
    );
    const amount_out = ethers.utils.formatEther(values_out[1]);
    return Number(amount_out);
  } catch {
    return false;
  }
}
```

### The reserves function

Finally, the `getReserves` function in `ethereumFunctions.js` returns the liquidity pool reserves for a given pair of tokens, as well as the liquidity token balance for the user. Internally this function calls another function `fetchReserves`, which fetches the reserves by making a call to the pair contract then making sure the reserves are returned in the right order.

```javascript
export async function fetchReserves(address1, address2, pair) {
  try {
    const reservesRaw = await pair.getReserves();
    let results = [
      Number(ethers.utils.formatEther(reservesRaw[0])),
      Number(ethers.utils.formatEther(reservesRaw[1])),
    ];

    return [
      (await pair.token0()) === address1 ? results[0] : results[1],
      (await pair.token1()) === address2 ? results[1] : results[0],
    ];
  } catch (err) {
    console.log("no reserves yet");
    return [0, 0];
  }
}
```

```javascript
export async function getReserves(
  address1,
  address2,
  factory,
  signer,
  accountAddress
) {
  const pairAddress = await factory.getPair(address1, address2);
  const pair = new Contract(pairAddress, PAIR.abi, signer);

  const reservesRaw = await fetchReserves(address1, address2, pair);
  const liquidityTokens_BN = await pair.balanceOf(accountAddress);
  const liquidityTokens = Number(
    ethers.utils.formatEther(liquidityTokens_BN)
  ).toFixed(2);

  return [
    reservesRaw[0].toFixed(2),
    reservesRaw[1].toFixed(2),
    liquidityTokens,
  ];
}
```

## React Frontend

The frontend of the application makes extensive use of MaterialUI components such as `Grid`, `Container`, `Paper`, `Typography`, as well as various buttons and more. Rather than explaining the workings of every component in the application, I will aim to give a high level overview, which will make the most sense if you are reading through the code at the same time. If you are not familiar with MaterialUI I recommend reading up on some of their great documentation [here](https://material-ui.com/).

The file `CoinSwapper.js` exports a function `CoinSwapper`, which returns the React component used to select tokens and make swaps. This function itself makes use of some other custom React components, which I will explain first before going through the internal functions and hooks that make the `CoinSwapper` component work.

### Coin Dialog component

The `CoinDialog` component renders the menu of coins that opens upon clicking one of the select buttons. This extends the React `Dialog` component, which renders a window that opens in front of the rest of the app, used to ask for a decision. It is defined in `CoinSwapper/CoinDialog.js`

Inside the `CoinDialog` component, there is first a modified version of MaterialUI's `DialogTitle` component, with the addition of a close button which on click calls the `exit` function that closes `CoinDialog`.

Next there is an React `TextField` component, which enables the user to paste the address of a token to be used. On change, this sets the state variable `address` to the user's input.

The next part is a mapping that maps each of the default tokens in `Constants/coins` to a custom `CoinButton` component (see below), that when clicked calls the `exit` function that closes `CoinDialog` returning the address of the selected tokens.

Finally, there is the `Enter` button, which on click calls the `submit` function, which checks a token exists with the address in the `TextField` with the ethereum function `doesTokenExist`, before calling `exit` to close `CoinDialog` returning the address.

```javascript
const submit = () => {
    if (doesTokenExist(address, signer)) {
      exit(address);
    } else {
      setError("This address is not valid");
    }
};

// Resets any fields in the dialog (in case it's opened in the future) and calls the `onClose` prop
const exit = (value) => {
    setError("");
    setAddress("");
    onClose(value);
};

return (
    <Dialog
      open={open}
      onClose={() => exit(undefined)}
      fullWidth
      maxWidth="sm"
      classes={{ paper: classes.dialogContainer }}
    >
      <DialogTitle onClose={() => exit(undefined)}>Select Coin</DialogTitle>

      <hr className={classes.hr} />

      <div className={classes.coinContainer}>
        <Grid container direction="column" spacing={1} alignContent="center">
          <TextField
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            variant="outlined"
            placeholder="Paste Address"
            error={error !== ""}
            helperText={error}
            fullWidth
            className={classes.address}
          />

          <hr className={classes.hr} />

          <Grid item className={classes.coinList}>
            <Grid container direction="column">
              {/* Maps all of the tokens in the constants file to buttons */}
              {coins.map((coin, index) => (
                <Grid item key={index} xs={12}>
                  <CoinButton
                    coinName={coin.name}
                    coinAbbr={coin.abbr}
                    onClick={() => exit(coin.address)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </div>

      <hr className={classes.hr} />

      <DialogActions>
        <Button autoFocus onClick={submit} color="primary">
          Enter
        </Button>
      </DialogActions>
    </Dialog>
);
```

This component, as well as all the others, makes use of the MaterialUI `makeStyles` function for the styling.

### Coin Button component

The `CoinButton` component, defined in `CoinSwapper/CoinButton.js`, extends the MaterialUI `ButtonBase` component, which contains text of the token symbol (coinAbbr) and token name (coinName), which are passed in via props.

```javascript
export default function CoinButton(props) {
    const {coinName, coinAbbr, onClick, ...other} = props;
    const classes = useStyles();

    return (
        <ButtonBase
            focusRipple
            className={classes.button}
            onClick={onClick}
        >
            <Grid container direction="column">
                <Typography variant="h6">{coinAbbr}</Typography>
                <Typography variant="body2" className={classes.coinName}>{coinName}</Typography>
            </Grid>
        </ButtonBase>
    )
}
```

### Coin Field component

The `CoinField` component, defined in `CoinSwapper/CoinField`, renders the input bar with a "SELECT" button used to select each token and input an amount for swapping. The component is relatively simple and consists of MaterialUI components `Fab` (floating action button) and `InputBase` (a text field), both wrapped in `Grid` components for spacing. The relative properties for the `Fab` and `InputBase` components are passed into the `CoinField` component via props.

```javascript
const classes = useStyles();
const { onClick, symbol, value, onChange, activeField } = props;

return (
    <div className={classes.container}>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        className={classes.grid}
      >
        {/* Button */}
        <Grid item xs={3}>
          <Fab
            size="small"
            variant="extended"
            onClick={onClick}
            className={classes.fab}
          >
            {symbol}
            <ExpandMoreIcon />
          </Fab>
        </Grid>

        {/* Text Field */}
        <Grid item xs={9}>
          <InputBase
            value={value}
            onChange={onChange}
            placeholder="0.0"
            disabled={!activeField}
            classes={{ root: classes.input, input: classes.inputBase }}
          />
        </Grid>
      </Grid>
    </div>
);
```

### Loading button

The `LoadingButton` component, defined in `Components/LoadingButton.js`, extends the MaterialUI `Button` component, so it will be dissabled depending on the `valid` prop, and displays a spinning loading icon on click until the swap transaction is complete.

```javascript
export default function LoadingButton(props) {
  const classes = useStyles();
  const { children, loading, valid, success, fail, onClick, ...other } = props;
  return (
    <div className={classes.wrapper}>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading || !valid}
        type="submit"
        onClick={onClick}
        {...other}
      >
        {children}
      </Button>
      {loading && <CircularProgress size={24} className={classes.progress} />}
    </div>
  );
}
```

## Coin Swapper Function

### The Return statement

The main function of the application, `CoinSwapper`, in `CoinSwapper/CoinSwapper.js` returns a component that containes two `CoinDialog` components, which only open when one of two `CoinField` components is selected. Next there are MaterialUI `Typography` components which display the balances and reserves of the two selected tokens.

Finally there is the `LoadingButton` component at the bottom, and a short instructional paragraph with a link to the AUT faucet.

```javascript
return (
    <div>
      {/* Dialog Windows */}
      <CoinDialog
        open={dialog1Open}
        onClose={onToken1Selected}
        coins={COINS.ALL}
        signer={signer}
      />
      <CoinDialog
        open={dialog2Open}
        onClose={onToken2Selected}
        coins={COINS.ALL}
        signer={signer}
      />

      {/* Coin Swapper */}
      <Container maxWidth="xs">
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            Swap Coins
          </Typography>

          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item xs={12} className={classes.fullWidth}>
              <CoinField
                activeField={true}
                value={field1Value}
                onClick={() => setDialog1Open(true)}
                onChange={handleChange.field1}
                symbol={
                  coin1.symbol !== undefined ? coin1.symbol : "Select"
                }
              />
            </Grid>

            <IconButton onClick={switchFields} className={classes.switchButton}>
              <SwapVerticalCircleIcon fontSize="medium" />
            </IconButton>

            <Grid item xs={12} className={classes.fullWidth}>
              <CoinField
                activeField={false}
                value={field2Value}
                onClick={() => setDialog2Open(true)}
                symbol={
                  coin2.symbol !== undefined ? coin2.symbol : "Select"
                }
              />
            </Grid>

            <hr className={classes.hr} />

            {/* Balance Display */}
            <Typography variant="h6">Your Balances</Typography>
            <Grid container direction="row" justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatBalance(coin1.balance, coin1.symbol)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatBalance(coin2.balance, coin2.symbol)}
                </Typography>
              </Grid>
            </Grid>

            <hr className={classes.hr} />

            {/* Reserves Display */}
            <Typography variant="h6">Reserves</Typography>
            <Grid container direction="row" justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatReserve(reserves[0], coin1.symbol)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatReserve(reserves[1], coin2.symbol)}
                </Typography>
              </Grid>
            </Grid>

            <hr className={classes.hr} />

            <LoadingButton
              loading={loading}
              valid={isButtonEnabled()}
              success={false}
              fail={false}
              onClick={swap}
            >
              <LoopIcon />
              Swap
            </LoadingButton>
          </Grid>
        </Paper>
      </Container>

      <Grid
        container
        className={classes.footer}
        direction="row"
        justifyContent="center"
        alignItems="flex-end"
      >
        <p>
          Clearmatics Autonity Uniswap | Get AUT for use in the bakerloo testnet{" "}
          <a href="https://faucet.bakerloo.autonity.network/">here</a>
        </p>
      </Grid>
    </div>
);
```

### State variables

The return statement above references several state variables that keep track of the state of the application. These are:

- `dialog1Open`
- `dialog2Open`
- `coin1`
- `coin2`
- `reserves`
- `field1Value`
- `field2Value`
- `loading`

These are defined with `React.useState` hooks from line 83:

```javascript
// Stores a record of whether their respective dialog window is open
const [dialog1Open, setDialog1Open] = React.useState(false);
const [dialog2Open, setDialog2Open] = React.useState(false);

// Stores data about their respective coin
const [coin1, setCoin1] = React.useState({
address: undefined,
symbol: undefined,
balance: undefined,
});
const [coin2, setCoin2] = React.useState({
address: undefined,
symbol: undefined,
balance: undefined,
});

// Stores the current reserves in the liquidity pool between coin1 and coin2
const [reserves, setReserves] = React.useState(["0.0", "0.0"]);

// Stores the current value of their respective text box
const [field1Value, setField1Value] = React.useState("");
const [field2Value, setField2Value] = React.useState("");

// Controls the loading button
const [loading, setLoading] = React.useState(false);
```

### Internal functions

Also referenced in the return statement above are several internal functions, these are:

- `switchFields`
- `handleChange`
- `formatBalance`
- `formatReserve`
- `isButtonEnabled`
- `onToken1Selected`
- `onToken2Selected`
- `swap`

`switchFields` switches the top and bottom coins. This is called when users hit the swap button or select the opposite token in the dialog (e.g. if coin1 is TokenA and the user selects TokenB when choosing coin2):

```javascript
const switchFields = () => {
    setCoin1(coin2);
    setCoin2(coin1);
    setField1Value(field2Value);
    setReserves(reserves.reverse());
};
```

`handleChange` takes an HTML event, pulls the data out, and puts it into a state variable:

```javascript
const handleChange = {
    field1: (e) => {
      setField1Value(e.target.value);
    },
};
```

`formatBalance` turns the account's balance into something nice and readable:

```javascript
const formatBalance = (balance, symbol) => {
    if (balance && symbol)
      return parseFloat(balance).toPrecision(8) + " " + symbol;
    else return "0.0";
};
```

`formatReserve` turns the coin's reserves into something nice and readable:

```javascript
const formatReserve = (reserve, symbol) => {
    if (reserve && symbol) return reserve + " " + symbol;
    else return "0.0";
};
```

`isButtonEnabled` determines whether the button should be enabled or not:

```javascript
const isButtonEnabled = () => {
    let validFloat = new RegExp("^[0-9]*[.,]?[0-9]*$");

    // If both coins have been selected, and a valid float has been entered which is less than the user's balance, then return true
    return (
      coin1.address &&
      coin2.address &&
      validFloat.test(field1Value) &&
      parseFloat(field1Value) <= coin1.balance
    );
};
```

`onToken1Selected` is called when the dialog window for coin1 exits, and sets the relevant state variables:

```javascript
const onToken1Selected = (address) => {
    // Close the dialog window
    setDialog1Open(false);

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === coin2.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      // Getting some token data is async, so we need to wait for the data to return, hence the promise
      getBalanceAndSymbol(account, address, provider, signer).then((data) => {
        setCoin1({
          address: address,
          symbol: data.symbol,
          balance: data.balance,
        });
      });
    }
};
```

`onToken2Selected` is called when the dialog window for coin2 exits, and sets the relevant state variables:

```javascript
const onToken2Selected = (address) => {
    // Close the dialog window
    setDialog2Open(false);

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === coin1.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      // Getting some token data is async, so we need to wait for the data to return, hence the promise
      getBalanceAndSymbol(account, address, provider, signer).then((data) => {
        setCoin2({
          address: address,
          symbol: data.symbol,
          balance: data.balance,
        });
      });
    }
};
```

`swap` calls the `swapTokens` Ethereum function to make the swap, then resets necessary state variables:

```javascript
const swap = () => {
    console.log("Attempting to swap tokens...");
    setLoading(true);

    swapTokens(
      coin1.address,
      coin2.address,
      parseFloat(field1Value),
      router,
      account,
      signer
    )
      .then(() => {
        setLoading(false);

        // If the transaction was successful, we clear to input to make sure the user doesn't accidental redo the transfer
        setField1Value("");
        enqueueSnackbar("Transaction Successful", { variant: "success" });
      })
      .catch((e) => {
        setLoading(false);
        enqueueSnackbar("Transaction Failed (" + e.message + ")", {
          variant: "error",
          autoHideDuration: 10000,
        });
      });
};
```

Line 16 in the swap function uses `enqueueSnackbar`, a component from the node module Notistack. Notistack is a great library for making tempory notifications. Check the repo [here](https://github.com/iamhosseindhv/notistack).

### useEffect hooks

Finally, in `CoinSwapper/CoinSwapper.js`, there are four `useEffect` hooks, which are used to keep the application up to date with the latest changes. The lambda (code) within each hook is run when one of the dependencies changes. The dependencies are defined in the array of variables passed to the function after the lambda expression.

The first `useEffect` is called when either of the state variables `coin1.address` or `coin2.address` change. This means that when the user selects a different coin to convert between, or the coins are swapped, the new reserves will be calculated:

```javascript
useEffect(() => {
    console.log(
      "Trying to get Reserves between:\n" +
        coin1.address +
        "\n" +
        coin2.address
    );

    if (coin1.address && coin2.address) {
      getReserves(
        coin1.address,
        coin2.address,
        factory,
        signer,
        account
      ).then((data) => setReserves(data));
    }
}, [coin1.address, coin2.address, account, factory, router, signer]);

```

The second hook is called when any of the state variables `field1Value` `coin1.address` or `coin2.address` change. It attempts to calculate and set the state variable `field2Value`. This means that if the user enters a new value into the conversion box or the conversion rate changes, the value in the output box will change:

```javascript
useEffect(() => {
    if (isNaN(parseFloat(field1Value))) {
      setField2Value("");
    } else if (field1Value && coin1.address && coin2.address) {
      getAmountOut(
        coin1.address,
        coin2.address,
        field1Value,
        router
      ).then((amount) => setField2Value(amount.toFixed(7)));
    } else {
      setField2Value("");
    }
}, [field1Value, coin1.address, coin2.address]);
```

The third hook creates a timeout that will run every ~10 seconds, its role is to check if the user's balance has updated and changed. This allows them to see when a transaction completes by looking at the balance output:

```javascript
useEffect(() => {
    const coinTimeout = setTimeout(() => {
      console.log("Checking balances...");

      if (coin1.address && coin2.address && account) {
        getReserves(
          coin1.address,
          coin2.address,
          factory,
          signer,
          account
        ).then((data) => setReserves(data));
      }

      if (coin1 && account) {
        getBalanceAndSymbol(account, coin1.address, provider, signer).then(
          (data) => {
            setCoin1({
              ...coin1,
              balance: data.balance,
            });
          }
        );
      }
      if (coin2 && account) {
        getBalanceAndSymbol(account, coin2.address, provider, signer).then(
          (data) => {
            setCoin2({
              ...coin2,
              balance: data.balance,
            });
          }
        );
      }
    }, 10000);

    return () => clearTimeout(coinTimeout);
});
```

The final hook will run when the component first mounts. It is used to set the account:

```javascript
useEffect(() => {
    getAccount().then((account) => {
      setAccount(account);
    });
});
```

## Conclusion

That covers the functions, components and hooks needed to make the main swap functionality work. I have yet to mention the redirect page for when an Ethereum wallet can't be found, or of course, any of the remove/deploy liquidity functionality. That will be the topic of a future blog. Watch this space!
