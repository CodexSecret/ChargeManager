import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import { Box, Typography, Container } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

const ErrorPage = () => {
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
  }, [currentUser, navigate]);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <ErrorOutline sx={{ fontSize: 60, color: "error.main" }} />
        <Typography variant="h5" sx={{ my: 2 }}>
          Oops! Something went wrong.
        </Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          Please try again later.
        </Typography>
      </Box>
    </Container>
  );
};

export default ErrorPage;
