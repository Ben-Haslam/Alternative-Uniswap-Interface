import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  ButtonGroup,
  Button,
} from "@material-ui/core";

import LiquidityDeployer from "./LiquidityDeployer";
import LiquidityRemover from "./RemoveLiquidity";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    maxWidth: 700,
    margin: "auto",
  },
  fullWidth: {
    width: "100%",
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
  footer: {
    marginTop: "155px",
  },
});

const useStyles = makeStyles(styles);

function Liquidity() {
  const classes = useStyles();

  const [deploy, setDeploy] = React.useState(true);

  const deploy_or_remove = (deploy) => {
    if (deploy === true) {
      return <LiquidityDeployer />;
    }
    return <LiquidityRemover />;
  };

  const changeStyles = (K) => {
    if (K === true) {
      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = "#ff0000";

      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = "#9e9e9e";
    } else {
      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = "#ff0000";

      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = "#9e9e9e";
    }
  };

  return (
    <div>
      <Container>
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            <ButtonGroup size="large" variant="contained">
              <Button
                id="add-button"
                color="primary"
                text="white"
                onClick={() => {
                  setDeploy(true);
                  changeStyles(true);
                }}
              >
                Deploy Liquidity
              </Button>

              <Button
                id="remove-button"
                color="secondary"
                text="white"
                onClick={() => {
                  setDeploy(false);
                  changeStyles(false);
                }}
              >
                Remove Liquidity
              </Button>
            </ButtonGroup>
          </Typography>

          {deploy_or_remove(deploy)}
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
}

export default Liquidity;
