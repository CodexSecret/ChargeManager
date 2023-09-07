import React, { useEffect, useState, useContext } from "react";
import http from "../http";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Input,
  IconButton,
  Button,
  Container,
} from "@mui/material";
import { AccessTime, Search, Clear } from "@mui/icons-material";
import dayjs from "dayjs";
import global from "../global";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserContext from "../contexts/UserContext";

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

function UserCoupons() {
  const navigate = useNavigate();
  const [couponList, setCouponList] = useState([]);
  const [couponUsageList, setCouponUsageList] = useState([]);
  const [search, setSearch] = useState("");
  const [availableCouponList, setAvailableCouponList] = useState([]);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || currentUser.isAdmin) {
      navigate(currentUser ? "/adminHome" : "/");
    }
  }, [currentUser, navigate]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchCoupons();
    } else if (e.key === "Escape") {
      setSearch("");
      getCoupons();
    }
  };

  const onClickSearch = () => {
    searchCoupons();
  };

  const onClickClear = () => {
    setSearch("");
    getCoupons();
  };
  
  // Call API to search coupons
  const searchCoupons = () => {
    if (!search) {
      // If the search input is empty, get all coupons
      getCoupons();
      return;
    }
  
    // Fetch the list of coupons
    http.get(`/coupon?search=${search}`)
      .then((res) => {
        let searchCouponList = res.data;
        console.log(searchCouponList)
  
        // Filter available coupons based on usage and search query
        const availableCoupons = searchCouponList.filter((coupon) => {
          const isUsed = couponUsageList.some((usage) => usage.CouponId === coupon.id);
          if (isUsed) {
            // Coupon is already used, skip it
            return false;
          }

          // Check if the coupon code or description matches the search query
          const matchesSearch =
            coupon.couponCode.toLowerCase().includes(search.toLowerCase()) ||
            coupon.description.toLowerCase().includes(search.toLowerCase());
  
          return matchesSearch;
        });
  
        setAvailableCouponList(availableCoupons);
      })
      .catch(error => {
        console.error("Error fetching coupons:", error);
        // Handle error, e.g., show an error message to the user
      });
  };
  

  const getCoupons = () => {
    http.get("/coupon").then((res) => {
      setCouponList(res.data);
      http.get("/couponusage").then((usageRes) => {
        setCouponUsageList(usageRes.data);
        const couponUsageIDList = usageRes.data.map((item) => item.CouponId);
        const availableCoupons = res.data.filter((coupon) => {
          const usedCoupon = couponUsageIDList.includes(coupon.id);
          if (!usedCoupon) {
            return true;
          }
          const usageEntry = usageRes.data.find((entry) => entry.CouponId === coupon.id);
          return (
            currentUser.id === usageEntry.UserId &&
            coupon.redemptionCount > usageEntry.userRedemption
          );
        });
        setAvailableCouponList(availableCoupons);
      });
    });
  };

  useEffect(() => {
    getCoupons();
  }, [currentUser]);

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Your Available Coupons
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

          <Box sx={{ flexGrow: 1 }} />
        </Box>

        <Grid container spacing={2}>
          {availableCouponList.map((coupon) => (
            <Grid item xs={12} md={6} lg={4} key={coupon.id}>
              <Card sx={{ borderRadius: 2, bgcolor: "#9FEDD7" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, fontWeight: "bold" }}
                  >
                    Coupon Code: {coupon.couponCode}
                  </Typography>

                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {coupon.discount}% OFF YOUR NEXT RENTAL
                  </Typography>

                  <Typography>
                    Expires On:{" "}
                    {dayjs(coupon.expiryDate).format(global.datetimeFormat)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to={`/coupondetails/${coupon.id}`}>
                    <Button size="small">Learn More</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default UserCoupons;
