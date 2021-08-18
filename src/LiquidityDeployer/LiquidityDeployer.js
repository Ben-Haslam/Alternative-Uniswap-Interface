import React, { useEffect } from "react";
import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import { useSnackbar } from "notistack";
import {
  getAccount,
  getFactory,
  getProvider,
  getRouter,
  getSigner,
  getBalanceAndSymbol,
  getWeth,
  getReserves,
} from "../ethereumFunctions";

import { addLiquidity, quoteAddLiquidity } from "./liquidityFunctions";

import CurrencyField from "../CurrencySwapper/CurrencyField";
import CurrencyDialog from "../CurrencySwapper/CurrencyDialog";
import LoadingButton from "../Components/LoadingButton";
import * as COINS from "../constants/coins";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    width: "40%",
    overflow: "wrap",
    background: "linear-gradient(45deg, #ff0000 30%, #FF8E53 90%)",
    color: "white",
  },
  fullWidth: {
    width: "100%",
  },
  values: {
    width: "50%",
  },
  title: {
    textAlign: "center",
    padding: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  hr: {
    width: "100%",
  },
  balance: {
    padding: theme.spacing(1),
    overflow: "wrap",
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.4),
  },
});

const useStyles = makeStyles(styles);

function LiquidityDeployer(props) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);

  // Stores data about their respective currency
  const [currency1, setCurrency1] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
  });
  const [currency2, setCurrency2] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
  });

  // Stores the current reserves in the liquidity pool between currency1 and currency2
  const [reserves, setReserves] = React.useState(["0.0", "0.0"]);
  const [liquidity_tokens, setLiquidity_tokens] = React.useState("");

  // Stores the current value of their respective text box
  const [field1Value, setField1Value] = React.useState("");
  const [field2Value, setField2Value] = React.useState("");

  // Stores information for the Autonity Network
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

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  // Used when getting a quote of liquidity
  const [liquidity_out, setLiquidity_out] = React.useState([0, 0, 0]);

  // Switches the top and bottom currencies, this is called when users hit the swap button or select the opposite
  // token in the dialog (e.g. if currency1 is TokenA and the user selects TokenB when choosing currency2)
  const switchFields = () => {
    let oldField1Value = field1Value;
    let oldField2Value = field2Value;

    setCurrency1(currency2);
    setCurrency2(currency1);
    setField1Value(oldField2Value);
    setField2Value(oldField1Value);
    setReserves(reserves.reverse());
  };

  // These functions take an HTML event, pull the data out and puts it into a state variable.
  const handleChange = {
    field1: (e) => {
      setField1Value(e.target.value);
    },
    field2: (e) => {
      setField2Value(e.target.value);
    },
  };

  // Turns the account's balance into something nice and readable
  const formatBalance = (balance, symbol) => {
    if (balance && symbol)
      return parseFloat(balance).toPrecision(8) + " " + symbol;
    else return "0.0";
  };

  // Turns the currency's reserves into something nice and readable
  const formatReserve = (reserve, symbol) => {
    if (reserve && symbol) return reserve + " " + symbol;
    else return "0.0";
  };

  // Determines whether the button should be enabled or not
  const isButtonEnabled = () => {
    let validFloat = new RegExp("^[0-9]*[.,]?[0-9]*$");

    // If both currencies have been selected, and a valid float has been entered for both, which are less than the user's balances, then return true
    return (
      currency1.address &&
      currency2.address &&
      validFloat.test(field1Value) &&
      validFloat.test(field2Value) &&
      parseFloat(field1Value) <= currency1.balance &&
      parseFloat(field2Value) <= currency2.balance
    );
  };

  const deploy = () => {
    console.log("Attempting to deploy liquidity...");
    setLoading(true);

    addLiquidity(
      currency1.address,
      currency2.address,
      parseFloat(field1Value),
      parseFloat(field2Value),
      0,
      0,
      router,
      account,
      signer
    )
      .then(() => {
        setLoading(false);

        // If the transaction was successful, we clear to input to make sure the user doesn't accidental redo the transfer
        setField1Value("");
        setField2Value("");
        enqueueSnackbar("Deployment Successful", { variant: "success" });
      })
      .catch((e) => {
        setLoading(false);
        enqueueSnackbar("Deployment Failed (" + e.message + ")", {
          variant: "error",
          autoHideDuration: 10000,
        });
      });
  };

  // Called when the dialog window for currency1 exits
  const onToken1Selected = (address) => {
    // Close the dialog window
    setDialog1Open(false);

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === currency2.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      // Getting some token data is async, so we need to wait for the data to return, hence the promise
      getBalanceAndSymbol(account, address, provider, signer).then((data) => {
        setCurrency1({
          address: address,
          symbol: data.symbol,
          balance: data.balance,
        });
      });
    }
  };

  // Called when the dialog window for currency2 exits
  const onToken2Selected = (address) => {
    // Close the dialog window
    setDialog2Open(false);

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === currency1.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      // Getting some token data is async, so we need to wait for the data to return, hence the promise
      getBalanceAndSymbol(account, address, provider, signer).then((data) => {
        setCurrency2({
          address: address,
          symbol: data.symbol,
          balance: data.balance,
        });
      });
    }
  };

  useEffect(() => {
    // This hook runs whenever the currencies change, it will attempt to fetch the new liquidity reserves.
    console.log(
      "Trying to get reserves between:\n" +
        currency1.address +
        "\n" +
        currency2.address
    );

    if (currency1.address && currency2.address) {
      getReserves(
        currency1.address,
        currency2.address,
        factory,
        signer,
        account
      ).then((data) => {
        setReserves([data[0], data[1]]);
        setLiquidity_tokens(data[2]);
      });
    }
  }, [currency1.address, currency2.address, account, factory, signer]);

  useEffect(() => {
    // This hook runs whenever the field values change or currencies change, it will attempt to do a static call to give a preview of the liquidity deployment.

    if (isButtonEnabled()) {
      console.log("Trying to preview the liquidity deployment");

      quoteAddLiquidity(
        currency1.address,
        currency2.address,
        parseFloat(field1Value),
        parseFloat(field2Value),
        factory,
        signer
      ).then((data) => {
        // console.log(data);
        console.log("TokenA in: ", data[0]);
        console.log("TokenB in: ", data[1]);
        const liquidity_out = Math.sqrt(data[0] * data[1]);
        console.log("Liquidity out: ", liquidity_out);
        setLiquidity_out([data[0], data[1], liquidity_out]);
      });
    }
  }, [
    currency1.address,
    currency2.address,
    field1Value,
    field2Value,
    factory,
    signer,
  ]);

  useEffect(() => {
    // This hook creates a timeout that will run every ~10 seconds, it's role is to check if the user's balance has
    // updated has changed. This allows them to see when a transaction completes by looking at the balance output.

    const currencyTimeout = setTimeout(() => {
      console.log("Checking balances & Getting reserves...");

      if (currency1.address && currency2.address) {
        getReserves(
          currency1.address,
          currency2.address,
          factory,
          signer,
          account
        ).then((data) => {
          setReserves([data[0], data[1]]);
          setLiquidity_tokens(data[2]);
        });
      }

      if (currency1) {
        getBalanceAndSymbol(account, currency1.address, provider, signer).then(
          (data) => {
            setCurrency1({
              ...currency1,
              balance: data.balance,
            });
          }
        );
      }
      if (currency2) {
        getBalanceAndSymbol(account, currency2.address, provider, signer).then(
          (data) => {
            setCurrency2({
              ...currency2,
              balance: data.balance,
            });
          }
        );
      }
    }, 10000);

    return () => clearTimeout(currencyTimeout);
  });

  useEffect(() => {
    // This hook will run when the component first mounts, it can be useful to put logic to populate variables here

    getAccount().then((account) => {
      setAccount(account);
    });
  });

  return (
    <div>
      {/* Liquidity deployer */}
      <Typography variant="h5" className={classes.title}></Typography>

      {/* Dialog Windows */}
      <CurrencyDialog
        open={dialog1Open}
        onClose={onToken1Selected}
        coins={COINS.ALL}
        signer={signer}
      />
      <CurrencyDialog
        open={dialog2Open}
        onClose={onToken2Selected}
        coins={COINS.ALL}
        signer={signer}
      />

      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item xs={12} className={classes.fullWidth}>
          <CurrencyField
            activeField={true}
            value={field1Value}
            onClick={() => setDialog1Open(true)}
            onChange={handleChange.field1}
            symbol={
              currency1.symbol !== undefined ? currency1.symbol : "Select"
            }
          />
        </Grid>

        <Grid item xs={12} className={classes.fullWidth}>
          <CurrencyField
            activeField={true}
            value={field2Value}
            onClick={() => setDialog2Open(true)}
            onChange={handleChange.field2}
            symbol={
              currency2.symbol !== undefined ? currency2.symbol : "Select"
            }
          />
        </Grid>
      </Grid>

      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={4}
        className={classes.balance}
      >
        <hr className={classes.hr} />
        <Grid
          container
          item
          className={classes.values}
          direction="column"
          alignItems="center"
          spacing={2}
        >
          {/* Balance Display */}
          <Typography variant="h6">Your Balances</Typography>
          <Grid container direction="row" justifyContent="space-between">
            <Grid item xs={6}>
              <Typography variant="body1" className={classes.balance}>
                {formatBalance(currency1.balance, currency1.symbol)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" className={classes.balance}>
                {formatBalance(currency2.balance, currency2.symbol)}
              </Typography>
            </Grid>
          </Grid>

          <hr className={classes.hr} />

          {/* Reserves Display */}
          <Typography variant="h6">Reserves</Typography>
          <Grid container direction="row" justifyContent="space-between">
            <Grid item xs={6}>
              <Typography variant="body1" className={classes.balance}>
                {formatReserve(reserves[0], currency1.symbol)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" className={classes.balance}>
                {formatReserve(reserves[1], currency2.symbol)}
              </Typography>
            </Grid>
          </Grid>

          <hr className={classes.hr} />

          {/* Liquidity Tokens Display */}
          <Typography variant="h6">Your Liquidity Pool Tokens</Typography>
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={6}>
              <Typography variant="body1" className={classes.balance}>
                {formatReserve(liquidity_tokens, "UNI-V2")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Paper className={classes.paperContainer}>
          {/*Red  Display to show the quote */}
          <Grid
            container
            item
            direction="column"
            alignItems="center"
            spacing={2}
            className={classes.fullWidth}
          >
            {/* Tokens in */}
            <Typography variant="h6">Tokens in</Typography>
            <Grid container direction="row" justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatBalance(liquidity_out[0], currency1.symbol)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatBalance(liquidity_out[1], currency2.symbol)}
                </Typography>
              </Grid>
            </Grid>

            <hr className={classes.hr} />

            {/* Liquidity Tokens Display */}
            <Typography variant="h6">Liquidity Pool Tokens Out</Typography>
            <Grid container direction="row" justifyContent="center">
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatReserve(liquidity_out[2], "UNI-V2")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <hr className={classes.hr} />
      </Grid>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <LoadingButton
          loading={loading}
          valid={isButtonEnabled()}
          success={false}
          fail={false}
          onClick={deploy}
        >
          <AccountBalanceIcon className={classes.buttonIcon} />
          Deploy
        </LoadingButton>
      </Grid>
    </div>
  );
}

export default LiquidityDeployer;
