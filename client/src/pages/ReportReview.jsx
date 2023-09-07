import React, { useState, useEffect, useContext } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import UserContext from "../contexts/UserContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Avatar,
  Container,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AspectRatio from "@mui/joy/AspectRatio";

function ReportReview() {
  const navigate = useNavigate();
  const [carList, setCarList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [titleList, setTitleList] = useState([]);
  const [distextbox, setTextBox] = useState(false);
  const { id } = useParams();
  const { user } = useContext(UserContext);
  var carId = "";
  useEffect(() => {
    http.get(`/car`).then((res) => {
      setCarList(res.data);
    });
    http.get(`/review`).then((res) => {
      setReviewList(res.data);
    });
    http.get(`/user`).then((res) => {
      setUserList(res.data);
    });
  }, []);
  const handleChange = (event) => {
    if (titleList.includes(event.target.value)) {
      titleList.splice(titleList.indexOf(event.target.value), 1);
      setTitleList(titleList);
    } else {
      setTitleList([...titleList, event.target.value]);
    }
  };
  const handleChange2 = (event) => {
    if (titleList.includes(event.target.value)) {
      titleList.splice(titleList.indexOf(event.target.value), 1);
      setTitleList(titleList);
    } else {
      setTitleList([...titleList, event.target.value]);
    }
  };
  const handleChange3 = (event) => {
    if (titleList.includes(event.target.value)) {
      titleList.splice(titleList.indexOf(event.target.value), 1);
      setTitleList(titleList);
    } else {
      setTitleList([...titleList, event.target.value]);
    }
  };
  const handleChange4 = (event) => {
    if (titleList.includes(event.target.value)) {
      titleList.splice(titleList.indexOf(event.target.value), 1);
      setTitleList(titleList);
    } else {
      setTitleList([...titleList, event.target.value]);
    }
  };
  const handleChange5 = () => {
    if (distextbox == true) {
      setTextBox(false);
    } else {
      setTextBox(true);
    }
  };
  const formik = useFormik({
    initialValues: {
      description: "",
    },
    validationSchema: yup.object().shape({
      description: yup
        .string()
        .trim()
        .max(150, "🚫Description must be at most 150 characters"),
    }),
    onSubmit: (data) => {
      if (titleList.length == 0 && distextbox == false) {
        toast.error("Select 1 checkbox");
      } else {
        data.title = titleList;
        if (distextbox) {
          if (data.description.trim().length < 3) {
            toast.error("Description must be at least 3 words");
          } else {
            data.description = data.description.trim();
            http.post(`/reportreview/${id}`, data).then((res) => {
              navigate(`/carreviews/${carId}`);
            });
          }
        } else {
          data.description = "";
          http.post(`/reportreview/${id}`, data).then((res) => {
            navigate(`/carreviews/${carId}`);
          });
        }
      }
    },
  });
  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Report Review
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {reviewList.map((review, i) => {
            return (
              <Box>
                {carList.map((car, i) => {
                  return (
                    <Box>
                      {user && review.id == id && (
                        <Box>
                          {user && car.id == review.carId && (
                            <AspectRatio sx={{ width: 500, mt: "auto" }}>
                              <Box
                                component="img"
                                src={`${import.meta.env.VITE_FILE_BASE_URL}${
                                  car.imageFile
                                }`}
                                alt="car"
                              ></Box>
                            </AspectRatio>
                          )}
                          {user && car.id == review.carId && (
                            <Box>
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
                              <Box sx={{ display: "none" }}>
                                {(carId = car.id)}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
          <Box sx={{ flexGrow: 0.5 }} />
          <Box sx={{ width: ["90%", "50%"] }}>
            <Card sx={{ backgroundColor: "#016670", borderRadius: "5%" }}>
              <CardContent>
                <Box component="form" onSubmit={formik.handleSubmit}>
                  <Typography variant="h4" sx={{ my: 2, color: "white" }}>
                    Report Review
                  </Typography>
                  <Divider sx={{ backgroundColor: "white" }} />
                  <Typography variant="h6" sx={{ color: "white" }}>
                    Comment Under Review
                  </Typography>
                  <Box
                    sx={{
                      width: 200,
                      display: "flex",
                      alignItems: "center",
                    }}
                  ></Box>
                  <Box sx={{ display: "flex" }}>
                    <Box sx={{ display: "flex", ml: 1 }}>
                      {reviewList.map((review, i) => {
                        return (
                          <Box>
                            {user && review.id == id && (
                              <Box>
                                {userList.map((user, i) => {
                                  return (
                                    <Box sx={{ maxWidth: "35vw" }}>
                                      {user && review.userId == user.id && (
                                        <Box>
                                          <Box sx={{ display: "flex" }}>
                                            <Avatar
                                              sx={{ mr: 1, color: "white" }}
                                              alt={user.username}
                                              src={`${
                                                import.meta.env
                                                  .VITE_FILE_BASE_URL
                                              }${user.imageFile}`}
                                            />
                                            <Box>
                                              <Typography
                                                sx={{ color: "white" }}
                                              >
                                                {user.username}
                                              </Typography>
                                              <Typography
                                                sx={{
                                                  color: "white",
                                                  wordWrap: "break-word",
                                                }}
                                              >
                                                {review.description}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                })}
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  <Divider sx={{ backgroundColor: "white", mt: 2 }} />
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{ color: "white" }}
                          onChange={handleChange}
                          value={"Hate Speech"}
                        />
                      }
                      label="Hate Speech"
                      sx={{ color: "white" }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{ color: "white" }}
                          onChange={handleChange2}
                          value={"Inappropriate Speech"}
                        />
                      }
                      label="Inappropriate Speech"
                      sx={{ color: "white" }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{ color: "white" }}
                          onChange={handleChange3}
                          value={"Harassment"}
                        />
                      }
                      label="Harassment"
                      sx={{ color: "white" }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{ color: "white" }}
                          onChange={handleChange4}
                          value={"Misleading Information"}
                        />
                      }
                      label="Misleading Information"
                      sx={{ color: "white" }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{ color: "white" }}
                          onChange={handleChange5}
                          value={true}
                        />
                      }
                      label="Others(Please Specify)"
                      sx={{ color: "white" }}
                    />
                  </FormGroup>
                  {!distextbox && (
                    <TextField
                      fullWidth
                      margin="normal"
                      autoComplete="off"
                      disabled
                      multiline
                      minRows={2}
                      value={formik.values.description}
                      placeholder="Comments"
                      sx={{ backgroundColor: "#ffffff" }}
                    />
                  )}
                  {distextbox && (
                    <TextField
                      fullWidth
                      margin="normal"
                      autoComplete="on"
                      required
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
                  )}
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ backgroundColor: "error.main" }}
                    >
                      Report
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        <ToastContainer />
      </Box>
    </Container>
  );
}

export default ReportReview;
