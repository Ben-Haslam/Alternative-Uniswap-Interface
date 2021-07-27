import React from "react";
import {
    Button,
    Dialog,
    Grid, IconButton,
    TextField,
    Typography,
    withStyles
} from "@material-ui/core";
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';
import CurrencyButton from "./CurrencyButton";
import _App from "../ethereum";
import * as COLORS from "@material-ui/core/colors"
import * as COINS from '../constants/coins';


const styles = (theme) => ({
    dialogPaperContainer: {
        borderRadius: theme.spacing(2),
    },
    dialogTitle: {
        padding: theme.spacing(2)
    },
    dialogTitleTypography: {
        alignSelf: "center"
    },
    hr: {
        margin: 0
    },
    searchField: {
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

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.dialogTitle} {...other}>
            <Grid container direction="row" justifyContent="space-between" alignContent="center">
                <Typography variant="h6" className={classes.dialogTitleTypography}>{children}</Typography>
                {onClose ? (
                    <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                ) : null}
            </Grid>
        </MuiDialogTitle>
    );
});

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
        backgroundColor: COLORS.grey[100],
    },
}))(MuiDialogActions);

class CurrencyDialog extends _App {
    constructor(props) {
        super(props);

        this.state = {
            searchField: "",
            error: "",
        };
    }

    submit() {
        let address = this.state.searchField;
        if (super.doesTokenExist(address)) {
            this.setState({
                error: "",
                searchField: ""
            })
            this.props.onClose(address);
        }
        else {
            this.setState({
                error: "This address is not valid"
            })
        }
    }

    handleChange = {
        searchField: (e) => {
            this.setState({
                searchField: e.target.value
            })
        }
    }

    render() {
        const classes = this.props.classes;

        const exit = () => {
            this.setState({
                error: "",
                searchField: ""
            })
            this.props.onClose("");
        }

        return (
            <Dialog open={this.props.open} onClose={exit} fullWidth maxWidth="sm" classes={{paper: classes.dialogPaperContainer}}>
                <DialogTitle onClose={exit}>Select Currency</DialogTitle>
                <hr className={classes.hr}/>
                <div className={classes.currencyContainer}>
                    <Grid container direction="column" spacing={1} alignContent="center">
                        <TextField
                            value={this.state.searchField}
                            onChange={this.handleChange.searchField.bind(this)}
                            variant="outlined"
                            placeholder="Paste Address"
                            error={this.state.error}
                            helperText={this.state.error}
                            fullWidth
                            className={classes.searchField}
                        />
                        <hr className={classes.hr}/>
                        <Grid item className={classes.currencyList}>
                            <Grid container direction="column">
                                {COINS.ALL.map(coin => (
                                    <CurrencyButton
                                        coinName={coin.name}
                                        coinAbbr={coin.abbr}
                                        onClick={() => this.props.onClose(coin.address)}
                                    />
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
                <hr className={classes.hr}/>
                <DialogActions>
                    <Button autoFocus onClick={this.submit.bind(this)} color="primary">
                        Enter
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default withStyles(styles)(CurrencyDialog);