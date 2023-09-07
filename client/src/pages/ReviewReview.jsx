import React, { useState, useEffect, useContext } from "react";
import UserContext from "../contexts/UserContext";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Container,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
} from "@mui/material";
import http from "../http";
import { useNavigate, useParams } from "react-router-dom";
import AspectRatio from "@mui/joy/AspectRatio";

function ReviewReview() {
  const navigate = useNavigate();
  const [carList, setCarList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [reportReviewList, setReportReviewList] = useState([]);
  const [userList, setUserList] = useState([]);
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  useEffect(() => {
    http.get(`/car`).then((res) => {
      setCarList(res.data);
    });
    http.get(`/review`).then((res) => {
      setReviewList(res.data);
    });
    http.get(`/reportreview`).then((res) => {
      setReportReviewList(res.data);
    });
    http.get(`/user`).then((res) => {
      setUserList(res.data);
    });
  }, []);

  function deleteReport(reportid) {
    http.delete(`/reportreview/${reportid}`).then((res) => {
      navigate("/reports");
    });
  }

  function deleteReview(reviewid) {
    var email = ''
    var imageFile = ''
    var carmodel = ''
    var review = ''
    var category = ''
    var description = ''
    for (var j in reviewList){
      if(reviewList[j].id == reviewid){
        review = reviewList[j].description
        for (var m in userList){
          if(userList[m].id == reviewList[j].userId){
            email = userList[m].email
          }
        }
        for (var m in carList){
          if(reviewList[j].carId== carList[m].id){
            carmodel = carList[m].carmodel
            imageFile = carList[m].imageFile
          }
        }
      }
    }
    for (var j in reportReviewList){
      if(reportReviewList[j].id == id){
        category = reportReviewList[j].title
        description = reportReviewList[j].description
      }
    }
    var report = {Email: email,ImageFile: imageFile, CarModel: carmodel, Review: review, Category: category, Description: description}
    http.post(`/reportedreview`, report)
    http.delete(`/review/${reviewid}`).then((res) => {
      navigate("/reports");
    });
  }
  
  return (
    <Container>
      <Box>
        {user && user.isAdmin && (
          <Box>
            <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
              View Reviews
            </Typography>
            <Box>
              {reportReviewList.map((reportReview, i) => {
                return (
                  <Box>
                    {user && reportReview.id == id && (
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
                                    {user &&
                                      review.id == reportReview.reviewId && (
                                        <Box>
                                          {user && car.id == review.carId && (
                                            <AspectRatio
                                              sx={{ width: 500, mt: "auto" }}
                                            >
                                              <Box
                                                component="img"
                                                src={`${import.meta.env
                                                  .VITE_FILE_BASE_URL
                                                  }${car.imageFile}`}
                                                alt="car"
                                              ></Box>
                                            </AspectRatio>
                                          )}
                                          {user && car.id == review.carId && (
                                            <Box>
                                              <Typography
                                                variant="h5"
                                                sx={{
                                                  color: "#013C94",
                                                  mt: 2,
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  fontFamily: "Verdana",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                {car.carmodel}
                                              </Typography>
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
                          <Card
                            sx={{
                              backgroundColor: "#013C94",
                              borderRadius: "5%",
                            }}
                          >
                            <CardContent>
                              <Box>
                                <Typography
                                  variant="h4"
                                  sx={{ my: 2, color: "white" }}
                                >
                                  Report Review
                                </Typography>
                                <Divider sx={{ backgroundColor: "white" }} />
                                <Typography
                                  variant="h6"
                                  sx={{ color: "white" }}
                                >
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
                                          {user &&
                                            review.id ==
                                            reportReview.reviewId && (
                                              <Box>
                                                {userList.map((user, i) => {
                                                  return (
                                                    <Box>
                                                      {user &&
                                                        review.userId ==
                                                        user.id && (
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                            }}
                                                          >
                                                            <Avatar
                                                              sx={{
                                                                mr: 1,
                                                                color: "white",
                                                              }}
                                                              alt={
                                                                user.username
                                                              }
                                                              src={`${import.meta.env
                                                                .VITE_FILE_BASE_URL
                                                                }${user.imageFile
                                                                }`}
                                                            />
                                                            <Box
                                                              sx={{
                                                                maxWidth:
                                                                  "38vw",
                                                              }}
                                                            >
                                                              <Typography
                                                                sx={{
                                                                  color:
                                                                    "white",
                                                                }}
                                                              >
                                                                {user.username}
                                                              </Typography>
                                                              <Typography
                                                                sx={{
                                                                  color:
                                                                    "white",
                                                                  wordWrap:
                                                                    "break-word",
                                                                }}
                                                              >
                                                                {
                                                                  review.description
                                                                }
                                                              </Typography>
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
                                <Divider
                                  sx={{ backgroundColor: "white", mt: 2 }}
                                />
                                <Typography
                                  variant="h6"
                                  sx={{ color: "white", mt: 2 }}
                                >
                                  Reason for report
                                </Typography>
                                <Box sx={{ mt: 2, mb: 2 }}>
                                  {reportReview.title.length == 0 && (
                                    <Box>
                                      <Typography sx={{ color: "white" }}>
                                        {reportReview.description}
                                      </Typography>
                                    </Box>
                                  )}
                                  {reportReview.title.length != 0 && (
                                    <Box>
                                      {reportReview.title.map((title, i) => {
                                        return (
                                          <Box>
                                            <Typography sx={{ color: "white" }}>
                                              {title}
                                            </Typography>
                                          </Box>
                                        );
                                      })}
                                      {reportReview.description != "" && (
                                        <Box sx={{ m: "auto", color: "white" }}>
                                          <Typography>
                                            {reportReview.description}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  )}
                                </Box>
                                <Box sx={{ display: "flex" }}>
                                  <Box
                                    sx={{
                                      mt: 2,
                                      display: "flex",
                                      backgroundColor: "white",
                                    }}
                                  >
                                    <Button
                                      variant="outlined"
                                      type="submit"
                                      onClick={handleOpen}
                                      color="secondary"
                                    >
                                      Remove Report
                                    </Button>
                                  </Box>
                                  <Box sx={{ flexGrow: "1" }} />
                                  <Box sx={{ mt: 2, display: "flex" }}>
                                    <Button
                                      variant="contained"
                                      type="submit"
                                      onClick={handleOpen2}
                                      sx={{ backgroundColor: "error.main" }}
                                    >
                                      Delete Review
                                    </Button>
                                  </Box>
                                </Box>
                              </Box>
                              <Dialog open={open} onClose={handleClose}>
                                <DialogTitle>Delete Report</DialogTitle>
                                <DialogContent>
                                  <DialogContentText>
                                    Are you sure you want to delete this report?
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
                                    onClick={() =>
                                      deleteReport(reportReview.id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </DialogActions>
                              </Dialog>
                              <Dialog open={open2} onClose={handleClose2}>
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
                                    onClick={handleClose2}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() =>
                                      deleteReview(reportReview.reviewId)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </DialogActions>
                              </Dialog>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
        {user && !user.isAdmin && (
          <Box sx={{ display: "none" }}>{navigate(`/marketplace`)}</Box>
        )}
      </Box>
    </Container>
  );
}

export default ReviewReview;
