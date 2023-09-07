import React, { useEffect, useState, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
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
import { Search, Clear, Delete, Edit, Block } from "@mui/icons-material";
import http from "../http";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
    input: {
      color: "#003C94",
    },
  },
});

function AdminUsers() {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const [search, setSearch] = useState("");

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getUsers = () => {
    http.get("/user").then((res) => {
      let filteredUsers = res.data;
      filteredUsers = filteredUsers.filter(
        (user) => user.id !== currentUser.id && !user.isBanned
      );
      setUserList(filteredUsers);
  });
};

const searchUsers = () => {
  http.get(`/user?search=${search}`).then((res) => {
    const filteredUserList = res.data.filter((user) => user.id !== currentUser.id && !user.isBanned);
    setUserList(filteredUserList);
  });
};

useEffect(() => {
  getUsers();
}, [currentUser]);

const onSearchKeyDown = (e) => {
  if (e.key === "Enter") {
    searchUsers();
  }
  if (e.key === "Escape") {
    setSearch("");
    getUsers();
  }
};

const onClickSearch = () => {
  searchUsers();
};

const onClickClear = () => {
  setSearch("");
  getUsers();
};

const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteUserId, setDeleteUserId] = useState(null);
const [deleteUserInfo, setDeleteUserInfo] = useState({});

const handleDeleteOpen = (userId) => {
  setDeleteUserId(userId);
  console.log(userId)
  http.get(`user/admingetuser/${userId}`).then((res) => { // Use userId instead of deleteUserId
    setDeleteUserInfo(res.data);
    setDeleteOpen(true);
  });
};

const handleDeleteClose = () => {
  setDeleteOpen(false);
};

const deleteUser = () => {
  if (deleteUserId) {
    http.delete(`/user/admindelete/${deleteUserId}`).then((res) => {
      console.log(res.data);
      handleDeleteClose();
      getUsers();
    });
    http.post(`/accnotif/admindeletion/${deleteUserId}`).then((res) => {
      console.log(res.data);
    });
  }
};

const [banOpen, setBanOpen] = useState(false);
const [banUserId, setBanUserId] = useState(null);
const [banUserInfo, setBanUserInfo] = useState({});


const handleBanOpen = (userId) => {
  setBanUserId(userId);
  http.get(`user/admingetuser/${userId}`).then((res) => { // Use userId instead of deleteUserId
    setBanUserInfo(res.data);
    setBanOpen(true);
  });
};

const handleBanClose = () => {
  setBanOpen(false);
};

const banUser = () => {
  if (banUserId) {
    http.put(`/user/ban/${banUserId}`).then((res) => {
      console.log(res.data);
      handleBanClose();
      getUsers();
    });
    http.post(`/accnotif/ban/${banUserId}`).then((res) => {
      console.log(res.data);
    });
  }
};

const columns = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
    // width: 95,
    renderCell: (params) => <strong>{params.value}</strong>,
  },
  {
    field: "name",
    headerName: "FULL NAME",
    flex: 2.5,
    // width: 250,
  },
  {
    field: "username",
    headerName: "USERNAME",
    flex: 2.5,
    // width: 250,
    renderCell: (params) => (
      <>
        <Avatar
          sx={{
            mx: 1,
            width: 35,
            height: 35,
          }}
          alt={params.row.username}
          src={`${import.meta.env.VITE_FILE_BASE_URL}${params.row.imageFile}`}
        />
        {params.row.username}
      </>
    ),
  },
  {
    field: "email",
    headerName: "EMAIL",
    flex: 3.5,
    // width: 350,
  },
  {
    field: "rewardPoints",
    headerName: "POINTS",
    flex: 1,
    // width: 120,
  },
  {
    field: "actions",
    headerName: "ACTIONS",
    flex: 1.5,
    // width: 100,
    renderCell: (params) => (
      <>
        <Link to={`/adminedituser/${params.row.id}`}>
          <IconButton
            sx={{
              color: "#003C94",
              ":hover": {
                color: "#032E6D",
              },
            }}
          >
            <Edit />
          </IconButton>
        </Link>

        <IconButton
          variant="contained"
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

        <IconButton
          variant="contained"
          sx={{
            color: "#000000",
            ":hover": {
              color: "#BB1E2D",
            },
          }}
          onClick={() => handleBanOpen(params.row.id)}
        >
          <Block />
        </IconButton>

        <Dialog open={deleteOpen} onClose={handleDeleteClose}>
          <DialogTitle sx={{
            bgcolor: "error.main",
            color: "white",
            paddingBottom: "16px",
          }}>
            Delete User ID: {deleteUserId}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ paddingTop: "16px", paddingBottom: "16px" }}>
              Are you sure you want to delete this account?
            </DialogContentText>
            <DialogContentText>
              <strong>USER ID:</strong> {deleteUserId}
            </DialogContentText>
            <DialogContentText>
              <strong>FULL NAME:</strong> {deleteUserInfo.name}
            </DialogContentText>
            <DialogContentText>
              <strong>EMAIL:</strong> {deleteUserInfo.email}
            </DialogContentText>
            <DialogContentText>
              <strong>USERNAME:</strong> {deleteUserInfo.username}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="inherit"
              onClick={handleDeleteClose}
            >
              CANCEL
            </Button>
            <Button variant="contained" color="error" onClick={deleteUser}>
              DELETE
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={banOpen} onClose={handleBanClose}>
          <DialogTitle sx={{
            bgcolor: "#000000",
            color: "white",
            paddingBottom: "16px",
          }}>
            Ban User ID: {banUserId}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ paddingTop: "16px", paddingBottom: "16px" }}>
              Are you sure you want to ban this account?
            </DialogContentText>
            <DialogContentText>
              <strong>USER ID:</strong> {banUserId}
            </DialogContentText>
            <DialogContentText>
              <strong>FULL NAME:</strong> {banUserInfo.name}
            </DialogContentText>
            <DialogContentText>
              <strong>EMAIL:</strong> {banUserInfo.email}
            </DialogContentText>
            <DialogContentText>
              <strong>USERNAME:</strong> {banUserInfo.username}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="inherit"
              onClick={handleBanClose}
            >
              CANCEL
            </Button>
            <Button variant="contained" sx={{
              bgcolor: "#000000",
              ":hover": {
                bgcolor: "#BB1E2D",
              },
            }} onClick={banUser}>
              BAN
            </Button>
          </DialogActions>
        </Dialog>
      </>
    ),
  },
];

// React Page
return (
  <Container>
    <Box>
      <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
        User List
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
        </ThemeProvider>
      </Box>

      <ThemeProvider theme={admintheme}>
        <DataGrid
          rows={userList}
          columns={columns}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </ThemeProvider>

    </Box>
  </Container>
);
}

export default AdminUsers;
