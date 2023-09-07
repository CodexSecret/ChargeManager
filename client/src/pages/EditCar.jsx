import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../http";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Container,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useFormik } from "formik";
import * as yup from "yup";
import AspectRatio from "@mui/joy/AspectRatio";
import UserContext from "../contexts/UserContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

var color = "#016670";
var hovercolor = "#02535B";

function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [branchLocations, setBranchLocations] = useState([]);

  const [car, setCar] = useState({
    license: "",
    carmodel: "",
    location: "",
    startdate: null,
    enddate: null,
    price: "",
    description: "",
  });

  const [error, setError] = useState(null);

  const [user, setUser] = useState({});

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await http.get("/user/getuser");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    if (id) {
      http
        .get(`/car/${id}`)
        .then((res) => {
          setCar(res.data);
          setImageFile(res.data.imageFile);
        })
        .catch((err) => {
          console.error(err);
          setError(
            "Failed to fetch car data. Please make sure the ID is correct."
          );
        });
    } else {
      setError("No car ID provided.");
    }
    http
      .get("/branch")
      .then((res) => {
        setBranchLocations(res.data); // Assuming the server returns an array of branch locations
      })
      .catch(function (err) {
        console.log(err.response);
      });
  }, [id]);

  const formik = useFormik({
    initialValues: car,
    enableReinitialize: true,
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
        .min(
          new Date(),
          "Start Date must be after or equal to the current date"
        )
        .required("Start Date is required"),
      enddate: yup
        .date()
        .min(
          yup.ref("startdate"),
          "End Date must be after or equal to Start Date"
        )
        .required("End Date is required"),
      price: yup
        .number()
        .positive("Price must be a positive number")
        .min(1, "Price must be at least1")
        .required("Price is required"),
      description: yup
        .string()
        .trim()
        .min(3, "Car Model must be at least 3 characters")
        .max(500, "Car Model must be at most 500 characters")
        .required("Car Model is required"),
    }),
    onSubmit: (data) => {
      if (imageFile) {
        data.imageFile = imageFile;
      }
      data.license = data.license.trim();
      data.carmodel = data.carmodel.trim();
      data.location = data.location.trim();
      data.description = data.description.trim();
      data.price = parseFloat(data.price);
      http.put(`/car/${id}`, data).then((res) => {
        console.log(res.data);
        navigate("/cars");
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

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deleteCar = () => {
    http.delete(`/car/${id}`).then((res) => {
      console.log(res.data);
      navigate("/cars");
    });
  };

  return (
    <Container>
      <Box>
        <Box sx={{ display: "none" }}>
          {user.isAdmin && ((color = "#003C94"), (hovercolor = "#032E6D"))}
        </Box>
        {error ? (
          <Typography variant="h5" sx={{ my: 2, color: "error.main" }}>
            {error}
          </Typography>
        ) : (
          <>
            <Typography variant="h5" sx={{ my: 2, color: color }}>
              Edit Car
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} lg={4}>
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
                    disabled={true}
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
                    helperText={
                      formik.touched.carmodel && formik.errors.carmodel
                    }
                    disabled={true}
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
                        formik.touched.location &&
                        Boolean(formik.errors.location)
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
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
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
                      formik.touched.startdate &&
                      Boolean(formik.errors.startdate)
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
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    margin="normal"
                    autoComplete="off"
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
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        minWidth: "100px",
                        bgcolor: color,
                        ":hover": {
                          bgcolor: hovercolor,
                          color: "white",
                        },
                      }}
                    >
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
                      <AspectRatio sx={{ mt: 2 }}>
                        <Box
                          component="img"
                          alt="car"
                          src={`${
                            import.meta.env.VITE_FILE_BASE_URL
                          }${imageFile}`}
                        ></Box>
                      </AspectRatio>
                    )}
                  </Box>
                </Grid>
              </Grid>
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
                  Update
                </Button>
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  color="error"
                  onClick={handleOpen}
                >
                  Delete
                </Button>
              </Box>
            </Box>
            <Dialog open={open} onClose={handleClose} fullWidth>
              <DialogTitle
                sx={{
                  bgcolor: "error.main",
                  color: "white",
                  paddingBottom: "16px",
                }}
              >
                Delete Car
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ paddingTop: "16px" }}>
                  Are you sure you want to delete this car?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="contained" color="error" onClick={deleteCar}>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Container>
  );
}

export default EditCar;
