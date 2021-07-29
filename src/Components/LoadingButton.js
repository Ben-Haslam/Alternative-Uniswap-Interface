import React from "react";
import {Button, CircularProgress, makeStyles} from "@material-ui/core";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";


const useStyles = makeStyles((theme) => ({
    wrapper: {
        margin: 0,
        position: 'relative',
    },
    success: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    fail: {
        backgroundColor: red[500],
        '&:hover': {
            backgroundColor: red[700],
        },
    },
    progress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

export default function LoadingButton(props) {
    const classes = useStyles();

    const { children, loading, valid, success, fail, onClick, ...other} = props;

    const calculateClass = () => {
        if (fail) { return classes.fail}
        if (!loading && success) { return classes.success }
    }

    return (
        <div className={classes.wrapper}>
            <Button variant="contained" color="primary" fullWidth disabled={loading || !valid} type="submit" onClick={onClick} className={calculateClass()} {...other}>
                {children}
            </Button>
            {loading && <CircularProgress size={24} className={classes.progress} />}
        </div>
    )
}
