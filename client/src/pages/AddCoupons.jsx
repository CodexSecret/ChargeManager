import React, { useEffect, useContext } from "react";
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
  styled,
  Paper,
  Container,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { Link, useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserContext from "../contexts/UserContext";

const admintheme = createTheme({
  palette: {
    primary: {
      main: "#003C94",
    },
    secondary: {
      main: "#0044ff",
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
              borderColor: "#003C94", // Set the outline color to the primary color
            },
            "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#003C94",
              },
          },
        },
      },
    },
  },
});

function AddCoupons() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const randomCouponCode =
    "CRG" + Math.floor(Math.random() * 99999999999999999).toString();

  const formik = useFormik({
    initialValues: {
      discount: "",
      couponCode: randomCouponCode,
      couponDetails: "",
      redemptionCount: 1,
      expiryDate: "",
    },
    validationSchema: yup.object().shape({
      discount: yup
        .number()
        .min(1, "Please enter a discount more than 0")
        .max(100, "Please enter a discount 100 or less")
        .required("This field is required")
        .integer("Enter an integer"),
      couponCode: yup
        .string()
        .trim()
        .min(3, "Coupon codes must be longer than 3 characters")
        .max(20, "Coupon codes cannot be longer than 20 characters")
        .required("This field is required"),
      couponDetails: yup
        .string()
        .trim()
        .min(1, "This field is required")
        .max(1500, "Please shorten your details to under 1500 characters")
        .required("This field is required"),
      redemptionCount: yup
        .number()
        .min(0, "You Must Be Able To Redeem The Coupon At Least Once")
        .max(10, "Maximum of 10 Redemptions Per Coupon")
        .required()
        .integer(),
      expiryDate: yup
        .date()
        .min(new Date(), "Expiry Date Must Be In The Future"),
    }),

    onSubmit: (data) => {
      data.couponCode = data.couponCode.trim();
      data.couponDetails = data.couponDetails.trim();
      http.post("/coupon", data).then((res) => {
        console.log(res.data);
        navigate("/admincoupons");
      });
    },
  });

  return (
    <ThemeProvider theme={admintheme}>
      <Container>
        <Box>
          <Typography variant="h2" sx={{ my: 2, color: "#013C94" }}>
            Create Coupon
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Box
              // Outer Box
              sx={{
                bgcolor: "#6CA6FF",
                padding: "3vh",

                borderBottom: "3px solid #000",
                borderRadius: "20px",

                display: "flex",
                flexdirection: "row",
                justifyContent: "center",

                // borderBottom: "5px solid #000000",
                  // borderLeft: "5px solid #000000",
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
                  bgcolor: "#FBE180",
                  // borderBottom: "5px solid #000000",
                  // borderLeft: "5px solid #000000",
                  boxShadow: "#000000",
                  borderRadius: "15px 0px 0px 15px",
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
                  border: "2px dashed #FBE180",
                  bgcolor: "#6CA6FF",
                  display: "flex",
                  flex: "0 0 "
                }}
              ></Box>

              <Box
                // Inner Right Box
                sx={{
                  p: "2vw",
                  bgcolor: "#FBE180",
                  // borderBottom: "5px solid #000000",
                  borderRadius: "0px 15px 15px 0px",
                  display: "flex",
                }}
              >
                <Box>
                  <Typography sx={{ pb: 1.5 }}>Discount</Typography>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    label="Discount"
                    name="discount"
                    type="number"
                    value={formik.values.discount}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.discount && Boolean(formik.errors.discount)
                    }
                    helperText={
                      formik.touched.discount && formik.errors.discount
                    }
                    sx={{ mt: 0, width: "21%" }}
                  />
                  <Typography variant="h3" display="inline">
                    % OFF THE NEXT RIDE
                  </Typography>

                  <Typography>Coupon Code</Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    label="Coupon Code"
                    name="couponCode"
                    value={formik.values.couponCode}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.couponCode &&
                      Boolean(formik.errors.couponCode)
                    }
                    helperText={
                      formik.touched.couponCode && formik.errors.couponCode
                    }
                  />

                  <Typography>Coupon Details</Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={2}
                    maxRows={4}
                    label="Coupon Details"
                    name="couponDetails"
                    value={formik.values.couponDetails}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.couponDetails &&
                      Boolean(formik.errors.couponDetails)
                    }
                    helperText={
                      formik.touched.couponDetails &&
                      formik.errors.couponDetails
                    }
                  />
                </Box>
              </Box>
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: "#6CA6FF",
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
                <TextField
                  variant="outlined"
                  // fullWidth
                  margin="normal"
                  autoComplete="off"
                  label="Redemption Count"
                  name="redemptionCount"
                  type="number"
                  value={formik.values.redemptionCount}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.redemptionCount &&
                    Boolean(formik.errors.redemptionCount)
                  }
                  helperText={
                    formik.touched.redemptionCount &&
                    formik.errors.redemptionCount
                  }
                  sx={{ width: "40% " }}
                />

                <Typography>Expiry Date</Typography>
                <TextField
                  name="expiryDate"
                  type="date"
                  value={formik.values.expiryDate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.expiryDate &&
                    Boolean(formik.errors.expiryDate)
                  }
                  helperText={
                    formik.touched.expiryDate && formik.errors.expiryDate
                  }
                />
              </Box>

              <Typography variant="h3" sx={{ ml: "auto" }}>
                Other Details
              </Typography>
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Link to={`/admincoupons`}>
                <Button variant="outlined" color="warning">
                  Back
                </Button>
              </Link>
              <Button
                variant="contained"
                type="submit"
                color="success"
                sx={{ ml: 2 }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default AddCoupons;
