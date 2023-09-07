import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Avatar,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Switch,
  Container,
} from "@mui/material";
import AspectRatio from "@mui/joy/AspectRatio";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { debounce } from "lodash";
import "./CustomAvatar.css";
import "./FormGroup.css";
import "./FormButton.css";
import http from "../http";
import { useFormik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserContext from "../contexts/UserContext";

const admintheme = createTheme({
  palette: {
    primary: {
      main: "#003C94",
    },
    secondary: {
      main: "#0044ff",
    },
  },
});

function AdminEditUser() {
  const { id } = useParams();
  console.log(id);
  // console.log(useParams());
  const navigate = useNavigate();
  const { user: loggedUser } = useContext(UserContext);

  useEffect(() => {
    if (!loggedUser || !loggedUser.isAdmin) {
      navigate("/");
    }
  }, [loggedUser, navigate]);


  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    isAdmin: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const [currentUser, setCurrentUser] = useState({
    id: "",
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await http.get("/user/getuser");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getCurrentUser();
  }, []);

  const isCurrentUserEditing = user.id === currentUser.id;

  useEffect(() => {
    http.get(`/user/admingetuser/${id}`).then((res) => {
      setUser(res.data);
      setImageFile(res.data.imageFile);
      console.log(res.data);
    });
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
      isAdmin: yup.string().required("Please select an option"),
    }),
    onSubmit: (data) => {
      console.log(data);
      data.name = data.name.trim();
      data.username = data.username.trim();
      data.email = data.email.trim();
      data.isAdmin = data.isAdmin.trim();

      http
        .put(`/user/adminupdate/${id}`, data)
        .then((res) => {
          console.log(res.data);
          navigate("/users");
        })
        .catch(function (err) {
          console.log(err.response);
          toast.error(`${err.response.data.message}`);
        });
    },
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
      .delete(`/user/admindelete/${id}`)
      .then((res) => {
        console.log(res.data);
        // localStorage.clear();
        handleClose();
        window.location = "/users";
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
          Edit User Details
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                className="avatar-box"
                sx={{
                  textAlign: "center",
                  mt: 2,
                  bgcolor: "#003C94",
                  ":hover": {
                    bgcolor: "#032E6D",
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
              </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={8}>
              <div className="form-group">
                <ThemeProvider theme={admintheme}>
                  <TextField
                    disabled={isCurrentUserEditing}
                    fullWidth
                    variant="standard"
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
                    disabled={isCurrentUserEditing}
                    fullWidth
                    variant="standard"
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
                    disabled={isCurrentUserEditing}
                    fullWidth
                    variant="standard"
                    margin="normal"
                    autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                  <Typography sx={{ mr: 2 }}>Is Admin:</Typography>
                  <Switch
                    disabled={isCurrentUserEditing}
                    sx={{ justifyContent: "left" }}
                    checked={user.isAdmin}
                    onChange={(e) => {
                      setUser((prevState) => ({
                        ...prevState,
                        isAdmin: e.target.checked,
                      }));
                    }}
                  />
                </ThemeProvider>
              </div>
            </Grid>
            
          </Grid>


          <Box sx={{ mt: 2 }}>
            <Link to="/users" style={{ textDecoration: "none" }}>
              <Button
                sx={{ mr: 2 }}
                color="warning"
                variant="contained">
                Back
              </Button>
            </Link>

            <Button
              disabled={isCurrentUserEditing}
              variant="contained"
              type="submit"
              sx={{
                bgcolor: "#003C94",
                ":hover": {
                  bgcolor: "#032E6D",
                  color: "white",
                },
              }}
            >
              Update
            </Button>
            <Button
              disabled={isCurrentUserEditing}
              variant="contained"
              sx={{ ml: 2 }}
              color="error"
              onClick={handleOpen}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
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

export default AdminEditUser;
