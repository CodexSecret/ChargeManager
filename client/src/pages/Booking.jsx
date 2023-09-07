import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Input,
  List,
  ListItem,
  ListItemText,
  Container,
} from "@mui/material";
import { AccessTime, Search, Clear, Delete } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
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

function Booking() {
  const navigate = useNavigate();
  const [bookingList, setBookingList] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [canceledBookingId, setCanceledBookingId] = useState(null);
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (user && user.isAdmin) {
      navigate("/adminHome");
    }
  }, [user, navigate]);


  const [pastList, setPastList] = useState([]);

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
      const endpoint = user
        ? `/booking?search=${search}&userId=${user.id}`
        : `/booking?search=${search}`;
      const response = await http.get(endpoint);
      const filteredBooking = filterBookings(response.data);
      setBookingList(filteredBooking);
    } catch (error) {
      console.error("Error searching bookings:", error);
    }
  };
  const filterBookings = (bookings) => {
    if (user) {
      return bookings.filter((booking) => booking.userId === user.id);
    }
    return bookings;
  };



  useEffect(() => {
    if (user) {
      getBookings();
    }
  }, [user]);

  useEffect(() => {
    const pastBookings = bookingList.filter((booking) => new Date(booking.endDate) < new Date());
    setPastList(pastBookings);
  }, [bookingList]);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchBookings();
    }
    if (e.key === "Escape") {
      setSearch("");
      getBookings();
    }
  };

  const onClickSearch = () => {
    searchBookings();
  };

  const onClickClear = () => {
    setSearch("");
    getBookings();
  };
  const handleDeleteBooking = async (bookingId) => {
    try {

      await http.put(`/booking/${bookingId}`, { isDeleted: true });

      // Open the cancellation confirmation dialog when a booking is successfully canceled
      setCanceledBookingId(bookingId);

      // Fetch the updated list of bookings
      getBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };
  
  
  
  const handleOpenConfirmationDialog = (bookingId) => {
    setOpen(true);
    setSelectedBookingId(bookingId);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deleteBooking = async () => {
    if (selectedBookingId) {
      try {
        // Send cancellation email here
        await sendCancellationEmail(selectedBookingId);
  
        // Delete the booking
        await handleDeleteBooking(selectedBookingId);
        setSelectedBookingId(null);
        handleClose();
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };
  
  const sendCancellationEmail = async (bookingId) => {
    try {
      const response = await http.post(`/bookingcancel/${bookingId}`);
      if (response.data.success) {
        console.log("Cancellation email sent:", response.data.messageId);
      } else {
        console.error("Failed to send cancellation email");
      }
    } catch (error) {
      console.error("Error sending cancellation email:", error);
    }
  };

  const sendConfirmationEmail = async (bookingId) => {
    try {
      const response = await http.post(`/bookingemail/${bookingId}`);
      if (response.data.success) {
        console.log("Confirmation email sent:", response.data.messageId);
        setEmailSent(true);
        setEmailError(false);
      } else {
        console.error("Failed to send confirmation email");
        setEmailSent(false);
        setEmailError(true);
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      setEmailSent(false);
      setEmailError(true);
    }
  };


  const filteredPresentBookings = bookingList.filter(
    (booking) => new Date(booking.endDate) > new Date() && !booking.isDeleted
  );

  const filteredPastBookings = pastList.filter(
    (booking) => new Date(booking.endDate) < new Date() && !booking.isDeleted
  );

  useEffect(() => {
    const updateCouponUsageAndHandleCode = async (booking) => {
      try {
        const response = await http.put("/couponusage", {
          couponId: booking.couponId,
          userId: user.id,
        });

        if (response.data.success) {
          // Update handleCode for the booking if coupon update was successful
          const bookingResponse = await http.put(`/booking/updateHandleCode/${booking.bookingId}`);
          console.log(bookingResponse);
          if (bookingResponse.status !== 200) {
            console.error("Failed to update handleCode for booking");
          }
        }
      } catch (error) {
        console.error("Error updating coupon usage and handleCode:", error);
      }
    };

    const updatePointsUsageAndHandlePoints = async (booking) => {
      try {

        // Update handleReward for the booking if coupon update was successful
        const bookingResponse = await http.put(`/booking/updateHandleReward/${booking.bookingId}`);
        console.log(bookingResponse);
        if (bookingResponse.status !== 200) {
          console.error("Failed to update handleReward for booking");
        }
      } catch (error) {
        console.error("Error updating coupon usage and handleReward:", error);
      }
    };

    // Iterating over the filteredPastBookings
    filteredPastBookings.forEach((booking) => {
      if (booking.couponId && new Date(booking.endDate) < new Date() && !booking.handleCode && !booking.isCancelled) {
        updateCouponUsageAndHandleCode(booking);
        updatePointsUsageAndHandlePoints(booking);
      }
    });
  }, [filteredPastBookings]);

  const filteredCancelledBookings = bookingList.filter((booking) => booking.isDeleted);

  const cardStyle = { height: '100%' };
  const extrasListStyle = {
    height: "40px",
    display: "flex",
    alignItems: "center",
    padding: 0,
    flexWrap: "wrap",
    marginBottom: "-8px",
  }; 
  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Booking
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

          <Box sx={{ flexGrow: 1 }} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ textDecoration: "underline" }}>
            Present Bookings:{" "}
          </Typography>
          <Grid container spacing={2}>
            {filteredPresentBookings.map((booking) => (
              <Grid item xs={12} md={6} lg={4} key={booking.id}>
                <Card sx={cardStyle}>
                  {booking.imageFileNew ? (
                    <AspectRatio>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_FILE_BASE_URL}${booking.imageFileNew
                          }`}
                        alt="marketplace"
                        onError={(e) =>
                          (e.target.src = "path/to/fallback/image")
                        }
                      />
                    </AspectRatio>
                  ) : (
                    <Box sx={{ height: 200, backgroundColor: "grey" }}></Box>
                  )}
                  <CardContent>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 2 }}
                      >
                        {booking.licenseNew}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", minWidth: "120px" }}
                        >
                          Car Model:
                        </Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                          {booking.carModelNew}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", minWidth: "120px" }}
                        >
                          Location:
                        </Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                          {booking.locationNew}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", minWidth: "120px" }}
                        >
                          Total Cost:
                        </Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                          {booking.totalCost}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", minWidth: "120px" }}
                        >
                          Dates:
                        </Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                          {dayjs(new Date(booking.startDate)).format(
                            "DD-MM-YY"
                          )}{" "}
                          to{" "}
                          {dayjs(new Date(booking.endDate)).format("DD-MM-YY")}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", minWidth: "120px" }}
                        >
                          Extras:
                        </Typography>
                        <List sx={extrasListStyle}>
                          {booking && (
                            <>
                              {Boolean(booking.childBooster) && (
                                <ListItem sx={{ margin: 0, padding: 0 }}>
                                  <ListItemText primary="Child Booster" />
                                </ListItem>
                              )}
                              {Boolean(booking.insurance) && (
                                <ListItem sx={{ margin: 0, padding: 0 }}>
                                  <ListItemText primary="Insurance" />
                                </ListItem>
                              )}
                              {Boolean(booking.noextras) && (
                                <ListItem sx={{ margin: 0, padding: 0 }}>
                                  <ListItemText primary="No Extras" />
                                </ListItem>
                              )}
                            </>
                          )}
                        </List>
                      </Box>
                    </Box>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", mt: 2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                            mt: 4,
                            marginLeft: 6,
                          }}
                        >
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() =>
                              handleOpenConfirmationDialog(booking.bookingId)
                            }
                            // Add the disabled attribute based on the condition
                            disabled={
                              dayjs(booking.startDate).diff(dayjs(), "day") <= 2
                            }
                            sx={{ marginRight: 1 }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              sendConfirmationEmail(booking.bookingId)
                            }
                          >
                            Confirmation Email
                          </Button>
                          {emailSent && <Typography variant="body2" sx={{ color: "green", ml: 2 }}>
                            Email Sent!
                          </Typography>}
                          {emailError && <Typography variant="body2" sx={{ color: "red", ml: 2 }}>
                            Email Error! Please try again later.
                          </Typography>}
                        </Box>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 2 }}
                      >
                        <AccessTime />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", ml: 1 }}
                        >
                          {dayjs(booking.createdAt).format(
                            global.datetimeFormat
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Past Bookings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ textDecoration: "underline" }}>
            Past Bookings:{" "}
          </Typography>
          <Grid container spacing={2}>
            {filteredPastBookings.map((booking) => (
              <Grid item xs={12} md={6} lg={4} key={booking.id}>
                <Card sx={cardStyle}>
                  {booking.imageFileNew ? (
                    <AspectRatio>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_FILE_BASE_URL}${booking.imageFileNew
                          }`}
                        alt="marketplace"
                        onError={(e) =>
                          (e.target.src = "path/to/fallback/image")
                        }
                      />
                    </AspectRatio>
                  ) : (
                    <Box sx={{ height: 200, backgroundColor: "grey" }}></Box>
                  )}
                  <CardContent>
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, fontWeight: "bold", mb: 2 }}
                      >
                        {booking.licenseNew}
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
                        {booking.carModelNew}
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
                        {booking.locationNew}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        License:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {booking.licenseNew}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Total Cost:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {booking.totalCost}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Dates:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {dayjs(new Date(booking.startDate)).format(
                          "DD-MM-YY"
                        )}{" "}
                        to{" "}
                        {dayjs(new Date(booking.endDate)).format("DD-MM-YY")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Extras:
                      </Typography>
                      <List sx={extrasListStyle}>
                        {booking && (
                          <>
                            {Boolean(booking.childBooster) && (
                              <ListItem sx={{ margin: 0, padding: 0 }}>
                                <ListItemText primary="Child Booster" />
                              </ListItem>
                            )}
                            {Boolean(booking.insurance) && (
                              <ListItem sx={{ margin: 0, padding: 0 }}>
                                <ListItemText primary="Insurance" />
                              </ListItem>
                            )}
                            {Boolean(booking.noextras) && (
                              <ListItem sx={{ margin: 0, padding: 0 }}>
                                <ListItemText primary="No Extras" />
                              </ListItem>
                            )}
                          </>
                        )}
                      </List>
                    </Box>
                    <Box
                      sx={{
                        justifyContent: "flex-end",
                        mb: 1,
                        mt: 4,
                        marginLeft: 27,
                      }}
                    >
                      <Link
                        to={`/addreview/${booking.carId}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Button variant="contained" sx={{bgcolor:"#016670"}}>Add Review</Button>
                      </Link>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          marginTop: "20px",
                        }}
                      >
                        <AccessTime sx={{ mr: 1 }} />
                        {dayjs(booking.createdAt).format(global.datetimeFormat)}
                      </Typography>
                    </Box>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Cancelled Bookings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ textDecoration: "underline" }}>
            Cancelled Bookings:{" "}
          </Typography>
          <Grid container spacing={2}>
            {filteredCancelledBookings.map((booking) => (
              <Grid item xs={12} md={6} lg={4} key={booking.id}>
                <Card sx={cardStyle}>
                  {booking.imageFileNew ? (
                    <AspectRatio>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_FILE_BASE_URL}${booking.imageFileNew
                          }`}
                        alt="marketplace"
                        onError={(e) =>
                          (e.target.src = "path/to/fallback/image")
                        }
                      />
                    </AspectRatio>
                  ) : (
                    <Box sx={{ height: 200, backgroundColor: "grey" }}></Box>
                  )}
                  <CardContent>
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, fontWeight: "bold" }}
                      >
                        {booking.licenseNew}
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
                        {booking.carModelNew}
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
                        {booking.locationNew}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Total Cost:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {booking.totalCost}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Date:
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {dayjs(new Date(booking.startDate)).format("DD-MM-YY")}{" "}
                        to {dayjs(new Date(booking.endDate)).format("DD-MM-YY")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", minWidth: "120px" }}
                      >
                        Extras:
                      </Typography>
                      <List sx={extrasListStyle}>
                        {booking && (
                          <>
                            {Boolean(booking.childBooster) && (
                              <ListItem sx={{ margin: 0, padding: 0 }}>
                                <ListItemText primary="Child Booster" />
                              </ListItem>
                            )}
                            {Boolean(booking.insurance) && (
                              <ListItem sx={{ margin: 0, padding: 0 }}>
                                <ListItemText primary="Insurance" />
                              </ListItem>
                            )}
                            {Boolean(booking.noextras) && (
                              <ListItem sx={{ margin: 0, padding: 0 }}>
                                <ListItemText primary="No Extras" />
                              </ListItem>
                            )}
                          </>
                        )}
                      </List>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "20px",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <AccessTime sx={{ mr: 1 }} />
                          {dayjs(booking.createdAt).format(
                            global.datetimeFormat
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Booking</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this booking?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={deleteBooking} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={emailSent} onClose={() => setEmailSent(false)}>
          <DialogTitle>Email Sent!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The confirmation email has been successfully sent.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailSent(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={emailError} onClose={() => setEmailError(false)}>
          <DialogTitle>Email Error</DialogTitle>
          <DialogContent>
            <DialogContentText>
              There was an error sending the confirmation email. Please try again later.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailError(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={Boolean(canceledBookingId)}
          onClose={() => setCanceledBookingId(null)}
        >
          <DialogTitle>Cancel Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Booking has been canceled. Cancellation email has been sent.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCanceledBookingId(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Booking;
