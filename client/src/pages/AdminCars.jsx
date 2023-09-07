import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button, Divider, Container } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import global from '../global';
import UserContext from '../contexts/UserContext';
import AspectRatio from '@mui/joy/AspectRatio';
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


function AdminCars() {
    const navigate = useNavigate();
    const [carList, setCarList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate("/");
        }
    }, [user, navigate]);

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getCars = () => {
        http.get('/car').then((res) => {
            const currentDate = dayjs();
            const filteredCars = res.data.filter((car) => {
                const endDate = dayjs(car.enddate);
                return endDate.isAfter(currentDate) || endDate.isSame(currentDate);
            });
            setCarList(filteredCars);
        });
    };

    const searchCars = () => {
        http.get(`/car?search=${search}`).then((res) => {
            let filteredCars = res.data;
            const currentDate = dayjs();
            filteredCars = res.data.filter((car) => {
                const endDate = dayjs(car.enddate);
                return endDate.isAfter(currentDate) || endDate.isSame(currentDate);
            });
            setCarList(filteredCars);
        });
    };

    useEffect(() => {
        getCars();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchCars();
        }
        if (e.key === "Escape") {
            setSearch("");
            searchCars();
        }

    };

    const onClickSearch = () => {
        searchCars();
    }

    const onClickClear = () => {
        setSearch('');
        getCars();
    };

    useEffect(() => {
        getCars();
    }, [user]);
    return (
        <Container>
            <Box>
                <Typography variant="h5" sx={{ my: 2, color: "#003C94" }}>
                    Cars
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ThemeProvider theme={admintheme}>
                        <Input value={search} placeholder="Search"
                            onChange={onSearchChange}
                            onKeyDown={onSearchKeyDown} />
                        <IconButton color="primary"
                            onClick={onClickSearch}>
                            <Search />
                        </IconButton>
                        <IconButton color="primary"
                            onClick={onClickClear}>
                            <Clear />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }} />
                        {user &&
                            (
                                <React.Fragment>
                                    <Link to="/adminoldcars" style={{ textDecoration: 'none' }}>
                                        <Button variant='contained'>
                                            Old Cars
                                        </Button>
                                    </Link>
                                </React.Fragment>
                            )
                        }
                    </ThemeProvider>

                </Box>
                <Grid container spacing={2}>
                    {
                        carList.map((car, i) => {
                            return (
                                <Grid item xs={12} md={6} lg={4} key={car.id}>
                                    <Card
                                        sx={{
                                            transition: 'box-shadow 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        {car.imageFile && (
                                            <AspectRatio>
                                                <Box component="img" src={`${import.meta.env.VITE_FILE_BASE_URL}${car.imageFile}`} alt="car" />
                                            </AspectRatio>
                                        )}
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                                                    {car.license}
                                                </Typography>
                                                <Link to={`/editcar/${car.id}`}>
                                                    <ThemeProvider theme={admintheme}>
                                                        <IconButton color="primary">
                                                            <Edit />
                                                        </IconButton>
                                                    </ThemeProvider>

                                                </Link>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                                <AccountCircle sx={{ mr: 1 }} />
                                                <Typography>{car.user.name}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                                <AccessTime sx={{ mr: 1 }} />
                                                <Typography>{dayjs(car.createdAt).format(global.datetimeFormat)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                                                    Car Model:
                                                </Typography>
                                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{car.carmodel}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                                                    Location:
                                                </Typography>
                                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{car.location}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                                                    Start Date:
                                                </Typography>
                                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{car.startdate}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                                                    End Date:
                                                </Typography>
                                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{car.enddate}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                                                    Price:
                                                </Typography>
                                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{car.price}</Typography>
                                            </Box>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                Description:
                                            </Typography>
                                            <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{car.description}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })
                    }
                </Grid>
            </Box>
        </Container>
    )
}

export default AdminCars