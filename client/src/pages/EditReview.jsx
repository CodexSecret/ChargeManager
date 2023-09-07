import React, { useState, useEffect, useContext } from "react";
import UserContext from "../contexts/UserContext";
import Rating from "@mui/material/Rating";
import { useParams, useNavigate } from "react-router-dom";
import http from "../http";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AspectRatio from "@mui/joy/AspectRatio";
import StarIcon from "@mui/icons-material/Star";

function EditReview() {
  const labels = {
    0.5: "Awful",
    1: "Bad",
    1.5: "Poor",
    2: "Disappointed",
    2.5: "Average",
    3: "Good",
    3.5: "Great",
    4: "Amazing",
    4.5: "Excellent",
    5: "Outstanding",
  };
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [carList, setCarList] = useState([]);
  const [review, setReview] = useState({
    rating: "",
    description: "",
  });
  const [value, setValue] = React.useState(review.rating);
  const [hover, setHover] = React.useState(-1);
  function getLabelText(value) {
    return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
  }

  useEffect(() => {
    http.get(`/review/${id}`).then((res) => {
      setReview(res.data);
      setValue(res.data.rating);
    });
    http.get(`/car`).then((res) => {
      setCarList(res.data);
    });
  }, []);

  const formik = useFormik({
    initialValues: review,
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      description: yup
        .string()
        .trim()
        .min(3, "🚫Description must be at least 3 characters")
        .max(500, "🚫Description must be at most 500 characters")
        .required("🚫Description is required"),
    }),
    onSubmit: (data) => {
      data.rating = value;
      data.description = data.description.trim();
      http.put(`/review/${id}`, data).then((res) => {
        navigate(`/carreviews/${review.carId}`);
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

  const deleteReview = () => {
    http.delete(`/review/${id}`).then((res) => {
      navigate(`/carreviews/${review.carId}`);
    });
  };
  return (
    <Container>
      <Box onSubmit={formik.handleSubmit}>
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Edit Review
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {carList.map((car, i) => {
            return (
              <Box>
                {car.id == review.carId && (
                  <AspectRatio sx={{ width: 500, mt: "auto" }}>
                    <Box
                      component="img"
                      src={`${import.meta.env.VITE_FILE_BASE_URL}${
                        car.imageFile
                      }`}
                      alt="car"
                      sx={{ display: "" }}
                    ></Box>
                  </AspectRatio>
                )}
                {user && car.id == review.carId && (
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#016670",
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                      fontFamily: "Verdana",
                      fontWeight: "bold",
                    }}
                  >
                    {car.carmodel}
                  </Typography>
                )}
              </Box>
            );
          })}
          <Box sx={{ flexGrow: 0.5 }} />
          <Box sx={{ width: ["90%", "40%"] }}>
            <Card sx={{ backgroundColor: "#016670", borderRadius: "5%" }}>
              <CardContent>
                <Box component="form">
                  <Typography variant="h4" sx={{ my: 2, color: "white" }}>
                    Edit Reviews
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2, color: "white" }}>
                    Ratings
                  </Typography>
                  <Box
                    sx={{
                      width: 200,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Rating
                      name="hover-feedback"
                      value={value}
                      precision={0.5}
                      getLabelText={getLabelText}
                      onChange={(event, newValue) => {
                        setValue(newValue);
                      }}
                      onChangeActive={(event, newHover) => {
                        setHover(newHover);
                      }}
                      emptyIcon={
                        <StarIcon
                          style={{ opacity: 0.55 }}
                          fontSize="inherit"
                        />
                      }
                    />
                    {value !== null && (
                      <Box sx={{ ml: 2, color: "white" }}>
                        {labels[hover !== -1 ? hover : value]}
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ mt: 4, color: "white" }}>
                    Comments
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2, color: "white" }}>
                    Commenting as {user.name}
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    multiline
                    minRows={2}
                    placeholder="Comments"
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
                    sx={{ backgroundColor: "#ffffff" }}
                  />
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{ ml: 2 }}
                      color="error"
                      onClick={handleOpen}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ backgroundColor: "warning.main", ml: 2 }}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Delete Review</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to delete this review?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      variant="contained"
                      color="inherit"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={deleteReview}
                    >
                      Delete
                    </Button>
                  </DialogActions>
                </Dialog>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
export default EditReview;
