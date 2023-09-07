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
  InputAdornment,
} from "@mui/material";
import { debounce } from "lodash";
import http from "../http";
import { useFormik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./CustomAvatar.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: yup.object().shape({
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
      data.password = data.password.trim();

      http
        .put(`/user/updatepassword/${user.id}`, data)
        .then((res) => {
          console.log(res.data);
          navigate("/marketplace");
        })
        .catch(function (err) {
          console.log(err.response);
          toast.error(`${err.response.data.message}`);
        });
    },
  });

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
                  disabled
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
                    disabled
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={8}>
              <div className="form-group">
                <ThemeProvider theme={user.isAdmin ? admintheme : usertheme}>
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
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
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
              </div>

              <Box sx={{ mt: 2 }}>
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
                  Update Password
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
