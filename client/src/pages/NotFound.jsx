import { Link } from "react-router-dom";
import { Box, Typography, Grid, Button, Container } from "@mui/material";

function NotFound() {
  return (
    <Container>
      <Grid xs={12} sm={12} l={12}>
        <Box
          sx={{ alignContents: "center", width: "50%", ml: "25%", mt: "30vh" }}
        >
          <Typography variant="h3">Oops! You seem to be lost.</Typography>
          <Link to="/">
            <Button
              variant="contained"
              sx={{ backgroundColor: "#016670", ml: "25%", mt: "8%" }}
            >
              <Typography sx={{ color: "white" }}>
                Return to Marketplace
              </Typography>
            </Button>
          </Link>
        </Box>
      </Grid>
    </Container>
  );
}

export default NotFound;
