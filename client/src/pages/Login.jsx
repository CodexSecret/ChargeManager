import React, { useContext, useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
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
import LoginImage from "../pageimages/login.jpg";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUserCheck] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get("/user/auth").then((res) => {
        setUserCheck(res.data.user);
      });
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .max(50, "Email must be at most 50 characters")
        .required("Email is required"),
      password: yup
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .required("Password is required"),
    }),
    onSubmit: (data) => {
      data.email = data.email.trim().toLowerCase();
      data.password = data.password.trim();
      http
        .post("/user/login", data)
        .then((res) => {
          localStorage.setItem("accessToken", res.data.accessToken);
          setUser(res.data.user);
          if (res.data.user.isAdmin) {
            navigate("/adminhome");
          } else {
            navigate("/marketplace");
          }
          window.location.reload();
        })
        .catch(function (err) {
          toast.error(`${err.response.data.message}`, {
            position: toast.POSITION.BOTTOM_LEFT,
          });
        });
    },
  });

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={7} sx={{ px: "5vw", py: "2vw" }}>
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
              Login
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
                <TextField
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                  size="small"
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                          <IconButton onClick={handleShowPassword}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                      <Link to="/forgotpassword">
                        <u> Forgot Password? </u>
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
                      Login
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
          backgroundImage: 'url("https://images.unsplash.com/photo-1611162242122-da5879b25e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80")',
          height: "100vh",
          backgroundSize: "cover",
        }}
      ></Grid>
    </Grid>
  );
}

export default Login;
