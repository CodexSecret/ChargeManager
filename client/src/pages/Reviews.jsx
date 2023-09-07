import React, { useEffect, useState, useContext } from "react";
import UserContext from "../contexts/UserContext";
import Rating from "@mui/material/Rating";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Divider,
  Container,
} from "@mui/material";
import {
  AccessTime,
  Report,
  Edit,
  Sort,
  Description,
} from "@mui/icons-material";
import http from "../http";
import dayjs from "dayjs";
import global from "../global";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AspectRatio from "@mui/joy/AspectRatio";

function Reviews() {
  const [carList, setCarList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const { user } = useContext(UserContext);
  const { id } = useParams();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  var totalrating = 0;
  var numofratings = 0;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickClose = () => {
    setAnchorEl(null);
    http.get(`/review?sort=${"rating,ASC"}`).then((res) => {
      setReviewList(res.data);
    });
  };

  const handleClickClose2 = () => {
    setAnchorEl(null);
    http.get(`/review?sort=${"rating,DESC"}`).then((res) => {
      setReviewList(res.data);
    });
  };

  const handleClickClose3 = () => {
    setAnchorEl(null);
    http.get(`/review?sort=${"createdAt,DESC"}`).then((res) => {
      setReviewList(res.data);
    });
  };

  const handleClickClose4 = () => {
    setAnchorEl(null);
    http.get(`/review?sort=${"createdAt,ASC"}`).then((res) => {
      setReviewList(res.data);
    });
  };

  useEffect(() => {
    http.get(`/review`).then((res) => {
      setReviewList(res.data);
    });
    http.get(`/car`).then((res) => {
      setCarList(res.data);
    });
  }, []);
  return (
    <Container>
      <Box>
        <Box sx={{ display: "flex", m: 1 }}>
          <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
            View Reviews
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            {reviewList.map((review, i) => {
              return (
                <Box>
                  <Box>
                    {review.carId == id && (
                      <Box sx={{ display: "none" }}>
                        {(totalrating += Number(review.rating))}
                        {(numofratings += 1)}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: "#016670" }}>
              Overall Ratings:
            </Typography>
            <Rating
              name="read-only"
              value={totalrating / numofratings}
              precision={0.5}
              readOnly
            ></Rating>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "#016670" }}
            >
              ({numofratings} Total Ratings)
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          <Box>
            {carList.map((car, i) => {
              return (
                <Box>
                  {car.id == id && (
                    <AspectRatio sx={{ width: 500, mt: "auto" }}>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_FILE_BASE_URL}${car.imageFile
                          }`}
                        alt="Car Image"
                      ></Box>
                    </AspectRatio>
                  )}
                  {car.id == id && (
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
          </Box>
          <Box sx={{ flexGrow: 0.5 }} />
          <Box sx={{ width: ["90%", "50%"] }}>
            <Card
              sx={{
                backgroundColor: "#016670",
                borderRadius: "5%",
                color: "white",
                maxHeight: 400,
                overflow: "auto",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex" }}>
                  <Box>
                    <Typography variant="h6">All Reviews</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Box>
                    <div>
                      <IconButton
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClick}
                        sx={{ color: "white", p: 0 }}
                      >
                        <Sort />
                      </IconButton>
                      <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        <MenuItem
                          onClick={handleClickClose}
                          sx={{ color: "#016670" }}
                        >
                          Sort By Ratings(ASC)
                        </MenuItem>
                        <MenuItem
                          onClick={handleClickClose2}
                          sx={{ color: "#016670" }}
                        >
                          Sort By Ratings(DESC)
                        </MenuItem>
                        <MenuItem
                          onClick={handleClickClose3}
                          sx={{ color: "#016670" }}
                        >
                          Sort By Date(Latest)
                        </MenuItem>
                        <MenuItem
                          onClick={handleClickClose4}
                          sx={{ color: "#016670" }}
                        >
                          Sort By Date(Old)
                        </MenuItem>
                      </Menu>
                    </div>
                  </Box>
                </Box>
                <Divider sx={{ backgroundColor: "white" }} />
                {reviewList.map((review, i) => {
                  return (
                    <Box>
                      {review.carId == id && (
                        <Grid item key={review.id}>
                          <Box sx={{ display: "flex", mt: 1 }}>
                            <Link to={`/allreviews/${review.userId}/1`}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                  mt: 1,
                                }}
                                color="text.secondary"
                              >
                                <Avatar
                                  sx={{ mr: 1, color: "white" }}
                                  alt={review.user.username}
                                  src={`${import.meta.env.VITE_FILE_BASE_URL}${review.user.imageFile
                                    }`}
                                />
                                <Typography sx={{ color: "white" }}>
                                  {review.user.username}
                                </Typography>
                              </Box>
                            </Link>

                            <Box sx={{ flexGrow: 1 }} />
                            <Box sx={{ display: "flex", mt: 1 }}>
                              {user && user.id === review.userId && (
                                <Link to={`/editreview/${review.id}`}>
                                  <IconButton
                                    sx={{ padding: "4px", color: "white" }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Link>
                              )}
                              {review.userId != user.id && (
                                <Link to={`/reportreview/${review.id}`}>
                                  <Box sx={{ display: "flex" }}>
                                    <Report sx={{ color: "#DD4052" }} />
                                    <Typography sx={{ color: "#DD4052" }}>
                                      Report Abuse
                                    </Typography>
                                  </Box>
                                </Link>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex" }} color="text.secondary">
                            <AccessTime sx={{ mr: 1, color: "white" }} />
                            <Typography sx={{ color: "white" }}>
                              {dayjs(review.createdAt).format(
                                global.datetimeFormat
                              )}
                            </Typography>
                          </Box>
                          <Rating
                            name="read-only"
                            value={review.rating}
                            precision={0.5}
                            readOnly
                          />
                          <Box sx={{ display: "flex" }}>
                            <Box sx={{ display: "flex", maxWidth: "90%" }}>
                              <Description sx={{ mr: 1, color: "white" }} />
                              <Typography
                                sx={{
                                  maxWidth: "100%",
                                  wordWrap: "break-word",
                                }}
                              >
                                {review.description}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ backgroundColor: "white" }} />
                        </Grid>
                      )}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Reviews;
