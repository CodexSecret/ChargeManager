import React, { useContext, useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "../contexts/UserContext";
import "./Form.css";
import ForgotPasswordImage from "../pageimages/forgotpassword.jpg";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Link } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#016670",
    },
    secondary: {
      main: "#0044ff",
    },
  },
});

function ResetPassword() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .max(50, "Email must be at most 50 characters")
        .required("Email is required"),
    }),
    onSubmit: (data) => {
      data.email = data.email.trim().toLowerCase();
      http
        .post("/passwordreset", data)
        .then(() => {
          toast.success("Password reset successful!", {
            position: toast.POSITION.BOTTOM_LEFT,
          });
          setTimeout(() => {
            navigate("/login");
          }, 5000); // Wait for 2 seconds before navigating to login page
        })
        .catch(function (err) {
          toast.error(`${err.response.data.message}`, {
            position: toast.POSITION.BOTTOM_LEFT,
          });
        });
    },
  });

  return (
    <Grid container spacing={0}>
      <Grid item xs={7}>
        <div class="FormField">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                my: 2,
                justifyContent: "flex-start",
              }}
            >
              Forgot Password
            </Typography>
            <Box
              component="form"
              sx={{ maxWidth: "400px" }}
              onSubmit={formik.handleSubmit}
            >
              <ThemeProvider theme={theme}>
                <TextField
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  size="small"
                  variant="standard"
                />
              </ThemeProvider>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Typography>
                      Remember your password?
                      <Link to="/login">
                        {" "}
                        <u> Login </u>
                      </Link>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Typography>
                      Don't have an account?
                      <Link to="/register">
                        {" "}
                        <u> Sign Up </u>
                      </Link>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        mt: 2,
                        ml: 1,
                        minWidth: "120px",
                        bgcolor: "#016670",
                        ":hover": {
                          bgcolor: "#02535B",
                          color: "white",
                        },
                      }}
                      type="submit"
                    >
                      Reset
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <ToastContainer />
          </Box>
        </div>
      </Grid>
      <Grid
        item
        xs={5}
        sx={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1615829386703-e2bb66a7cb7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80")',
          height: "100vh",
          backgroundSize: "cover",
        }}
      ></Grid>
    </Grid>
  );
}

export default ResetPassword;
