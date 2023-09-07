import React, { useEffect, useState, useContext } from "react";
import http from "../http";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Input,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container,
} from "@mui/material";
import { AccessTime, Search, Clear, Edit, Delete } from "@mui/icons-material";
import AspectRatio from "@mui/joy/AspectRatio";
import dayjs from "dayjs";
import global from "../global";
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
    input: {
      color: "#016670",
    },
  },
});

function UserRewards() {
  const navigate = useNavigate();
  const [rewardList, setRewardList] = useState([]);
  const [search, setSearch] = useState("");
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) {
        navigate("/adminHome");
      }
    } else {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const [user, setUser] = useState({
    rewardPoints: "",
  });

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Call API to get all rewards
  const getRewards = () => {
    http.get("/reward").then((res) => {
      setRewardList(res.data);
    });
  };

  // Call API to search rewards
  const searchRewards = () => {
    http.get(`/reward?search=${search}`).then((res) => {
      setRewardList(res.data);
    });
  };

  // Call function to getRewards
  useEffect(() => {
    getRewards();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await http.get("/user/getuser");
        setUser(response.data);
        console.log(user);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getUser();
  }, []);

  // When enter key is down, call function searchRewards
  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchRewards();
    }
    if (e.key === "Escape") {
      setSearch("");
      getRewards();
    }
  };

  // Call function searchRewards
  const onClickSearch = () => {
    searchRewards();
  };

  // Clear search state and call function getRewards
  const onClickClear = () => {
    setSearch("");
    getRewards();
  };

  // All Reward Display
  useEffect(() => {
    http.get("/reward").then((res) => {
      setRewardList(res.data);
    });
  }, []);

  // React Page
  return (
    <Container>
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            mt: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
              Your Rewards For Reducing Polution
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ThemeProvider theme={usertheme}>
                <Input
                  value={search}
                  placeholder="Search"
                  onChange={onSearchChange}
                  onKeyDown={onSearchKeyDown}
                />

                <IconButton
                  color="primary"
                  onClick={onClickSearch}
                  sx={{ color: "#016670" }}
                >
                  <Search />
                </IconButton>

                <IconButton
                  color="primary"
                  onClick={onClickClear}
                  sx={{ color: "#016670" }}
                >
                  <Clear />
                </IconButton>
              </ThemeProvider>
            </Box>
          </Box>
          <Box sx={{ ml: "auto", bgcolor: "#9FEDD7", p: 2, borderRadius: 5 }}>
            <Typography sx={{ textAlign: "center" }}>
              Your Reward Points
            </Typography>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {user.rewardPoints}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ my: 2 }}>
          {rewardList.map((reward, i) => {
            return (
              <Grid item xs={12} md={6} lg={4} key={reward.id}>
                <Card sx={{ borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={`${import.meta.env.VITE_FILE_BASE_URL}${
                        reward.thumbnail
                      }`}
                    />
                  <CardContent sx={{ bgcolor: "#9FEDD7" }}>
                    <Typography
                      variant="h6"
                      sx={{ flexGrow: 1, fontWeight: "bold" }}
                    >
                      {reward.rewardName}
                    </Typography>

                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {reward.pointRequirement} Points
                    </Typography>

                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      color="text.secondary"
                    >
                      <AccessTime sx={{ mr: 1 }} />
                      <Typography>
                        Expires On:{" "}
                        {dayjs(reward.expiryDate).format(global.datetimeFormat)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ bgcolor: "#9FEDD7" }}>
                    <Link to={`/rewarddetails/${reward.id}`}>
                      <Button size="small">Learn More</Button>
                    </Link>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
}

export default UserRewards;
