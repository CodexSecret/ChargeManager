import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
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
import { Search, Clear, Delete } from "@mui/icons-material";
import MapIcon from "@mui/icons-material/Map";
import { DataGrid } from "@mui/x-data-grid";
import http from "../http";
import dayjs from "dayjs";
import global from "../global";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import UserContext from "../contexts/UserContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

function Branch() {
  const navigate = useNavigate();
  const [branchList, setBranchList] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteBranchId, setDeleteBranchId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleErrorClose = () => {
    setDialogOpen(false);
  };


  const searchAddressOnOneMap = async (address) => {
    try {
      const corsProxyUrl = "https://corsproxy.io/?";
      const apiKey =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMzNkZjQ1OThiZjFkM2JkNjliZmVkMjM1ZjAwMjNlYiIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNjkwODIxMjM5LCJleHAiOjE2OTEwODA0MzksIm5iZiI6MTY5MDgyMTIzOSwianRpIjoic3JjWFVvQkFGdk1hdEhUaSIsInVzZXJfaWQiOjIxMywiZm9yZXZlciI6ZmFsc2V9.CnUxnTLC45_gvjb_O6I5ByeFaRFPjSiSPN0MjWjl9vg"; // Replace with your OneMap API key
      const url = `${corsProxyUrl}https://developers.onemap.sg/commonapi/search?searchVal=${encodeURIComponent(
        address
      )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      const response = await axios.get(url, {
        headers: {
          Authorization: apiKey,
        },
      });
      return response.data.results;
    } catch (error) {
      console.error("Error searching address on OneMap:", error);
      return [];
    }
  };

  const handleMapOpen = async (branchId) => {
    const selected = branchList.find((branch) => branch.id === branchId);
    if (selected && selected.address) {
      try {
        const searchResults = await searchAddressOnOneMap(selected.address);
        if (searchResults.length > 0) {
          const firstResult = searchResults[0];
          setSelectedBranch({
            ...selected,
            latitude: firstResult.LATITUDE,
            longitude: firstResult.LONGITUDE,
          });
          setOpenMapDialog(true);
        } else {
          console.error(
            "No results found on OneMap for the address:",
            selected.address
          );
          setDialogOpen(true);
        }
      } catch (error) {
        console.error("Error searching address on OneMap:", error);
        setDialogOpen(true);
      }
    } else {
      console.error(
        "Selected branch or address is missing or invalid:",
        selected
      );
      setDialogOpen(true);
    }
  };

  const handleMapClose = () => {
    setSelectedBranch(null);
    setOpenMapDialog(false);
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getBranch = () => {
    http.get("/branch").then((res) => {
      setBranchList(res.data);
    });
  };

  const searchBranch = () => {
    http.get(`/branch?search=${search}`).then((res) => {
      setBranchList(res.data);
    });
  };

  const deleteBranch = () => {
    if (deleteBranchId) {
      http.delete(`/branch/${deleteBranchId}`).then((res) => {
        console.log(res.data);
        handleDeleteClose();
        window.location.reload(true);
      });
    }
  };

  useEffect(() => {
    getBranch();
  }, [location]);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchBranch();
    }
    if (e.key === "Escape") {
      setSearch("");
      searchBranch();
    }
  };

  const onClickSearch = () => {
    searchBranch();
  };

  const onClickClear = () => {
    setSearch("");
    getBranch();
  };

  const handleDeleteOpen = (branchId) => {
    setDeleteBranchId(branchId);
    setOpen(true);
  };

  const handleDeleteClose = () => {
    setOpen(false);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nickname", headerName: "BRANCH", width: 200 },
    { field: "address", headerName: "ADDRESS", width: 300 },
    {
      field: "createdAt",
      headerName: "CREATED ON",
      width: 200,
      valueGetter: (params) =>
        dayjs(params.row.createdAt).format(global.datetimeFormat),
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            sx={{
              color: "#DC3545",
              ":hover": {
                color: "#BB1E2D",
              },
            }}
            onClick={() => handleDeleteOpen(params.row.id)}
          >
            <Delete />
          </IconButton>
          <ThemeProvider theme={admintheme}>
            <IconButton
              color="primary"
              onClick={() => handleMapOpen(params.row.id)}
            >
              <MapIcon />
            </IconButton>
          </ThemeProvider>
        </>
      ),
    },
  ];

  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
          Branch
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
            <Link to="/addbranch" style={{ textDecoration: "none" }}>
              <Button variant="contained">Add</Button>
            </Link>
          </ThemeProvider>

        </Box>
        <DataGrid
          rows={branchList}
          columns={columns}
          autoHeight
          pagination
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          disableSelectionOnClick
        />
        <Dialog open={open} onClose={handleDeleteClose}>
          <DialogTitle>Delete Branch</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this branch?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="inherit"
              onClick={handleDeleteClose}
            >
              Cancel
            </Button>
            <Button variant="outlined" color="error" onClick={deleteBranch}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openMapDialog} onClose={handleMapClose}>
          <DialogTitle>Branch Location</DialogTitle>
          <DialogContent sx={{ width: "400px", height: "400px" }}>
            {selectedBranch &&
              selectedBranch.latitude &&
              selectedBranch.longitude ? (
              <MapContainer
                center={[selectedBranch.latitude, selectedBranch.longitude]}
                zoom={15}
                style={{ height: "400px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[selectedBranch.latitude, selectedBranch.longitude]}
                >
                  <Popup>{selectedBranch.address}</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <p>No map data available.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="inherit"
              onClick={handleMapClose}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        {/* Error Dialog */}
        <Dialog open={dialogOpen} onClose={handleErrorClose}>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This location cannot be found! Please contact the administrator!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="inherit" onClick={handleErrorClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Branch;
