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
import { AccessTime, Search, Clear, Edit, Delete } from "@mui/icons-material";
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


function AdminRewards() {
  const navigate = useNavigate();
  const [rewardList, setRewardList] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteRewardId, setDeleteRewardId] = useState(null);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Call API to get all rewards
  const getRewards = async () => {
    try {
      const response = await http.get("/reward");
      setRewardList(response.data);
      await deleteExpired();
    } catch (error) {
      console.error("Error getting rewards:", error);
    }
  };

  const deleteExpired = async () => {
    try {
      const response = await http.get("/reward");
      const rewards = response.data;

      for (let i of rewards) {
        if (Date.parse(i.expiryDate) < new Date()) {
          setDeleteRewardId(i.id);
          await deleteReward();
        }
      }
    } catch (error) {
      console.error("Error deleting expired rewards:", error);
    }
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
    deleteExpired();
  }, [rewardList]);

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

  // Delete Reward Function
  const deleteReward = () => {
    if (deleteRewardId) {
      http.delete(`/reward/${deleteRewardId}`).then((res) => {
        handleClose();
        window.location.reload(true);
      });
    }
  };

  // All Reward Display
  useEffect(() => {
    http.get("/reward").then((res) => {
      setRewardList(res.data);
    });
  }, []);

  const [open, setOpen] = useState(false);

  const handleOpen = (RewardId) => {
    setOpen(true);
    setDeleteRewardId(RewardId);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const updateReward = (updateID) => {
    navigate(`/editrewards/${updateID}`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90, type: "number" },
    {
      field: "rewardName",
      headerName: "REWARD NAME",
      description: "Name of the reward",
      width: 130,
    },
    {
      field: "pointRequirement",
      headerName: "POINT REQUIREMENT",
      description: "Points required for redemption",
      width: 130,
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
            onClick={() => updateReward(params.row.id)}
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
            onClick={() => handleOpen(params.row.id)}>
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
          C-Rewards Created
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
            <Link to="/addrewards" style={{ textDecoration: "none" }}>
              <Button variant="contained">
                Create Reward
              </Button>
            </Link>
          </ThemeProvider>

        </Box>

        <ThemeProvider theme={admintheme}>
          <DataGrid
          autoHeight
            rows={rewardList}
            columns={columns.map((column) => {
              if (column.field === "createdAt") {
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
          <DialogTitle>Delete Reward</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this reward?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="outlined" color="error" onClick={deleteReward}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default AdminRewards;
