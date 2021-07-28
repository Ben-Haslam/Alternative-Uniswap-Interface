import React from "react";
import {
    Button,
    Dialog,
    Grid,
    IconButton, makeStyles,
    TextField,
    Typography,
    withStyles
} from "@material-ui/core";
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';
import CurrencyButton from "./CurrencyButton";
import {doesTokenExist} from "../ethereum";
import PropTypes from "prop-types";
import * as COLORS from "@material-ui/core/colors"
import * as COINS from '../constants/coins';

const styles = (theme) => ({
    dialogContainer: {
        borderRadius: theme.spacing(2),
    },
    titleSection: {
        padding: theme.spacing(2)
    },
    titleText: {
        alignSelf: "center"
    },
    hr: {
        margin: 0
    },
    address: {
        paddingLeft: theme.spacing(2.5),
        paddingRight: theme.spacing(2.5),
        paddingBottom: theme.spacing(2)
    },
    currencyList: {
        height: "300px",
        overflowY: "scroll",
    },
    currencyContainer: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        paddingTop: theme.spacing(2),
        marginTop: theme.spacing(2),
        overflow: "hidden"
    }
})

const useStyles = makeStyles(styles);

// This is a modified version of MaterialUI's DialogTitle component, I've added a close button in the top right corner
const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.titleSection} {...other}>
            <Grid container direction="row" justifyContent="space-between" alignContent="center">
                <Typography variant="h6" className={classes.titleText}>{children}</Typography>
                {onClose ? (
                    <IconButton aria-label="close" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                ) : null}
            </Grid>
        </MuiDialogTitle>
    );
});

// This is a modified version of MaterialUI's DialogActions component, the color has been changed by modifying the CSS
const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
        backgroundColor: COLORS.grey[100],
    },
}))(MuiDialogActions);

CurrencyDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
}

export default function CurrencyDialog(props) {
    // The CurrencyDialog component will display a dialog window on top of the page, allowing a user to select a currency
    // from a list (list can be found in 'src/constants/coins.js') or enter an address into a search field. Any entered
    // addresses will first be validated to make sure they exist.
    // When the dialog closes, it will call the `onClose` prop with 1 argument which will either be undefined (if the
    // user closes the dialog without selecting anything), or will be a string containing the address of a currency.

    const classes = useStyles();
    const {onClose, open, signer, ...others} = props;

    const [address, setAddress] = React.useState("");
    const [error, setError] = React.useState("");

    // Called when the user tries to input a custom address, this function will validate the address and will either
    // then close the dialog and return the validated address, or will display an error.
    const submit = () => {
        if (doesTokenExist(address, signer)) {
            exit(address)
        }
        else {
            setError("This address is not valid")
        }
    }

    // Resets any fields in the dialog (in case it's opened in the future) and calls the `onClose` prop
    const exit = (value) => {
        setError("");
        setAddress("");
        onClose(value);
    }

    return (
        <Dialog
            open={open}
            onClose={() => exit(undefined)}
            fullWidth
            maxWidth="sm"
            classes={{paper: classes.dialogContainer}}
        >
            <DialogTitle onClose={() => exit(undefined)}>
                Select Currency
            </DialogTitle>

            <hr className={classes.hr}/>

            <div className={classes.currencyContainer}>
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

                    <hr className={classes.hr}/>

                    <Grid item className={classes.currencyList}>
                        <Grid container direction="column">
                            {/* Maps all of the currencies in the constants file to buttons */}
                            {COINS.ALL.map((coin, index) => (
                                <Grid item key={index} xs={12}>
                                    <CurrencyButton
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

            <hr className={classes.hr}/>

            <DialogActions>
                <Button autoFocus onClick={submit} color="primary">
                    Enter
                </Button>
            </DialogActions>
        </Dialog>
    )
}
