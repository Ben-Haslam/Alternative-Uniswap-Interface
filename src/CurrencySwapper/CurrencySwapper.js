import React, {useEffect} from "react";
import {
    Button,
    Container,
    Grid,
    IconButton,
    makeStyles,
    Paper,
    Typography,
} from "@material-ui/core";
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import { useSnackbar } from "notistack";
import LoopIcon from '@material-ui/icons/Loop';
import {
    getAccount,
    getConversionRate,
    getFactory,
    getProvider,
    getRouter,
    getSigner,
    getBalanceAndSymbol,
    getWeth,
    swapCurrency
} from "../ethereumFunctions";
import CurrencyField from "./CurrencyField";
import CurrencyDialog from "./CurrencyDialog";
import * as COINS from "../constants/coins";

const styles = (theme) => ({
    paperContainer: {
        borderRadius: theme.spacing(2),
        padding: theme.spacing(1),
        paddingBottom: theme.spacing(3)
    },
    switchButton: {
        zIndex: 1,
        margin: "-16px",
        padding: theme.spacing(0.5)
    },
    fullWidth: {
        width: "100%"
    },
    title: {
        textAlign: "center",
        padding: theme.spacing(0.5),
        marginBottom: theme.spacing(1)
    },
    hr: {
        width: "100%"
    },
    balance: {
        padding: theme.spacing(1),
        overflow: "wrap",
        textAlign: "center"
    }
})

const useStyles = makeStyles(styles);

