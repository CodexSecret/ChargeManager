import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Input,
  Container,
} from "@mui/material";
import { Search, Clear, Delete } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import http from "../http";
import dayjs from "dayjs";
import global from "../global";
import UserContext from "../contexts/UserContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

const admintheme = createTheme({
  palette: {
    primary: {
      main: "#013C94",
    },
    secondary: {
      main: "#0044ff",
    },
    input: {
      color: "#013C94",
    },
  },
});

function AdminBooking() {
  const navigate = useNavigate();
  const [bookingList, setBookingList] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user && user.isAdmin) {
      navigate("/adminbooking");
    }
  }, [user, navigate]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getBookings = async () => {
    try {
      const response = await http.get('/booking');
      const filteredBooking = filterBookings(response.data);
      setBookingList(filteredBooking);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const searchBookings = async () => {
    try {
      const endpoint = `/booking?search=${search}`;
      const response = await http.get(endpoint);
      const filteredBooking = filterBookings(response.data);
      setBookingList(filteredBooking);
    } catch (error) {
      console.error("Error searching bookings:", error);
    }
  };

  const filterBookings = (bookings) => {
    return bookings.map((booking) => ({
      ...booking,
      id: booking.bookingId.slice(0, 6).toUpperCase()
    }));
  };
  
  

  useEffect(() => {
    getBookings();
  }, []);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchBookings();
    }
  };

  const onClickSearch = () => {
    searchBookings();
  };

  const onClickClear = () => {
    setSearch("");
    getBookings();
  };



  const columns = [
    { field: "id", headerName: "ID", width: 100},
    { field: "licenseNew", headerName: "License", width: 120 },
    { field: "carModelNew", headerName: "Car Model", width: 120 },
    { field: "locationNew", headerName: "Location", width: 130 },
    { field: "totalCost", headerName: "Total Cost", width: 100 },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 100,
      valueGetter: (params) =>
        dayjs(params.row.startDate).format("DD-MM-YY"), // Access startDate directly from params.row
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 110,
      valueGetter: (params) =>
        dayjs(params.row.endDate).format("DD-MM-YY"), // Access endDate directly from params.row
    },
    {
        field: "childBooster",
        headerName: "Child Booster",
        width: 120,
        renderCell: (params) => (
          <Typography>
            {params.row.childBooster ? "Yes" : "No"}
          </Typography>
        ),
      },
      {
        field: "insurance",
        headerName: "Insurance",
        width: 100,
        renderCell: (params) => (
          <Typography>
            {params.row.insurance ? "Yes" : "No"}
          </Typography>
        ),
      },
      {
        field: "isDeleted",
        headerName: "Cancelled",
        width: 100,
        renderCell: (params) => (
          <Typography>
            {params.row.isDeleted ? "Yes" : "No"}
          </Typography>
        ),
      },
  ];
  

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
          Booking List
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ThemeProvider theme={admintheme}>
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

        <ThemeProvider theme={admintheme}>
          <DataGrid
            rows={bookingList}
            columns={columns}
            pageSize={5}
            disableSelectionOnClick
          />
        </ThemeProvider>

        
      </Box>
    </Container>
  );
}

export default AdminBooking;
