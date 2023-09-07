import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Input,
  IconButton,
  Button,
  Divider,
  Container,
} from "@mui/material";
import {
  AccountCircle,
  AccessTime,
  Search,
  Clear,
  Edit,
} from "@mui/icons-material";
import http from "../http";
import dayjs from "dayjs";
import global from "../global";
import UserContext from "../contexts/UserContext";
import AspectRatio from "@mui/joy/AspectRatio";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const usertheme = createTheme({
  palette: {
    primary: {
      main: "#016670",
    },
    secondary: {
      main: "#0044ff",
    },
    input: {
      color: "#016670",
    },
  },
});


function OldCars() {
  const navigate = useNavigate(); 
  const [carList, setCarList] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/adminHome");
      }
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getOldCars = () => {
    http.get("/car").then((res) => {
      let filteredOldCars = res.data;
      if (user) {
        filteredOldCars = filteredOldCars.filter(
          (car) => car.userId === user.id
        );
        filteredOldCars = filteredOldCars.filter((car) => {
          const currentDate = dayjs();
          const endDate = dayjs(car.enddate);
          return car.userId === user.id && endDate.isBefore(currentDate);
        });
      }
      setCarList(filteredOldCars);
    });
  };

  const searchOldCars = () => {
    http.get(`/car?search=${search}`).then((res) => {
      let filteredCars = res.data;
      if (user) {
        filteredCars = filteredCars.filter(car => car.userId === user.id);
        filteredOldCars = filteredOldCars.filter((car) => {
          const currentDate = dayjs();
          const endDate = dayjs(car.enddate);
          return car.userId === user.id && endDate.isBefore(currentDate);
        });
      }
      setCarList(filteredCars);
    });
  };

  useEffect(() => {
    getOldCars();
  }, []);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchOldCars();
    }
    if (e.key === "Escape") {
      setSearch("");
      searchOldCars();
    }
  };

  const onClickSearch = () => {
    searchOldCars();
  };

  const onClickClear = () => {
    setSearch("");
    getOldCars();
  };

  useEffect(() => {
    getOldCars();
  }, [user]);

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Old Cars
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

            <Box sx={{ flexGrow: 1 }} />
            {user && (
              <Link to="/cars" style={{ textDecoration: "none" }}>
                <Button variant="contained">Back to Cars</Button>
              </Link>
            )}
          </ThemeProvider>

        </Box>


        <Grid container spacing={2}>
          {carList.map((car, i) => {
            return (
              <Grid item xs={12} md={6} lg={4} key={car.id}>
                <Card
                  sx={{
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  {car.imageFile && (
                    <AspectRatio>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_FILE_BASE_URL}${car.imageFile
                          }`}
                        alt="car"
                      />
                    </AspectRatio>
                  )}
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, fontWeight: "bold" }}
                      >
                        {car.license}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      color="text.secondary"
                    >
                      <AccountCircle sx={{ mr: 1 }} />
                      <Typography>{car.user.name}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      color="text.secondary"
                    >
                      <AccessTime sx={{ mr: 1 }} />
                      <Typography>
                        {dayjs(car.createdAt).format(global.datetimeFormat)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Car Model:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {car.carmodel}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Location:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {car.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Start Date:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {car.startdate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        End Date:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {car.enddate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Price:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {car.price}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Description:
                    </Typography>
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                      }}
                    >
                      {car.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container >
  );
}

export default OldCars;