function CurrencySwapper(props) {
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
        balance: undefined
    });

    // Stores the current conversion rate between currency1 and currency2
    const [conversionRate, setConversionRate] = React.useState(undefined);

    // Stores the current value of their respective text box
    const [field1Value, setField1Value] = React.useState("");
    const [field2Value, setField2Value] = React.useState("");

    // Stores information for the Autonity Network
    const [provider, setProvider] = React.useState(getProvider());
    const [signer, setSigner] = React.useState(getSigner(provider));
    const [account, setAccount] = React.useState(undefined);  // This is populated in a react hook
    const [router, setRouter] = React.useState(getRouter("0x4489D87C8440B19f11d63FA2246f943F492F3F5F", signer));
    const [weth, setWeth] = React.useState(getWeth("0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF", signer));
    const [factory, setFactory] = React.useState(getFactory("0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116", signer));

    // Switches the top and bottom currencies, this is called when users hit the swap button or select the opposite
    // token in the dialog (e.g. if currency1 is TokenA and the user selects TokenB when choosing currency2)
    const switchFields = () => {
        setCurrency1(currency2);
        setCurrency2(currency1);
    }

    // These functions take an HTML event, pull the data out and puts it into a state variable.
    const handleChange = {
        field1: (e) => {
            setField1Value(e.target.value);
        }
    }

    // Turns the account's balance into something nice and readable
    const formatBalance = (balance, symbol) => {
        if (balance && symbol)
            return parseFloat(balance).toPrecision(8) + " " + symbol;
        else
            return "0.0";
    }

    // Determines whether the button should be enabled or not
    const isButtonEnabled = () => {
        let validFloat = new RegExp("^[0-9]*[.,]?[0-9]*$")

        // If both currencies have been selected, and a valid float has been entered which is less than the user's balance, then return true
        return (currency1.address && currency2.address)
            && validFloat.test(field1Value)
            && (parseFloat(field1Value) <= currency1.balance);
    }

    const swap = () => {
        console.log("Attempting to swap tokens...")

        swapCurrency(
            currency1.address,
            currency2.address,
            parseFloat(field1Value),
            router,
            account,
            provider,
            signer
        )
            .then(() => {
                // If the transaction was successful, we clear to input to make sure the user doesn't accidental redo the transfer
                setField1Value("");
                enqueueSnackbar("Transaction Successful", {variant: "success"});
            })
            .catch((e) => {
                enqueueSnackbar("Transaction Failed (" + e.message + ")", {variant: "error", autoHideDuration: 10000});
            })
    }

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
            getBalanceAndSymbol(account, address, provider, signer)
                .then(data => {
                    setCurrency1({
                        address: address,
                        symbol: data.symbol,
                        balance: data.balance,
                    })
                })
        }
    }

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
            getBalanceAndSymbol(account, address, provider, signer)
                .then(data => {
                    setCurrency2({
                        address: address,
                        symbol: data.symbol,
                        balance: data.balance,
                    })
                })
        }
    }

    // The lambdas within these useEffects will be called when a particular dependency is updated. These dependencies
    // are defined in the array of variables passed to the function after the lambda expression. If there are no dependencies
    // the lambda will only ever be called when the component mounts. These are very useful for calculating new values
    // after a particular state change, for example, calculating the new exchange rate whenever the addresses
    // of the two currencies change.
    useEffect(() => {
        // This hook is called when either of the state variables `currency1.address` or `currency2.address` change.
        // It attempts to calculate and set the state variable `conversionRate`
        // This means that when the user selects a different currency to convert between, or the currencies are swapped,
        // the new conversion rate will be calculated.

        console.log("Trying to get Conversion Rate between:\n" + currency1.address + "\n" + currency2.address)

        if (currency1.address && currency2.address) {
            getConversionRate(router, currency1.address, currency2.address)
                .then(rate => setConversionRate(rate));
        }

    }, [currency1.address, currency2.address]);

    useEffect(() => {
        // This hook is called when either of the state variables `field1Value` or `conversionRate` change.
        // It attempts to calculate and set the state variable `field2Value`
        // This means that if the user types a new value into the conversion box or the conversion rate changes,
        // the value in the output box will change.

        if (isNaN(parseFloat(field1Value))) {
            setField2Value("");
        }
        else if (field1Value && conversionRate) {
            let amount = parseFloat(field1Value) * conversionRate;
            setField2Value(amount.toFixed(7));
        }
        else {
            setField2Value("");
        }

    }, [field1Value, conversionRate]);

    useEffect(() => {
        // This hook creates a timeout that will run every ~10 seconds, it's role is to check if the user's balance has
        // updated has changed. This allows them to see when a transaction completes by looking at the balance output.
        // It only updates the balance field in the currency state to prevent this hook from triggering the 'conversionRate' hook.

        const currencyTimeout = setTimeout(() => {
            console.log("Checking balances...")

            if (currency1) {
                getBalanceAndSymbol(account, currency1.address, provider, signer)
                    .then(data => {
                        setCurrency1({
                            ...currency1,
                            balance: data.balance,
                        })
                    })
            }
            if (currency2) {
                getBalanceAndSymbol(account, currency2.address, provider, signer)
                    .then(data => {
                        setCurrency2({
                            ...currency2,
                            balance: data.balance,
                        })
                    })
            }
        }, 10000);

        return () => clearTimeout(currencyTimeout);
    })

    useEffect(() => {
        // This hook will run when the component first mounts, it can be useful to put logic to populate variables here

        getAccount().then(account => {
            setAccount(account);
        })
    })

    return (
        <div>
            {/* Dialog Windows */}
            <CurrencyDialog open={dialog1Open} onClose={onToken1Selected} signer={signer}/>
            <CurrencyDialog open={dialog2Open} onClose={onToken2Selected} signer={signer}/>

            {/* Currency Swapper */}
            <Container maxWidth="xs">
                <Paper className={classes.paperContainer}>
                    <Typography variant="h5" className={classes.title}>Swap Currencies</Typography>

                    <Grid container direction="column" alignItems="center" spacing={2}>
                        <Grid item xs={12} className={classes.fullWidth}>
                            <CurrencyField
                                activeField={true}
                                value={field1Value}
                                onClick={() => setDialog1Open(true)}
                                onChange={handleChange.field1}
                                symbol={currency1.symbol !== undefined ? currency1.symbol : "Select"}
                            />
                        </Grid>

                        <IconButton onClick={switchFields} className={classes.switchButton}>
                            <SwapVerticalCircleIcon fontSize="medium"/>
                        </IconButton>

                        <Grid item xs={12} className={classes.fullWidth}>
                            <CurrencyField
                                activeField={false}
                                value={field2Value}
                                onClick={() => setDialog2Open(true)}
                                symbol={currency2.symbol !== undefined ? currency2.symbol : "Select"}
                            />
                        </Grid>

                        <hr className={classes.hr}/>

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

                        <hr className={classes.hr}/>

                        <Button color="primary" size="large" variant="contained" onClick={swap} disabled={!isButtonEnabled()}>
                            <LoopIcon/>
                            Swap
                        </Button>
                    </Grid>
                </Paper>
            </Container>
        </div>
    )
}

export default CurrencySwapper;