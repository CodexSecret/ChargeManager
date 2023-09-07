import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Input,
    IconButton,
    Button,
    Container
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
    Search,
    Clear,
} from "@mui/icons-material";
import _ from "lodash";
import http from "../http";
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
        input: {
            color: "#003C94",
        },
    },
});

function AdminAddress() {
    const navigate = useNavigate();
    const [addressList, setAddressList] = useState([]);
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

    const getAddress = () => {
        http.get("/address/adminaddress").then((res) => {
            const groupedAddresses = _.groupBy(res.data, "userId");
            const addressesWithId = Object.values(groupedAddresses).flatMap(
                (addresses) =>
                    addresses.map((address) => ({
                        ...address,
                        id: address.id,
                        groupId: address.userId,
                    }))
            );
            setAddressList(addressesWithId);
        });
    };;

    const searchAddress = () => {
        http.get(`/address/adminaddress?search=${search}`).then((res) => {
            const groupedAddresses = _.groupBy(res.data, "userId");
            const addressesWithId = Object.values(groupedAddresses).flatMap(
                (addresses) =>
                    addresses.map((address) => ({
                        ...address,
                        id: address.id,
                        groupId: address.userId,
                    }))
            );
            setAddressList(addressesWithId);
        });
    };

    useEffect(() => {
        getAddress();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchAddress();
        }
        if (e.key === "Escape") {
            setSearch("");
            getAddress();
        }
    };

    const onClickSearch = () => {
        searchAddress();
    };

    const onClickClear = () => {
        setSearch("");
        getAddress();
    };

    const columns = [
        {
            field: "groupId", // Use groupId as the row grouping field
            headerName: "User ID",
            width: 95,
            renderCell: (params) => <strong>{params.value}</strong>,
            hide: true, // Hide the group ID column
        },
        {
            field: "id",
            headerName: "ID",
            // flex: 1,
            width: 95,
        },
        {
            field: "addressLineOne",
            headerName: "Address Line One",
            // flex: 1,
            width: 200,
        },
        {
            field: "addressLineTwo",
            headerName: "Address Line Two",
            // flex: 1,
            width: 250,
        },
        {
            field: "addressLineThree",
            headerName: "Address Line Three",
            // flex: 1,
            width: 250,
        },
        {
            field: "zipcode",
            headerName: "Zipcode",
            width: 90,
        },
        {
            field: "city",
            headerName: "City",
            // flex: 1,
            width: 120,
        },
        {
            field: "country",
            headerName: "Country",
            // flex: 1,
            width: 120,
        },
    ];


    return (
        <Container>
            <Box>
                <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
                    User Address List
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
                        rows={Object.values(addressList)}
                        groupBy={(row) => row.userId}
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

export default AdminAddress;
