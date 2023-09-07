import React, { useEffect, useState, useContext } from "react";
import http from "../http";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import {
  AccessTime,
  Search,
  Clear,
  Edit,
  Delete,
  TonalitySharp,
} from "@mui/icons-material";
import dayjs from "dayjs";
import global from "../global";
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
  },
});

function Coupons() {
  const navigate = useNavigate();
  const [couponList, setCouponList] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteCouponId, setDeleteCouponId] = useState(null);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  let deleteList = [];

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Call API to get all coupons
  const getCoupons = async () => {
    try {
      const response = await http.get("/coupon");
      setCouponList(response.data);
      await deleteExpired();
    } catch (error) {
      console.error("Error getting coupons:", error);
    }
  };

  const deleteExpired = async () => {
    try {
      const response = await http.get("/coupon");
      const coupons = response.data;

      for (let i of coupons) {
        if (Date.parse(i.expiryDate) < new Date()) {
          setDeleteCouponId(i.id);
          deleteList.push(i.id);
          await deleteCoupon();
        }
      }
    } catch (error) {
      console.error("Error deleting expired coupons:", error);
    }
  };

  // Notification to tell admins that coupons have expired
  const expiredNotif = () => {
    for (let i of deleteList) {
      toast.error("Coupon with the ID '" + deleteList[i] + "' has expired");
    }
  };

  // Call API to search coupons
  const searchCoupons = () => {
    http.get(`/coupon?search=${search}`).then((res) => {
      setCouponList(res.data);
    });
  };

  // Call function to getCoupons
  useEffect(() => {
    getCoupons();
  }, []);

  // When enter key is down, call function searchCoupons
  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchCoupons();
    }
    if (e.key === "Escape") {
      setSearch("");
      getCoupons();
    }
  };

  // Call function searchCoupons
  const onClickSearch = () => {
    searchCoupons();
  };

  // Clear search state and call function getCoupons
  const onClickClear = () => {
    setSearch("");
    getCoupons();
  };

  // Delete Coupon Function
  const deleteCoupon = () => {
    if (deleteCouponId) {
      http.delete(`/coupon/${deleteCouponId}`).then((res) => {
        handleClose();
        window.location.reload(true);
      });
    }
  };

  const updateCoupon = (updateID) => {
    navigate(`/editcoupons/${updateID}`);
  };

  useEffect(() => {
    deleteExpired();
  }, [couponList]);

  useEffect(() => {
    expiredNotif();
  });

  // All Coupon Display
  useEffect(() => {
    http.get("/coupon").then((res) => {
      setCouponList(res.data);
    });
  }, []);

  const [open, setOpen] = useState(false);

  const handleOpen = (CouponId) => {
    setOpen(true);
    setDeleteCouponId(CouponId);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns = [
    { field: "couponCode", headerName: "COUPON CODE", width: 130 },
    {
      field: "discount",
      headerName: "DISCOUNT",
      description: "% off for the next use",
      width: 100,
    },
    {
      field: "redemptionCount",
      headerName: "REDEMPTION CODE",
      description: "How many times a coupon can be redeemed",
      width: 150,
    },
    {
      field: "createdAt",
      headerName: "CREATED ON",
      description: "The date and time the coupon was created on",
      width: 150,
    },
    {
      field: "expiryDate",
      headerName: "EXPIRY DATE",
      description: "This Coupon Expires On",
      width: 150,
    },
    {
      sortable: false,
      field: "actions",
      headerName: "ACTIONS",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            sx={{
              color: "#003C94",
              ":hover": {
                color: "#032E6D",
              },
            }}
            onClick={() => updateCoupon(params.row.id)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="primary"
            sx={{
              color: "#DC3545",
              ":hover": {
                color: "#BB1E2D",
              },
            }}
            onClick={() => handleOpen(params.row.id)}
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  // React Page
  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
          Coupons Created
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ThemeProvider theme={admintheme}>
            <Input
              value={search}
              placeholder="Search"
              onChange={onSearchChange}
              onKeyDown={onSearchKeyDown}
            />

            <IconButton color="primary" onClick={onClickSearch}>
              <Search />
            </IconButton>

            <IconButton color="primary" onClick={onClickClear}>
              <Clear />
            </IconButton>

            <Box sx={{ flexGrow: 1 }} />
            <Link to="/addcoupons" style={{ textDecoration: "none" }}>
              <Button variant="contained">Create Coupon</Button>
            </Link>
          </ThemeProvider>
        </Box>

        <ThemeProvider theme={admintheme}>
          <DataGrid
            autoHeight
            rows={couponList}
            columns={columns.map((column) => {
              if (column.field == "createdAt") {
                return {
                  ...column,
                  valueGetter: (params) =>
                    dayjs(params.row.createdAt).format(global.datetimeFormat),
                };
              }

              if (column.field == "expiryDate") {
                return {
                  ...column,
                  valueGetter: (params) =>
                    dayjs(params.row.expiryDate).format(global.datetimeFormat),
                };
              }
              return column;
            })}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
        </ThemeProvider>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Coupon</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this coupon?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="outlined" color="error" onClick={deleteCoupon}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <ToastContainer />

        {/* <Grid container spacing={2}>
        {couponList.map((coupon, i) => {
          return (
            <Grid item xs={12} md={6} lg={4} key={coupon.id}>
              <Card sx={{ borderRadius: 2 }}>
                <Box sx={{ px: 1, py: 1, bgcolor: "#6CA6FF" }}>
                  <CardContent sx={{ bgcolor: "#FBE180", borderRadius: 2 }}>
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

                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      color="text.secondary"
                    >
                      <AccessTime sx={{ mr: 1 }} />
                      <Typography>
                        Created On:{" "}
                        {dayjs(coupon.createdAt).format(global.datetimeFormat)}
                      </Typography>

                      <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Delete Coupon</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            Are you sure you want to delete this coupon?
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
                            variant="outlined"
                            color="error"
                            onClick={() => deleteCoupon(coupon.id)}
                          >
                            Delete
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Box>
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Link to={`/editcoupons/${coupon.id}`}>
                        <IconButton color="primary">
                          <Edit />
                        </IconButton>
                      </Link>

                      <IconButton color="primary" onClick={handleOpen}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid> */}
      </Box>
    </Container>
  );
}

export default Coupons;
