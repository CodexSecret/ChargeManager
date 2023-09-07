import React, { useEffect, useState, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
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
import { Search, Clear, Delete, Update } from "@mui/icons-material";
import http from "../http";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserContext from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

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
    const [bannedUserList, setBannedUserList] = useState([]);
    const [search, setSearch] = useState("");
    const { user: currentUser } = useContext(UserContext);

    useEffect(() => {
        if (!currentUser || !currentUser.isAdmin) {
            navigate("/");
        }
    }, [currentUser, navigate]);


    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getBannedUsers = () => {
        http.get("/user").then((res) => {
            let filteredUsers = res.data;
            filteredUsers = filteredUsers.filter((user) => user.isBanned); // Only show banned users
            setBannedUserList(filteredUsers);
        });
    };
    const searchBannedUsers = () => {
        http.get(`/user?search=${search}`).then((res) => {
            const filteredUserList = res.data.filter((user) => user.isBanned);
            setBannedUserList(filteredUserList);
        });
    };

    useEffect(() => {
        getBannedUsers();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchBannedUsers();
        }
        if (e.key === "Escape") {
            setSearch("");
            getBannedUsers();
        }
    };

    const onClickSearch = () => {
        searchBannedUsers();
    };

    const onClickClear = () => {
        setSearch("");
        getBannedUsers();
    };

    const [unbanOpen, setUnbanOpen] = useState(false);
    const [unbanUserId, setUnbanUserId] = useState(null);
    const [unbanUserInfo, setUnbanUserInfo] = useState({});

    const handleUnbanOpen = (userId) => {
        setUnbanUserId(userId);
        http.get(`user/admingetuser/${userId}`).then((res) => { 
            setUnbanUserInfo(res.data);
            console.log(res.data)
            setUnbanOpen(true);
        });
    };

    const handleUnbanClose = () => {
        setUnbanOpen(false);
    };

    const unbanUser = () => {
        if (unbanUserId) {
            http.put(`/user/unban/${unbanUserId}`).then((res) => {
                console.log(res.data);
                handleUnbanClose();
                getBannedUsers();
            });
            http.post(`/accnotif/unban/${unbanUserId}`).then((res) => {
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
            field: "actions",
            headerName: "ACTIONS",
            flex: 1,
            // width: 100,
            renderCell: (params) => (
                <>
                    <IconButton
                        variant="contained"
                        color="success"
                        onClick={() => handleUnbanOpen(params.row.id)}
                    >
                        <Update />
                    </IconButton>

                    <Dialog open={unbanOpen} onClose={handleUnbanClose}>
                        <DialogTitle sx={{
                            bgcolor: "success.main",
                            color: "white",
                            paddingBottom: "16px",
                        }}
                        >
                            Unban User ID: {unbanUserId}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{ paddingTop: "16px", paddingBottom: "16px" }}>
                                Are you sure you want to unban this account?
                            </DialogContentText>
                            <DialogContentText>
                                <strong>USER ID:</strong> {unbanUserId}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>FULL NAME:</strong> {unbanUserInfo.name}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>EMAIL:</strong> {unbanUserInfo.email}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>USERNAME:</strong> {unbanUserInfo.username}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                color="inherit"
                                onClick={handleUnbanClose}
                            >
                                CANCEL
                            </Button>
                            <Button variant="contained" color="success" onClick={unbanUser}>
                                UNBAN
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            ),
        },
    ];

    return (
        <Container>
            <Box>
                <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
                    Banned User List
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
                        rows={bannedUserList}
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
