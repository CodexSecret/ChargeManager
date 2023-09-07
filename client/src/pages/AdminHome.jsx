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
  Container,
  Paper,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserContext from "../contexts/UserContext";

// Coupon Pages
import AdminCoupons from "./AdminCoupons";
import AddCoupons from "./AddCoupons";
import EditCoupons from "./EditCoupons";
import UserCoupons from "./UserCoupons";
import { Scale } from "@mui/icons-material";

function Index() {
  const navigate = useNavigate();
  const [niceHeight, setNiceHeight] = useState();
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  return (
    <Box>
      <Box
      // sx={{
      //   background: "linear-gradient(180deg, #003C94 0%, #EDEAE5 100%);",
      // }}
      >
        <Typography
          variant="h1"
          sx={{
            fontFamily: "'Zen Tokyo Zoo', cursive;",
            color: "#003C94",
            textAlign: "center",
          }}
        >
          Charge Umbrella Manager
        </Typography>
      </Box>

      <Container>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} >
          <Grid item xs={6}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderStyle: "dashed",
                borderRadius: 5,
                borderColor: "#003C94",
                color: "#003C94",
              }}
            >
              <Typography variant="h2" sx={{ pb: 2, fontWeight: "bold" }}>
                Cars
              </Typography>
              <Grid container>
                <Grid item xs={6}>
                  <Link to="/admincars">
                    <Typography variant="h6">View List Of Cars</Typography>
                  </Link>
                  <Link to="/bookingchart">
                    <Typography variant="h6">View Booking Chart</Typography>
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Link to="/adminbooking">
                    <Typography variant="h6">View Booking List</Typography>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderStyle: "dashed",
                borderRadius: 5,
                borderColor: "#003C94",
                color: "#003C94",
              }}
            >
              <Typography variant="h2" sx={{ pb: 2, fontWeight: "bold" }}>
                Users
              </Typography>
              <Grid container>
                <Grid item xs={6}>
                  <Link to="/users">
                    <Typography variant="h6">View List Of Users</Typography>
                  </Link>
                  <Link to="/bannedusers">
                    <Typography variant="h6">View Banned Users</Typography>
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Link to="/deletedusers">
                    <Typography variant="h6">View Deleted Users</Typography>
                  </Link>
                  <Link to="/adminaddress">
                    <Typography variant="h6">
                      View List Of User Addresses
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderStyle: "dashed",
                borderRadius: 5,
                borderColor: "#003C94",
                color: "#003C94",
              }}
            >
              <Typography variant="h2" sx={{ pb: 2, fontWeight: "bold" }}>
                Coupons
              </Typography>
              <Link to="/admincoupons">
                <Typography variant="h6">View List Of Coupons</Typography>
              </Link>
              <Link to="/addcoupons">
                <Typography variant="h6">Create Coupon</Typography>
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderStyle: "dashed",
                borderRadius: 5,
                borderColor: "#003C94",
                color: "#003C94",
              }}
            >
              <Typography variant="h2" sx={{ pb: 2, fontWeight: "bold" }}>
                Rewards
              </Typography>
              <Link to="/adminrewards">
                <Typography variant="h6">View List Of Rewards</Typography>
              </Link>
              <Link to="/addrewards">
                <Typography variant="h6">Create Reward</Typography>
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderStyle: "dashed",
                borderRadius: 5,
                borderColor: "#003C94",
                color: "#003C94",
              }}
            >
              <Typography variant="h2" sx={{ pb: 2, fontWeight: "bold" }}>
                Branch
              </Typography>
              <Link to="/branch">
                <Typography variant="h6">View Branches</Typography>
              </Link>
              <Link to="/addbranch">
                <Typography variant="h6">Create Branch</Typography>
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderStyle: "dashed",
                borderRadius: 5,
                borderColor: "#003C94",
                color: "#003C94",
              }}
            >
              <Typography variant="h2" sx={{ pb: 2, fontWeight: "bold" }}>
                Reports
              </Typography>
              <Link to="/reports">
                <Typography variant="h6">View List Of Reports</Typography>
              </Link>
              <Typography variant="h6"><br/></Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Index;
