import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, TextField, Button, Grid, Container } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "../contexts/UserContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const usertheme = createTheme({
  palette: {
    primary: {
      main: "#016670",
    },
    secondary: {
      main: "#0044ff",
    },
  },
});

function AddCar() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [branchLocations, setBranchLocations] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/adminHome");
      }
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: {
      license: "",
      carmodel: "",
      location: "",
      startdate: null,
      enddate: null,
      price: "",
      description: "",
    },
    validationSchema: yup.object().shape({
      license: yup
        .string()
        .trim()
        .min(8, "License Plate must be 8 characters")
        .max(8, "License Plate must be 8 characters")
        .required("License Plate is required"),
      carmodel: yup
        .string()
        .trim()
        .min(3, "Car Model must be at least 3 characters")
        .max(100, "Car Model must be at most 100 characters")
        .required("Car Model is required"),
      location: yup.string().trim().required("Location is required"),
      startdate: yup
        .date()
        .min(new Date(), "Start Date must be after the current date")
        .required("Start Date is required"),
      enddate: yup
        .date()
        .min(
          yup.ref("startdate"),
          "End Date must be after or equal to Start Date"
        )
        .required("End Date is required"),
      price: yup
        .string()
        .trim()
        .min(1, "Price must be at least 1 characters")
        .max(8, "Price must be at most 8 characters")
        .required("Price is required")
        .test("is-positive", "Price must be a positive number", (value) => {
          return parseFloat(value) > 0;
        }),
      description: yup
        .string()
        .trim()
        .min(3, "Description must be at least 3 characters")
        .max(500, "Description must be at most 500 characters")
        .required("Description is required"),
    }),
    onSubmit: (data) => {
      if (!imageFile) {
        toast.error("Please upload an image before submitting.");
        return;
      }

      data.price = parseFloat(data.price);

      if (imageFile) {
        data.imageFile = imageFile;
      }
      data.license = data.license.trim();
      data.carmodel = data.carmodel.trim();
      data.location = data.location.trim();
      data.description = data.description.trim();
      http
        .post("/car", data)
        .then((res) => {
          console.log(res.data);
          navigate("/cars");
        })
        .catch(function (err) {
          console.log(err.response);
        });
    },
  });

  const onFileChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 10) {
        toast.error("Maximum file size is 10MB");
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
          setImageFile(res.data.filename);
        })
        .catch(function (error) {
          console.log(error.response);
        });
    }
  };

  useEffect(() => {
    http
      .get("/branch")
      .then((res) => {
        setBranchLocations(res.data); // Assuming the server returns an array of branch locations
      })
      .catch(function (err) {
        console.log(err.response);
      });
  }, []);

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Add Car
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={4}>
              <ThemeProvider theme={usertheme}>
                <TextField
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  InputLabelProps={{ shrink: true }}
                  label="License"
                  name="license"
                  value={formik.values.license}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.license && Boolean(formik.errors.license)
                  }
                  helperText={formik.touched.license && formik.errors.license}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  InputLabelProps={{ shrink: true }}
                  label="Car Model"
                  name="carmodel"
                  value={formik.values.carmodel}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.carmodel && Boolean(formik.errors.carmodel)
                  }
                  helperText={formik.touched.carmodel && formik.errors.carmodel}
                />
                <FormControl fullWidth>
                  <InputLabel InputLabelProps={{ shrink: true }}>
                    Location
                  </InputLabel>
                  <Select
                    name="location"
                    label="Location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.location && Boolean(formik.errors.location)
                    }
                    helperText={
                      formik.touched.location && formik.errors.location
                    }
                  >
                    {/* Map through the branchLocations array to dynamically populate the menu items */}
                    {branchLocations.map((branch) => (
                      <MenuItem key={branch.id} value={branch.nickname}>
                        {branch.nickname}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ThemeProvider>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <ThemeProvider theme={usertheme}>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  label="Start Date"
                  name="startdate"
                  type="date"
                  value={formik.values.startdate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.startdate && Boolean(formik.errors.startdate)
                  }
                  helperText={
                    formik.touched.startdate && formik.errors.startdate
                  }
                />
                <TextField
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  label="End Date"
                  name="enddate"
                  type="date"
                  value={formik.values.enddate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.enddate && Boolean(formik.errors.enddate)
                  }
                  helperText={formik.touched.enddate && formik.errors.enddate}
                />
                <TextField
                  type="number"
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  InputLabelProps={{ shrink: true }}
                  label="Price"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                />
              </ThemeProvider>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <ThemeProvider theme={usertheme}>
                <TextField
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  InputLabelProps={{ shrink: true }}
                  multiline
                  minRows={2}
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button variant="contained" component="label">
                    Upload Image
                    <input
                      hidden
                      accept="image/*"
                      multiple
                      type="file"
                      onChange={onFileChange}
                    />
                  </Button>
                  {imageFile && (
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <Box
                          component="img"
                          alt="car"
                          src={`${import.meta.env.VITE_FILE_BASE_URL
                            }${imageFile}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        ></Box>
                      </div>
                    </div>
                  )}
                </Box>
              </ThemeProvider>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              type="submit"
              sx={{
                minWidth: "100px",
                bgcolor: "#016670",
                ":hover": {
                  bgcolor: "#02535B",
                  color: "white",
                },
              }}
            >
              Add
            </Button>
          </Box>
        </Box>

        <ToastContainer />
      </Box>
    </Container>
  );
}

export default AddCar;
