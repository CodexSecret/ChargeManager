import React, { useEffect, useContext } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../contexts/UserContext";

const Confirmation = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(UserContext);
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) {
        navigate("/adminHome");
      }
    } else {
      navigate("/");
    }
  }, [currentUser, navigate]
  );

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "white", // White background
          padding: "16px", // Add padding to create the box around the content
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Add a box shadow for a card-like effect
          borderRadius: "8px", // Add border radius to round the corners
        }}
      >
        <FontAwesomeIcon icon={faCheckCircle} size="3x" color="#008000" />
        <Typography variant="h5" sx={{ my: 2 }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          Thank you for your booking. Your booking has been confirmed
          successfully.
        </Typography>
        <Link to="/booking" style={{ textDecoration: "none" }}>
          <Typography
            variant="body1"
            component="span"
            sx={{ my: 2, fontWeight: "bold", textDecoration: "underline" }}
          >
            Go to Booking
          </Typography>
        </Link>
      </Box>
    </Container>
  );
};

export default Confirmation;
