import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Container,
  IconButton,
} from "@mui/material";
import AspectRatio from "@mui/joy/AspectRatio";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { debounce } from "lodash";
import http from "../http";
import { useFormik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./CustomAvatar.css";
import "./FormGroup.css";
import "./FormButton.css";
import ClearIcon from '@mui/icons-material/Clear';


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

var color = "#016670";
var hovercolor = "#02535B";

function UserDetails() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);

  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await http.get("/user/getuser");
        setUser(response.data);
        setImageFile(response.data.imageFile);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getUser();
  }, []);

  const formik = useFormik({
    initialValues: user,
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      name: yup
        .string()
        .trim()
        .matches(/^[a-z ,.'-]+$/i, "Invalid name")
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters")
        .required("Name is required"),
      username: yup
        .string()
        .trim()
        .min(1, "Username must be at least 1 character")
        .max(20, "Username must be at most 20 characters")
        .required("Username is required"),
      email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .max(50, "Email must be at most 50 characters")
        .required("Email is required"),
    }),
  });

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deleteUser = () => {
    http
      .delete(`/user/${user.id}`)
      .then((res) => {
        console.log(res.data);
        handleClose();
        localStorage.clear();
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
    http.post(`/accnotif/deletion/${user.id}`).then((res) => {
      console.log(res.data);
    });
  };

  return (
    <Container>
      <Box>
        <Box sx={{ display: "none" }}>
          {user.isAdmin && ((color = "#013C94"), (hovercolor = "#032E6D"))}
        </Box>
        <Typography variant="h4" sx={{ my: 2, color: color }}>
          Account Details
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                className="avatar-box"
                sx={{
                  textAlign: "center",
                  mt: 2,
                  bgcolor: color,
                  ":hover": {
                    bgcolor: hovercolor,
                  },
                }}
              >
                <div className="avatar-container">
                  {imageFile && (
                    <Avatar
                      sx={{
                        width: 112,
                        height: 112,
                        justifyContent: "center",
                        display: "flex",
                      }}
                      alt={user.name}
                      src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`}
                    />
                  )}
                </div>

                <Button
                  variant="contained"
                  component="label"
                  disabled
                  sx={{
                    minWidth: "150px",
                    bgcolor: color,
                    ":hover": {
                      bgcolor: hovercolor,
                      color: "white",
                    },
                  }}
                >
                  Upload Avatar
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={8}>
              <div className="form-group">
                <ThemeProvider theme={theme}>
                  <TextField
                    disabled
                    variant="standard"
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                  <TextField
                    disabled
                    variant="standard"
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    label="Username"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.username && Boolean(formik.errors.username)
                    }
                    helperText={
                      formik.touched.username && formik.errors.username //||
                      //usernameExists &&
                      // "Username is already taken")
                    }
                  />
                  <TextField
                    disabled
                    variant="standard"
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </ThemeProvider>
              </div>

              <div>
                <Box className="button-group">
                  <Link to={`/edituser/${user.id}`}>
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
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="contained"
                    sx={{
                      ml: 2,
                      minWidth: "100px",
                      bgcolor: "#DC3545",
                      ":hover": {
                        bgcolor: "#BB1E2D",
                        color: "white",
                      },
                    }}
                    onClick={handleOpen}
                  >
                    Delete
                  </Button>
                </Box>
                <Box className="button-group">
                  <Link to={`/editpassword/${user.id}`}>
                    <Button
                      variant="contained"
                      sx={{
                        mx: 2,
                        my: 1,
                        minWidth: "100px",
                        bgcolor: "#FFC107",
                        ":hover": {
                          bgcolor: "#F6B900",
                          color: "white",
                        },
                      }}
                    >
                      Update Password
                    </Button>
                  </Link>
                </Box>
              </div>
            </Grid>
          </Grid>
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle
            sx={{
              bgcolor: "error.main",
              color: "white",
              paddingBottom: "16px",
            }}
          >
            Delete User
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ paddingTop: "16px" }}>
              Are you sure you want to delete this account?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={deleteUser}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <ToastContainer />
      </Box>
    </Container>
  );
}

export default UserDetails;
