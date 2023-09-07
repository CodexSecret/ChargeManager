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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { AccessTime, Search, Clear } from "@mui/icons-material";
import http from "../http";
import dayjs from "dayjs";
import global from "../global";
import UserContext from "../contexts/UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AspectRatio from "@mui/joy/AspectRatio";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

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

var color = "#016670";
var hovercolor = "#02535B";

function Marketplace() {
  const navigate = useNavigate();
  const [marketplaceList, setMarketplaceList] = useState([]);
  const [carList, setCarList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useContext(UserContext);
  const [branchList, setBranchList] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/adminHome");
      }
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  const getMarketplace = async () => {
    try {
      const response = await http.get("/marketplace");
      let filteredCars = response.data;

      if (user) {
        // If user is logged in, filter out cars based on the user ID
        filteredCars = filteredCars.filter((car) => car.userId !== user.id);
      }

      // Filter out expired cars
      const currentDate = dayjs();
      filteredCars = filteredCars.filter(
        (item) => dayjs(item.enddate).isAfter(currentDate)
      );

      // Get all bookings
      const bookingsResponse = await http.get("/booking");
      const bookings = bookingsResponse.data;

      // Filter out cars that have active bookings
      const availableCars = filteredCars.filter((car) => {
        const hasActiveBooking = bookings.some(
          (booking) =>
            booking.carId === car.id && !booking.isDeleted
        );

        return !hasActiveBooking;
      });

      setMarketplaceList(availableCars);
    } catch (error) {
      console.error("Error fetching marketplace:", error);
    }
  };


  const searchAddressOnOneMap = async (address) => {
    try {
      const corsProxyUrl = "https://corsproxy.io/?";
      const apiKey =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMzNkZjQ1OThiZjFkM2JkNjliZmVkMjM1ZjAwMjNlYiIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNjkwODIxMjM5LCJleHAiOjE2OTEwODA0MzksIm5iZiI6MTY5MDgyMTIzOSwianRpIjoic3JjWFVvQkFGdk1hdEhUaSIsInVzZXJfaWQiOjIxMywiZm9yZXZlciI6ZmFsc2V9.CnUxnTLC45_gvjb_O6I5ByeFaRFPjSiSPN0MjWjl9vg";
      const url = `${corsProxyUrl}https://developers.onemap.sg/commonapi/search?searchVal=${encodeURIComponent(
        address
      )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      const response = await axios.get(url, {
        headers: {
          Authorization: apiKey,
        },
      });
      return response.data.results;
    } catch (error) {
      console.error("Error searching address on OneMap:", error);
      return [];
    }
  };

  const handleMapOpen = async (location) => {
    try {
      const response = await http.get("/branch"); // Assuming http is your API client
      const branchData = response.data;

      const selected = branchData.find((branch) => branch.nickname === location);
      if (selected && selected.address) {
        const searchResults = await searchAddressOnOneMap(selected.address);
        if (searchResults.length > 0) {
          const firstResult = searchResults[0];
          setSelectedBranch({
            ...selected,
            latitude: firstResult.LATITUDE,
            longitude: firstResult.LONGITUDE,
          });
          setOpenMapDialog(true);
        } else {
          console.error("No results found on OneMap for the address:", selected.address);
        }
      } else {
        console.error("Selected branch or address is missing or invalid:", selected);
      }
    } catch (error) {
      console.error("Error fetching branch data or searching address on OneMap:", error);
    }
  };

  const handleMapClose = () => {
    setSelectedBranch(null);
    setOpenMapDialog(false);
  };

  const searchMarketplace = () => {
    const endpoint = user
      ? `/marketplace?search=${search}&excludeUserId=${user.id}`
      : `/marketplace?search=${search}`;
    http.get(endpoint).then((res) => {
      let filteredMarketplace = res.data;
      if (user) {
        filteredMarketplace = filteredMarketplace.filter(
          (item) => item.userId !== user.id
        );
      }
      setMarketplaceList(filteredMarketplace);
    });
  };

  useEffect(() => {
    getMarketplace();
    http.get("/car").then((res) => {
      setCarList(res.data);
    });
    if (user) {
      http.get("/chat").then((res) => {
        setChatList(res.data);
      });
    }
  }, []);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchMarketplace();
    }
    if (e.key === "Escape") {
      setSearch("");
      searchMarketplace();
    }
  };

  const onClickSearch = () => {
    searchMarketplace();
  };

  const onClickClear = () => {
    setSearch("");
    getMarketplace();
  };

  useEffect(() => {
    getMarketplace();
  }, [user]);

  //Allister was here

  const getChats = () => {
    if (user) {
      http.get("/chat").then((res) => {
        setChatList(res.data);
      });
    }
  };

  const ChatPopup = (carid) => {
    var car;
    var createnewchat = true;
    for (var j in carList) {
      if (carList[j].id == carid) {
        car = carList[j];
      }
    }
    for (var k in chatList) {
      for (var m in carList) {
        if (carList[m].id == chatList[k].carId) {
          if (
            user.id == chatList[k].userId &&
            carList[m].userId == car.userId &&
            carList[m].carmodel == car.carmodel
          ) {
            if (chatList[k].delete) {
              if (user.id == chatList[k].userDelete1 || user.id == chatList[k].userDelete2) {
                chatList[k].delete = false
                chatList[k].userDelete1 = null
                chatList[k].userDelete2 = null
                http.put(`/chat/${chatList[k].id}`, chatList[k]);
              }
            }
            toast.error("Chat already exists");
            createnewchat = false;
            navigate("/chats");
          } else if (
            ((user.id == chatList[k].userId &&
              carList[m].userId == car.userId) ||
              (carList[m].userId == user.id &&
                chatList[k].userId == car.userId)) &&
            carList[m].carmodel != car.carmodel
          ) {
            toast.info("Chat has been updated");

            if (chatList[k].delete) {
              if (user.id == chatList[k].userDelete1 || user.id == chatList[k].userDelete2) {
                chatList[k].carId = carid
                chatList[k].delete = false
                chatList[k].userDelete1 = null
                chatList[k].userDelete2 = null
                http.put(`/chat/${chatList[k].id}`, chatList[k]);
              }
            } else {
              http.put(`/chat/${chatList[k].id}`, { carId: carid });
            }
            createnewchat = false;
            getChats();
            navigate("/chats");
          }
        }
      }
    }
    if (createnewchat) {
      toast.success("Chat has been created");
      http.post(`/chat/${carid}`);
      getChats();
      navigate("/chats");
    }
    return;
  };

  return (
    <Container>
      <Box>
        {getChats()}
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Marketplace
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
        </Box>
        <Grid container spacing={2}>
          {marketplaceList.map((marketplace, i) => {
            const endDate = dayjs(marketplace.enddate);
            const isEndDatePassed = endDate.isBefore(dayjs());

            //const endDate = dayjs(marketplace.enddate, 'YYYY-MM-DD'); // Assuming the format is 'YYYY-MM-DD'
            //const isEndDatePassed = endDate.isBefore(dayjs(), 'day'); // Compare only the dates without considering time

            return (
              <Grid item xs={12} md={6} lg={4} key={marketplace.id}>
                <Card>
                  {marketplace.imageFile && (
                    <AspectRatio>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_FILE_BASE_URL}${marketplace.imageFile
                          }`}
                        alt="marketplace"
                      />
                    </AspectRatio>
                  )}
                  <CardContent>
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, fontWeight: "bold" }}
                      >
                        {marketplace.license}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    > {user && (
                      <Link to={`/allreviews/${marketplace.userId}/0`}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Avatar
                            sx={{ mr: 1, color: "white" }}
                            alt={marketplace.user.username}
                            src={`${import.meta.env.VITE_FILE_BASE_URL}${marketplace.user.imageFile
                              }`}
                          />
                          <Typography color="text.secondary">{marketplace.user.username}</Typography>
                        </Box>
                      </Link>
                    )}
                      {!user && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Avatar
                            sx={{ mr: 1, color: "white" }}
                            alt={marketplace.user.username}
                            src={`${import.meta.env.VITE_FILE_BASE_URL}${marketplace.user.imageFile
                              }`}
                          />
                          <Typography color="text.secondary">{marketplace.user.username}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      color="text.secondary"
                    >
                      <AccessTime sx={{ mr: 1 }} />
                      <Typography>
                        {dayjs(marketplace.createdAt).format(
                          global.datetimeFormat
                        )}
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
                        {marketplace.carmodel}
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
                        {marketplace.location}
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
                        {marketplace.startdate}
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
                        {marketplace.enddate}
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
                        {marketplace.price}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", minWidth: "120px" }}
                    >
                      Description:
                    </Typography>
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                      }}
                    >
                      {marketplace.description}
                    </Typography>
                    {user && (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              minWidth: "100px",
                              bgcolor: color,
                              ":hover": {
                                bgcolor: hovercolor,
                                color: "white",
                              },
                              marginRight: "3px",
                            }}
                            onClick={() => handleMapOpen(marketplace.location)}
                          >
                            Locate
                          </Button>
                          <Link
                            to={`/addbooking/${marketplace.id}`} // Use the route parameter to pass the car ID
                            style={{
                              textDecoration: "none",
                              marginRight: "3px",
                            }}
                          >
                            <Button
                              variant="contained"
                              disabled={isEndDatePassed}
                              sx={{
                                minWidth: "100px",
                                bgcolor: color,
                                ":hover": {
                                  bgcolor: hovercolor,
                                  color: "white",
                                },
                              }}
                            >
                              Rent
                            </Button>
                          </Link>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                          }}
                        >
                          {/* <Link
                            to={`/addreview/${marketplace.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Button variant="contained" sx={{ bgcolor: "#016670" }}>Add Review</Button>
                          </Link> */}
                          <Link
                            to={`/carreviews/${marketplace.id}`}
                            style={{
                              textDecoration: "none",
                              marginRight: "3px",
                            }}
                          >
                            <Button
                              variant="contained"
                              sx={{
                                minWidth: "100px",
                                bgcolor: color,
                                ":hover": {
                                  bgcolor: hovercolor,
                                  color: "white",
                                },
                              }}
                            >
                              Review
                            </Button>
                          </Link>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              ChatPopup(marketplace.id);
                            }}
                          >
                            Chat to seller
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <ToastContainer />
        <Dialog open={openMapDialog} onClose={handleMapClose}>
          <DialogTitle>Branch Location</DialogTitle>
          <DialogContent sx={{ width: "400px", height: "400px" }}>
            {selectedBranch &&
              selectedBranch.latitude &&
              selectedBranch.longitude ? (
              <MapContainer
                center={[selectedBranch.latitude, selectedBranch.longitude]}
                zoom={15}
                style={{ height: "400px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[selectedBranch.latitude, selectedBranch.longitude]}
                >
                  <Popup>{selectedBranch.address}</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <p>No map data available.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="inherit"
              onClick={handleMapClose}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Marketplace;
