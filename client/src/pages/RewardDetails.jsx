import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Input,
  IconButton,
  Radio,
  Button,
  TextField,
  TextareaAutosize,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fab,
  Container,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { Link, useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { ToastContainer, toast } from "react-toastify";
import AspectRatio from "@mui/joy/AspectRatio";
import UserContext from "../contexts/UserContext";

function RewardDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [thumbnail, setThumbnail] = useState(null);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) {
        navigate("/adminHome");
      }
    }
    else {
      navigate("/");
    }
  }, [currentUser, navigate]);


  const [reward, setReward] = useState({
    rewardName: "",
    rewardDetails: "",
    pointRequirement: "",
    expiryDate: "",
    url: "",
  });

  const [user, setUser] = useState({
    name: "",
    email: "",
    rewardPoints: "",
  });

  useEffect(() => {
    http.get(`/reward/${id}`).then((res) => {
      setReward(res.data);
      setThumbnail(res.data.thumbnail);
      res.data.expiryDate = res.data.expiryDate.split("T")[0];
    });
  }, []);

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

  function rewardRedemption() {
    if (user.rewardPoints >= reward.pointRequirement) {
      user.rewardPoints = user.rewardPoints - reward.pointRequirement;
      http.post(`/rewardredemption`, reward)
        .then(() => {
          toast.success(`${reward.rewardName} redeemed successfully`, {
            position: toast.POSITION.TOP_LEFT,
          });
        })
    }
    else {
      toast.error("You do not have enough points", {
        position: toast.POSITION.TOP_LEFT
      })
    }
  }

  return (
    <Box>
      <ToastContainer/>
      <Grid container spacing={0}>
        <Grid
          item
          xs={6}
          sx={{
            backgroundImage: `url("${import.meta.env.VITE_FILE_BASE_URL
              }${thumbnail}")`,
            height: "100vh",
            backgroundSize: "cover",
            backgroundColor: "grey",
            backgroundBlendMode: "multiply",
          }}
        ></Grid>
        <Grid item xs={6} sx={{ px: "5vw", py: "2vw" }}>
          <Typography variant="h3">{reward.rewardName}</Typography>
          <Typography variant="subtitle1">
            <b>{reward.pointRequirement} Points Required</b>
          </Typography>
          <Typography variant="subtitle1">
            <b>Expires On: {reward.expiryDate}</b>
          </Typography>
          <Box sx={{ p: 2, bgcolor: "#9FEDD7", borderRadius: 5 }}>
            <Typography sx={{
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
            }}>{reward.rewardDetails}</Typography>
          </Box>
          <Box sx={{ my: 2 }}>
            <Link to={`/userrewards`}>
              <Button variant="contained" color="success">
                Back
              </Button>
            </Link>
            <Link to={`${reward.url}`}>
              <Button variant="outlined" color="success" sx={{ ml: 2 }}>
                See More
              </Button>
            </Link>
            <Button
              sx={{ ml: 2 }}
              disabled={
                parseFloat(user.rewardPoints) <
                parseFloat(reward.pointRequirement)
              }
              onClick={(rewardRedemption)}
            >
              Redeem
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default RewardDetails;
