import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { debounce } from "lodash";
import * as yup from "yup";
import http from "../http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import "./Form.css";
import "./CustomAvatar.css";
import "./FormGroup.css";
import "./FormButton.css";
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

function RegisterPage1({ onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: yup.object().shape({
      name: yup
        .string()
        .trim()
        .matches(/^[a-z ,.'-]+$/i, "Invalid name")
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters")
        .required("Name is required"),
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
        .matches(
          /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~`])/,
          "Password must contain at least 1 special character"
        )
        .matches(/^(?=.*[0-9])/, "Password must contain at least 1 number")
        .required("Password is required"),
      confirmPassword: yup
        .string()
        .trim()
        .required("Confirm password is required")
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    }),
    onSubmit: (data) => {
      onSubmit(data);
    },
  });

  return (
    <Grid container spacing={0}>
      <Grid
        item
        xs={5}
        sx={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1505184158618-46f1e609d036?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80")',
          height: "100vh",
          backgroundSize: "cover",
        }}
      ></Grid>
      <Grid item sx={7}> 
        <div class="FormField">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              padding: "0 5vw",
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
              Sign Up
            </Typography>
            <Box
              component="form"
              sx={{ maxWidth: "400px"}}
              onSubmit={formik.handleSubmit}
            >
              <ThemeProvider theme={theme}>
                <TextField
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  label="Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  size="small"
                  variant="standard"
                />
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
                <TextField
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
                  helperText={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                  size="small"
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowConfirmPassword}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                      Already have an Account?
                      <Link to="/login">
                        {" "}
                        <u> Log In </u>
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
                      Next
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <ToastContainer />
          </Box>
        </div>
      </Grid>
    </Grid>
  );
}

function RegisterPage2({ onSubmit }) {
  const [imageFile, setImageFile] = useState(() => null);

  const formik = useFormik({
    initialValues: {
      username: "",
    },
    validationSchema: yup.object().shape({
      username: yup
        .string()
        .trim()
        .min(1, "Username must be at least 1 character")
        .max(20, "Username must be at most 20 characters")
        .required("Username is required"),
    }),
    onSubmit: (data) => {
      if (imageFile) {
        data.imageFile = imageFile;
      }
      onSubmit(data);
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
        })
        .catch(function (error) {
          console.log(error.response);
        });
    }
  };

  return (
    <Grid container spacing={0}>
      <Grid
        item
        xs={5}
        sx={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1602918386084-58983c3bafac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=464&q=80")',
          height: "100vh",
          backgroundSize: "cover",
        }}
      ></Grid>

      <Grid item xs={7}>
        <div class="FormField">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              padding: "0 5vw",
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
              Register
            </Typography>
            <Box
              component="form"
              sx={{ maxWidth: "500px" }}
              onSubmit={formik.handleSubmit}
            >
              <Box
                className="avatar-box"
                sx={{
                  textAlign: "center",
                  mt: 2,
                  bgcolor: "#016670",
                  ":hover": {
                    bgcolor: "#02535B",
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
                      alt={"New user"}
                      src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`}
                    />
                  )}
                </div>

                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    minWidth: "150px",
                    bgcolor: "#016670",
                    ":hover": {
                      bgcolor: "#02535B",
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
              <ThemeProvider theme={theme}>
                <TextField
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
                    // (usernameExists &&
                    //     "Username is already taken"))
                  }
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
                      Already have an Account?{" "}
                      <Link to="/login">
                        {" "}
                        <u> Log In </u>
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
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 2,
                        bgcolor: "#016670",
                        ":hover": {
                          bgcolor: "#02535B",
                          color: "white",
                        },
                      }}
                      type="submit"
                      disabled={!formik.isValid}
                    >
                      Register
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <ToastContainer />
          </Box>
        </div>
      </Grid>
    </Grid>

  );
}

function Register() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const [user, setUserCheck] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get("/user/auth").then((res) => {
        setUserCheck(res.data.user);
      });
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    imageFile: "",
  });

  const handlePage1Submit = (data) => {
    setFormData((prevData) => ({
      ...prevData,
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    }));
    setCurrentPage(2);
  };

  // const handleBack = (data) => {
  //     setFormData((prevData) => ({
  //         ...prevData,
  //         name: data.name,
  //         email: data.email,
  //         password: data.password,
  //         confirmPassword: data.confirmPassword,
  //     }));
  //     setCurrentPage(1);
  // };

  const handleFormSubmit = (data) => {
    setFormData((prevData) => ({
      ...prevData,
      username: data.username,
      imageFile: data.imageFile,
    }));

    formData.name = formData.name.trim();
    formData.email = formData.email.trim().toLowerCase();
    formData.password = formData.password.trim();
    formData.username = data.username.trim();
    formData.imageFile = data.imageFile;

    http
      .post("/user/register", formData)
      .then((res) => {
        console.log(res.data);
        navigate("/login");
      })
      .catch(function (err) {
        console.log(err.response);
        toast.error(`${err.response.data.message}`);
      });
  };

  return (
    <React.Fragment>
      {user ? (
        navigate("/marketplace")
      ) : (
        <>
          {currentPage === 1 && (
            <RegisterPage1 onSubmit={handlePage1Submit} />
          )}
          {currentPage === 2 && <RegisterPage2 onSubmit={handleFormSubmit} />}
          <ToastContainer />
        </>
      )}
    </React.Fragment>

  );
}

export default Register;
