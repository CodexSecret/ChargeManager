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
import { useNavigate } from "react-router-dom";
import { Search, Clear, Delete, Restore } from "@mui/icons-material";
import http from "../http";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserContext from "../contexts/UserContext";
import dayjs from "dayjs";
import global from "../global";

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

function DeletedUsers() {
    const navigate = useNavigate();
    const [deletedUserList, setDeletedUserList] = useState([]);
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

    const getDeletedUsers = () => {
        http.get("/deletedusers").then((res) => {
            setDeletedUserList(res.data);
        });
    };

    const searchDeletedUsers = () => {
        http.get(`/deletedusers?search=${search}`).then((res) => {
            setDeletedUserList(res.data);
        });
    };

    useEffect(() => {
        getDeletedUsers();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchDeletedUsers();
        }
        if (e.key === "Escape") {
            setSearch("");
            getDeletedUsers();
        }
    };

    const onClickSearch = () => {
        searchDeletedUsers();
    };

    const onClickClear = () => {
        setSearch("");
        getDeletedUsers();
    };

    const [restoreOpen, setRestoreOpen] = useState(false);
    const [restoreUserId, setRestoreUserId] = useState(null);
    const [restoreUserInfo, setRestoreUserInfo] = useState({});

    const handleRestoreOpen = (userId) => {
        setRestoreUserId(userId);
        http.get(`user/admingetuser/${userId}`).then((res) => {
            setRestoreUserInfo(res.data);
            setRestoreOpen(true);
        });
    };

    const handleRestoreClose = () => {
        setRestoreOpen(false);
    };

    const restoreUser = () => {
        if (restoreUserId) {
            http.put(`/deletedusers/restore/${restoreUserId}`).then((res) => {
                console.log(res.data);
                handleRestoreClose();
                getDeletedUsers();
            });
            http.post(`/accnotif/restoration/${restoreUserId}`).then((res) => {
                console.log(res.data);
            });
        }
    };


    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 1,
            // width: 120,
            renderCell: (params) => <strong>{params.value}</strong>,
        },
        {
            field: "name",
            headerName: "FULL NAME",
            flex: 2.5,
            // width: 200,
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
            // width: 300,
        },
        {
            field: "deletedAt",
            headerName: "DELETED AT",
            flex: 1,
        },
        {
            field: "actions",
            headerName: "ACTIONS",
            flex: 1, 
            // width: 80,
            renderCell: (params) => (
                <>
                    <IconButton
                        variant="contained"
                        sx={{
                            color: "#016670",
                            ":hover": {
                                color: "#02535B",
                            },
                        }}
                        onClick={() => handleRestoreOpen(params.row.id)}
                    >
                        <Restore />
                    </IconButton>

                    <Dialog open={restoreOpen} onClose={handleRestoreClose}>
                        <DialogTitle sx={{
                            bgcolor: "success.main",
                            color: "white",
                            paddingBottom: "16px",
                        }}
                        >
                            Restore User ID: {restoreUserId} </DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{ paddingTop: "16px", paddingBottom:"16px"}}>
                                Are you sure you want to restore this account?
                            </DialogContentText>
                            <DialogContentText>
                                <strong>USER ID:</strong> {restoreUserId}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>FULL NAME:</strong> {restoreUserInfo.name}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>EMAIL:</strong> {restoreUserInfo.email}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>USERNAME:</strong> {restoreUserInfo.username}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                color="inherit"
                                onClick={handleRestoreClose}
                            >
                                CANCEL
                            </Button>
                            <Button variant="contained" color="success" onClick={restoreUser}>
                                RESTORE
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
                    Deleted User List
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
                        autoHeight
                        rows={deletedUserList}
                        columns={columns.map((column) => {
                            if (column.field == "deletedAt") {
                                return {
                                    ...column,
                                    valueGetter: (params) =>
                                        dayjs(params.row.deletedAt).format(global.datetimeFormat),
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

            </Box>
        </Container>
    );
}

export default DeletedUsers;
