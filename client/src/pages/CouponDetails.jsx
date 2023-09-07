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
import UserContext from "../contexts/UserContext";

function CouponDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
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

  const [coupon, setCoupon] = useState({
    discount: "",
    couponCode: "",
    couponDetails: "",
    redemptionCount: "",
    expiryDate: "",
  });

  useEffect(() => {
    http.get(`/coupon/${id}`).then((res) => {
      setCoupon(res.data);
      res.data.expiryDate = res.data.expiryDate.split("T")[0];
    });
  }, []);

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          View Coupon Details
        </Typography>

        <Box
          // Outer Box
          sx={{
            bgcolor: "#016670",
            padding: "3vh",
            borderBottom: "3px solid #000",
            borderRadius: "20px",
            display: "flex",
            flexdirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
           <Box sx = {{
                borderBottom: "5px solid #000000",
                  borderLeft: "5px solid #000000",
                  display: "flex",
                  borderRadius: "20px",
               }}>
                <Box
            // Inner Left Box
            sx={{
              bgcolor: "#9FEDD7",
              // borderBottom: "5px solid #000000",
              // borderLeft: "5px solid #000000",
              boxShadow: "#000000",
              borderRadius: "15px 0px 0px 15px",
              // height: "45vh",
              // width: "20%",
              p: "2vw",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Libre Barcode 128 Text', cursive",
                transform: "rotate(90deg)",
                my: "auto",
                fontSize: 128,
              }}
            >
              CHARGE
            </Typography>
          </Box>
          <Box
            // Line
            sx={{
              width: "0px",
              // height: "47vh",
              border: "2px dashed #9FEDD7",
              bgcolor: "#016670",
              display: "flex"
            }}
          ></Box>
          <Box
            // Inner Right Box
            sx={{
              p: "2vw",
              bgcolor: "#9FEDD7",
              // borderBottom: "5px solid #000000",
              borderRadius: "0px 15px 15px 0px",
              // height: "45vh",
            }}
          >
            <Typography sx={{ pb: 1.5 }}>Discount</Typography>
            <Typography variant="h3" display="inline">
              {coupon.discount}% OFF THE NEXT RIDE
            </Typography>

            <Typography sx={{ mt: 2 }}>Coupon Code</Typography>
            <Typography variant="h5">{coupon.couponCode}</Typography>

            <Typography sx={{ mt: 2 }}>Coupon Details</Typography>
            <Typography>{coupon.couponDetails}</Typography>
          </Box>
               </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "#016670",
            borderRadius: "20px",
            color: "white",
            p: "3vh",
            mt: "3vh",
            borderBottom: "3px solid #000",
            display: "flex",
          }}
        >
          <Box>
            <Typography>
              How Many Times Can This Be Redeemed By One Account?
            </Typography>
            <Typography variant="h6">{coupon.redemptionCount}</Typography>

            <Typography sx={{ mt: 2 }}>Expiry Date</Typography>
            <Typography variant="h6">{coupon.expiryDate}</Typography>
          </Box>
          <Typography variant="h3" sx={{ ml: "auto" }}>
            Other Details
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Link to={`/usercoupons`}>
            <Button variant="contained" color="success">
              Back
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default CouponDetails;
