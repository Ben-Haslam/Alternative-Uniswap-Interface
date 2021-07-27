import React from "react";
import {
    Container,
    Fab,
    Grid,
    makeStyles,
    Paper,
    Typography,
} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as COLORS from "@material-ui/core/colors"
import CurrencyDialog from "./CurrencyDialog";


const styles = (theme) => ({
    paperContainer: {
        borderRadius: theme.spacing(2),
        padding: theme.spacing(1),
        minHeight: "500px"
    },
    currencyFieldContainer: {
        padding: theme.spacing(1),
        minHeight: "80px",
        backgroundColor: COLORS.grey[50],
        borderRadius: theme.spacing(2),
        borderColor: COLORS.grey[300],
        borderWidth: "1px",
        borderStyle: "solid"
    },
    currencyFieldGrid: {
        height: "100%"
    },
    fab: {
        zIndex: "0",
    },
})

const useStyles = makeStyles(styles);

export default function CurrencySwapper(props) {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);

    return (
        <div>
            <CurrencyDialog open={open} onClose={(address) => {
                setOpen(false);
                console.log(address)
            }}/>

            <Container maxWidth="xs">
                <Paper className={classes.paperContainer}>
                    <Typography variant="h6">Swap Currencies</Typography>

                    <Grid container direction="column">
                        <div className={classes.currencyFieldContainer}>
                            <Grid container direction="row" justifyContent="space-between" alignItems="center" className={classes.currencyFieldGrid}>
                                <Fab size="small" variant="extended" color={COLORS.red[500]} onClick={() => setOpen(true)} className={classes.fab}>
                                    ETH
                                    <ExpandMoreIcon/>
                                </Fab>
                                <Typography>Currency 1</Typography>
                            </Grid>
                        </div>
                    </Grid>
                </Paper>
            </Container>
        </div>
    )
}