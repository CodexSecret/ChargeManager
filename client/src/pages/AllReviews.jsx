import React, { useEffect, useState, useContext } from "react";
import UserContext from "../contexts/UserContext";
import Rating from "@mui/material/Rating";
import PropTypes from 'prop-types';
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Divider,
  Container,
  Tabs,
  Tab
} from "@mui/material";
import {
  Sort,
  Edit,
  AccessTime,
  Report,
  Description,
} from "@mui/icons-material";
import http from "../http";
import dayjs from "dayjs";
import global from "../global";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AspectRatio from "@mui/joy/AspectRatio";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function AllReviews() {
  const [carList, setCarList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const { user } = useContext(UserContext);
  const { id, page } = useParams();
  var totalrating = 0;
  var numofratings = 0;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickClose = () => {
    setAnchorEl(null);
    http.get(`/review?sort=${["rating", "ASC"]}`).then((res) => {
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
    http.get(`/user`).then((res) => {
      setUserList(res.data);
    });
    setValue(Number(page))
  }, []);
  return (
    <Container>
      <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={value} onChange={handleChange} textColor="#016670"
                indicatorColor="#016670" aria-label="basic tabs example">
          <Tab label="Reviews From Buyers" {...a11yProps(0)} />
          <Tab label="Reviews From Seller" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Box sx={{ display: "flex" }}>
          <Box>
            <Typography variant="h4" sx={{ color: "#016670" }}>
              Reviews From Buyers
            </Typography>
            <div>
              <Box sx={{ display: "flex" }}>
                <Box>
                  {userList.map((user, i) => {
                    return (
                      <Box>
                        {user.id == id && (
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
                              alt={user.username}
                              src={`${import.meta.env.VITE_FILE_BASE_URL}${
                                user.imageFile
                              }`}
                            />
                            <Typography sx={{ color: "#016670" }}>
                              {user.username}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                <IconButton
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  sx={{ color: "#016670", p: 0, ml: 2 }}
                >
                  <Sort />
                </IconButton>
              </Box>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={handleClickClose} sx={{ color: "#016670" }}>
                  Sort By Ratings(ASC)
                </MenuItem>
                <MenuItem onClick={handleClickClose2} sx={{ color: "#016670" }}>
                  Sort By Ratings(DESC)
                </MenuItem>
                <MenuItem onClick={handleClickClose3} sx={{ color: "#016670" }}>
                  Sort By Date(Latest)
                </MenuItem>
                <MenuItem onClick={handleClickClose4} sx={{ color: "#016670" }}>
                  Sort By Date(Old)
                </MenuItem>
              </Menu>
            </div>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            {reviewList.map((review, i) => {
              return (
                <Box>
                  {carList.map((car, i) => {
                    return (
                      <Box>
                        {review.carId == car.id && (
                          <Box>
                            {car.userId == id && (
                              <Box sx={{ display: "none" }}>
                                {(totalrating += Number(review.rating))}
                                {(numofratings += 1)}
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
        <Divider sx={{ backgroundColor: "black" }} />
        {reviewList.map((review, i) => {
          return (
            <Box>
              {carList.map((car, i) => {
                return (
                  <Box>
                    {car.id == review.carId && (
                      <Box>
                        {car.userId == id && (
                          <Box sx={{ maxWidth: "100%", overflow: "hidden" }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "80%",
                                maxWidth: "80%",
                              }}
                            >
                              <AspectRatio sx={{ minWidth: 200, mt: 2, mb: 2 }}>
                                <Box
                                  component="img"
                                  src={`${import.meta.env.VITE_FILE_BASE_URL}${
                                    car.imageFile
                                  }`}
                                  alt="Car Image"
                                ></Box>
                              </AspectRatio>
                              <Box sx={{ ml: 2, maxWidth: "100%" }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#016670",
                                    fontWeight: "bold",
                                    width: "100%",
                                  }}
                                >
                                  {car.carmodel}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    width: "100%",
                                    maxWidth: ["50%", "100%"],
                                  }}
                                >
                                  <Link to={`/allreviews/${review.userId}/1`}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                      }}
                                      color="text.secondary"
                                      onClick ={() => setValue(1)}
                                    >
                                      <Avatar
                                        sx={{ mr: 1, color: "white" }}
                                        alt={review.user.username}
                                        src={`${
                                          import.meta.env.VITE_FILE_BASE_URL
                                        }${review.user.imageFile}`}
                                      />
                                      <Typography>
                                        {review.user.username}
                                      </Typography>
                                    </Box>
                                  </Link>
                                  <Box sx={{ flexGrow: 1 }} />
                                  {user && user.id === review.userId && (
                                    <Box>
                                      <Link to={`/editreview/${review.id}`}>
                                        <IconButton
                                          sx={{
                                            padding: "4px",
                                            color: "#016670",
                                          }}
                                        >
                                          <Edit />
                                        </IconButton>
                                      </Link>
                                    </Box>
                                  )}
                                  {user && review.userId != user.id && (
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
                                <Box
                                  sx={{ display: "flex" }}
                                  color="text.secondary"
                                >
                                  <AccessTime
                                    sx={{ mr: 1, color: "#016670" }}
                                  />
                                  <Typography sx={{ color: "black" }}>
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
                                <Box
                                  sx={{
                                    justifyContent: "space-between",
                                    maxWidth: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      width: "98%",
                                      maxWidth: ["50%", "98%"],
                                    }}
                                  >
                                    <Description
                                      sx={{ mr: 1, color: "#016670" }}
                                    />
                                    <Box sx={{ maxWidth: "100%" }}>
                                      <Typography
                                        sx={{
                                          width: "1000px",
                                          maxWidth:["50%",'98%'],
                                          wordWrap: "break-word",
                                          color: "black",
                                        }}
                                      >
                                        {review.description}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                            <Box>
                              <Divider sx={{ backgroundColor: "black" }} />
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
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
      <Box sx={{ display: "flex" }}>
          <Box>
            <Typography variant="h4" sx={{ color: "#016670" }}>
              Reviews From Seller
            </Typography>
            <div>
              <Box sx={{ display: "flex" }}>
                <Box>
                  {userList.map((user, i) => {
                    return (
                      <Box>
                        {user.id == id && (
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
                              alt={user.username}
                              src={`${import.meta.env.VITE_FILE_BASE_URL}${
                                user.imageFile
                              }`}
                            />
                            <Typography sx={{ color: "#016670" }}>
                              {user.username}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                <IconButton
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  sx={{ color: "#016670", p: 0, ml: 2 }}
                >
                  <Sort />
                </IconButton>
              </Box>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={handleClickClose} sx={{ color: "#016670" }}>
                  Sort By Ratings(ASC)
                </MenuItem>
                <MenuItem onClick={handleClickClose2} sx={{ color: "#016670" }}>
                  Sort By Ratings(DESC)
                </MenuItem>
                <MenuItem onClick={handleClickClose3} sx={{ color: "#016670" }}>
                  Sort By Date(Latest)
                </MenuItem>
                <MenuItem onClick={handleClickClose4} sx={{ color: "#016670" }}>
                  Sort By Date(Old)
                </MenuItem>
              </Menu>
            </div>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            {reviewList.map((review, i) => {
              return (
                <Box>
                  {carList.map((car, i) => {
                    return (
                      <Box>
                        {review.carId == car.id && (
                          <Box>
                            {review.userId == id && (
                              <Box sx={{ display: "none" }}>
                                {(totalrating += Number(review.rating))}
                                {(numofratings += 1)}
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
          </Box>
        </Box>
        <Divider sx={{ backgroundColor: "black" }} />
        {reviewList.map((review, i) => {
          return (
            <Box>
              {carList.map((car, i) => {
                return (
                  <Box>
                    {car.id == review.carId && (
                      <Box>
                        {review.userId == id && (
                          <Box sx={{ maxWidth: "100%", overflow: "hidden" }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "80%",
                                maxWidth: "80%",
                              }}
                            >
                              <AspectRatio sx={{ minWidth: 200, mt: 2, mb: 2 }}>
                                <Box
                                  component="img"
                                  src={`${import.meta.env.VITE_FILE_BASE_URL}${
                                    car.imageFile
                                  }`}
                                  alt="Car Image"
                                ></Box>
                              </AspectRatio>
                              <Box sx={{ ml: 2, maxWidth: "100%" }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#016670",
                                    fontWeight: "bold",
                                    width: "100%",
                                  }}
                                >
                                  {car.carmodel}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    width: "100%",
                                    maxWidth: ["50%", "100%"],
                                  }}
                                >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                      }}
                                      color="text.secondary"
                                    >
                                      <Avatar
                                        sx={{ mr: 1, color: "white" }}
                                        alt={review.user.username}
                                        src={`${
                                          import.meta.env.VITE_FILE_BASE_URL
                                        }${review.user.imageFile}`}
                                      />
                                      <Typography>
                                        {review.user.username}
                                      </Typography>
                                    </Box>
                                  <Box sx={{ flexGrow: 1 }} />
                                  {user && user.id === review.userId && (
                                    <Box>
                                      <Link to={`/editreview/${review.id}`}>
                                        <IconButton
                                          sx={{
                                            padding: "4px",
                                            color: "#016670",
                                          }}
                                        >
                                          <Edit />
                                        </IconButton>
                                      </Link>
                                    </Box>
                                  )}
                                  {user && review.userId != user.id && (
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
                                <Box
                                  sx={{ display: "flex" }}
                                  color="text.secondary"
                                >
                                  <AccessTime
                                    sx={{ mr: 1, color: "#016670" }}
                                  />
                                  <Typography sx={{ color: "black" }}>
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
                                <Box
                                  sx={{
                                    justifyContent: "space-between",
                                    maxWidth: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: "98%",
                                      maxWidth: ["50%", "98%"],
                                      display: "flex"
                                    }}
                                  >
                                    <Description
                                      sx={{ mr: 1, color: "#016670" }}
                                    />
                                    <Box sx={{maxWidth:"100%"}}>
                                      <Typography
                                        sx={{
                                          width: "1000px",
                                          maxWidth:["50%",'98%'],
                                          wordWrap: "break-word",
                                          color: "black", 
                                        }}
                                      >
                                        {review.description}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                            <Box>
                              <Divider sx={{ backgroundColor: "black" }} />
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
      </CustomTabPanel>
      </Box>
    </Container>
  );
}

export default AllReviews;
