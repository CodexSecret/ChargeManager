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
import http from "../http";
import { useFormik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./CustomAvatar.css";
import "./FormButton.css";

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

const admintheme = createTheme({
  palette: {
    primary: {
      main: "#003C94",
    },
    secondary: {
      main: "#0044ff",
    },
    input: {
      color: "#003C94",
    },
  },
});

var color = "#016670";
var hovercolor = "#02535B";

function EditUser() {
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
    onSubmit: (data) => {
      console.log(data);
      if (data.imageFile) {
        data.imageFile = imageFile;
      }
      data.name = data.name.trim();
      data.username = data.username.trim();
      data.email = data.email.trim();
      data.imageFile = data.imageFile;

      http
        .put(`/user/update/${user.id}`, data)
        .then((res) => {
          console.log(res.data);
          navigate("/user-details");
        })
        .catch(function (err) {
          console.log(err.response);
          toast.error(`${err.response.data.message}`);
        });
    },
  });

  const onFileChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 10) {
        toast.error("Maximum file size is 10 MB");
        return;
      }
      let formData = new FormData();
      formData.append("file", file);
      http
        .post("/file/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data.filename);
          setImageFile(res.data.filename);
          formik.setFieldValue("imageFile", res.data.filename);
        })
        .catch(function (error) {
          console.log(error.response);
        });
    }
  };

  return (
    <Container>
      <Box>
        <Box sx={{ display: "none" }}>
          {user.isAdmin && ((color = "#003C94"), (hovercolor = "#032E6D"))}
        </Box>
        <Typography variant="h3" sx={{ my: 2, color: color }}>
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
                  <input
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={onFileChange}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={8}>
              <div className="form-group">
                <ThemeProvider theme={user.isAdmin ? admintheme : usertheme}>
                  <TextField
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
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
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
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
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
                    InputLabelProps={{ shrink: true }}
                  />
                </ThemeProvider>
              </div>

              <Box className="button-group">
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    minWidth: "100px",
                    bgcolor: color,
                    ":hover": {
                      bgcolor: hovercolor,
                      color: "white",
                    },
                  }}
                >
                  Update
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <ToastContainer />
      </Box>
    </Container>
  );
}

export default EditUser;
