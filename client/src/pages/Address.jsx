import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Input,
  IconButton,
  Button,
  Container
} from "@mui/material";
import {
  AccountCircle,
  AccessTime,
  Delete,
  Search,
  Clear,
  Edit,
} from "@mui/icons-material";
import http from "../http";
import UserContext from "../contexts/UserContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const usertheme = createTheme({
  palette: {
    primary: {
      main: "#016670",
    },
    secondary: {
      main: "#0044ff",
    },
  },
});

function Address() {
  const navigate = useNavigate();
  const [addressList, setAddressList] = useState([]);
  const [search, setSearch] = useState("");
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) {
        navigate("/adminHome");
      }
    } else {
      navigate("/");
    }
  }, [currentUser, navigate]);


  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getAddress = () => {
    http.get("/address").then((res) => {
      let filteredAddress = res.data;
      filteredAddress = filteredAddress.filter(
          (address) => address.userId === currentUser.id
        );
      setAddressList(filteredAddress);
    });
  };;

  const searchAddress = () => {
    http.get(`/address?search=${search}`).then((res) => {
      let filteredAddress = res.data;
        filteredAddress = filteredAddress.filter(
          (address) => address.userId === currentUser.id
        );
      setAddressList(filteredAddress);
    });
  };

  useEffect(() => {
    getAddress();
  }, []);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchAddress();
    }
  };

  const onClickSearch = () => {
    searchAddress();
  };

  const onClickClear = () => {
    setSearch("");
    getAddress();
  };

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2 }}>
          Address List
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ThemeProvider theme={usertheme}>
            <Input
              value={search}
              placeholder="Search"
              onChange={onSearchChange}
              onKeyDown={onSearchKeyDown}
            />
            <IconButton color="primary" onClick={onClickSearch}>
              <Search />
            </IconButton>
            <IconButton color="primary" onClick={onClickClear}>
              <Clear />
            </IconButton>
          </ThemeProvider>

          {currentUser && (
            <Box sx={{ display: "flex", ml: "auto" }}>
              <Link
                to={`/newaddress/${currentUser.id}`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="contained"
                  sx={{
                    minWidth: "150px",
                    bgcolor: "#016670",
                    ":hover": {
                      bgcolor: "#02535B",
                      color: "white",
                    },
                  }}
                >
                  Add New Address
                </Button>
              </Link>
            </Box>
          )}
        </Box>

        <Grid container spacing={2}>
          {addressList.map((address, i) => {
            return (
              <Grid item xs={12} md={6} lg={4} key={address.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {address.addressLineOne}
                      </Typography>
                      {currentUser &&
                        currentUser.id === address.userId && (
                          <ThemeProvider theme={usertheme}>
                            <Link
                              to={`/editaddress/${address.id}`}
                            >
                              <IconButton
                                color="primary"
                                sx={{ padding: "4px" }}
                              >
                                <Edit />
                              </IconButton>
                            </Link>
                          </ThemeProvider>
                          
                        )}
                    </Box>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {address.addressLineOne}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {address.addressLineTwo}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {address.addressLineThree}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {address.zipcode}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {address.city}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {address.country}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
}

export default Address;
