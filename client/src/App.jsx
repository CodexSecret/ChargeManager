import "./App.css";
import { useState, useEffect } from "react";
import * as React from 'react';
import {
    Container,
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Menu,
    MenuItem
} from "@mui/material";
import { Menu as MenuIcon, ElectricBolt, Message } from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import http from "./http";

// Allister's Routes //
import AddReview from "./pages/AddReview";
import AllReviews from "./pages/AllReviews";
import Chats from "./pages/Chats";
import EditReview from "./pages/EditReview";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import ReportReview from "./pages/ReportReview";
import Reviews from "./pages/Reviews";
import ReviewReview from "./pages/ReviewReview";
import NotFound from "./pages/NotFound";
// Allister's Routes //

// Elijah's Routes // 
import AddCoupons from "./pages/AddCoupons";
import AddRewards from "./pages/AddRewards";
import AdminCoupons from "./pages/AdminCoupons";
import AdminHome from "./pages/AdminHome";
import AdminRewards from "./pages/AdminRewards";
import CouponDetails from "./pages/CouponDetails";
import EditCoupons from "./pages/EditCoupons";
import EditRewards from "./pages/EditRewards";
import RewardDetails from "./pages/RewardDetails";
import UserCoupons from "./pages/UserCoupons";
import UserRewards from "./pages/UserRewards";
// Elijah's Routes // 

// Eshton's Routes // 
import AddBranch from './pages/AddBranch';
import AddCar from './pages/AddCar';
import AdminCars from './pages/AdminCars';
import AdminOldCars from './pages/AdminOldCars';
import Branch from './pages/Branch';
import Cars from './pages/Cars';
import EditCar from './pages/EditCar';
import Marketplace from './pages/Marketplace';
import OldCars from './pages/OldCars';
// Eshton's Routes // 

// Khansa's Routes // 
import AddBooking from './pages/AddBooking';
import Booking from './pages/Booking';
import BookingChart from './pages/BookingChart';
import Confirmation from './pages/Confirmation';
import ErrorPage from './pages/ErrorPage';
import PaymentForm from './pages/PaymentForm';
import AdminBooking from './pages/AdminBooking';
// Khansa's Routes // 

// Natalie's Routes // 
import AddAddress from "./pages/AddAddress";
import Address from "./pages/Address";
import AdminAddress from "./pages/AdminAddress";
import AdminEditUser from "./pages/AdminEditUser"
import AdminUsers from "./pages/AdminUsers";
import BannedUsers from "./pages/BannedUsers";
import DeletedUsers from "./pages/DeletedUsers";
import EditAddress from "./pages/EditAddress";
import EditUser from "./pages/EditUser";
import EditPassword from "./pages/EditPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserContext from "./contexts/UserContext";
import UserDetailsPage from "./pages/UserDetails";
// Natalie's Routes // 

function App() {
    const [user, setUser] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoginOrRegisterPage, setIsLoginOrRegisterPage] = useState(false)
    const [key, setKey] = useState(0);

    useEffect(() => {
        const admin = ({
            email: "admin@charge.com",
            password: "ChargeAdmin123",
            name: "Charge Admin",
            username: "Admin",
            isAdmin: true,
            imageFile: "default.png",
        });

        async function fetchData() {
            await http.get("/user").then((res) => {
                const adminUser = res.data.find((user) => user.email === "admin@charge.com");
                if (!adminUser) {
                    http.post("/user/register", admin).then(() => {
                        console.log("Admin account created");
                    });
                } else {
                    console.log("Admin account already exists");
                }
            }).catch((error) => {
                console.error("Error retrieving users:", error);
            });
        }
        fetchData();

        async function checkIfBanned() {
            try {
                const response = await http.get("/user/getuser");
                const CheckUser = response.data;
                if (CheckUser.isBanned) {
                    localStorage.clear();
                    if (window.location.pathname !== "/") {
                        window.location = "/";
                    }
                    console.log("User has been logged out due to being banned");
                }
            } catch (error) {
                console.error("Error retrieving user:", error);
            }
        }

        if (localStorage.getItem("accessToken")) {
            checkIfBanned();
        }

    }, []);

    var color = "#016670";
    var dropdowncolor = "linear-gradient(160deg, #016670 50%, #0686A7 , #0AABAB);"

    // Event listener to check and update the page URL
    const handleLocationChange = () => {
        const pathname = window.location.pathname;
        setIsLoginOrRegisterPage(pathname === '/login' || pathname === '/register');

        // Force a re-render
        setKey(prevKey => prevKey + 1);
    };

    function Navbar({ user }) {
        const location = useLocation();
        const isLoginOrRegisterPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgotpassword';

        if (user && user.isAdmin) {
            color = "#003C94";
            dropdowncolor = "linear-gradient(172deg, #003C94 40%, #3F50AD, #0081C9)";
        }

        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);
        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <Box>
                {!isLoginOrRegisterPage && (
                    <AppBar position="static" className="AppBar" sx={{ backgroundColor: color }}>
                        <Container>
                            <Toolbar disableGutters={true}>
                                {user && (
                                    <IconButton color="inherit" onClick={handleDrawerOpen}>
                                        <MenuIcon />
                                    </IconButton>
                                )}
                                <Box sx={{ flexGrow: 1 }}></Box>
                                {!user && (
                                    <Link to="/">
                                        <Box sx={{ display: 'flex' }}>
                                            <ElectricBolt sx={{ fontSize: 40 }} />
                                            <Typography variant="h4" component="Box" sx={{ fontFamily: 'Zen Tokyo Zoo' }}>
                                                Charge
                                            </Typography>
                                        </Box>
                                    </Link>
                                )}
                                {user && !user.isAdmin && (
                                    <Link to="/">
                                        <Box sx={{ display: 'flex' }}>
                                            <ElectricBolt sx={{ fontSize: 40 }} />
                                            <Typography variant="h4" component="Box" sx={{ fontFamily: 'Zen Tokyo Zoo' }}>
                                                Charge
                                            </Typography>
                                        </Box>
                                    </Link>
                                )}
                                {user && user.isAdmin && (
                                    <Link to="/adminHome">
                                        <Box sx={{ display: 'flex' }}>
                                            <ElectricBolt sx={{ fontSize: 40 }} />
                                            <Typography variant="h4" component="Box" sx={{ fontFamily: 'Zen Tokyo Zoo' }}>
                                                Charge
                                            </Typography>
                                        </Box>
                                    </Link>
                                )}
                                <Box sx={{ flexGrow: 1 }}></Box>
                                <>
                                    {user && !user.isAdmin && (
                                        <Link to={`/chats`}>
                                            <IconButton>
                                                <Message />
                                            </IconButton>
                                        </Link>
                                    )}
                                    <Box>
                                        {user ? (
                                            <Button
                                                id="basic-button"
                                                aria-controls={open ? 'basic-menu' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={open ? 'true' : undefined}
                                                onClick={handleClick}
                                            >
                                                <Avatar
                                                    sx={{ mx: 1 }}
                                                    alt={user.username}
                                                    src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`}
                                                />
                                                <Box sx={{ color: "white" }}>
                                                    {user.username}
                                                </Box>
                                            </Button>
                                        ) : (
                                            // Show a different button/link for non-logged-in users
                                            <Button component={Link} to="/login" onClick={handleLoginButtonClick} sx={{ color: "white" }}>
                                                Login
                                            </Button>
                                        )}
                                        <Menu
                                            id="basic-menu"
                                            anchorEl={anchorEl}
                                            open={open}
                                            onClose={handleClose}
                                            MenuListProps={{
                                                'aria-labelledby': 'basic-button',
                                            }}
                                        >
                                            {user && (
                                                <>
                                                    <MenuItem component={Link} to="/user-details" sx={{ color: "#016670" }} onClick={handleClose}>Profile</MenuItem>
                                                    {!user.isAdmin && (
                                                        <MenuItem component={Link} to={`/allreviews/${user.id}/0`} sx={{ color: "#016670" }} onClick={handleClose}>Reviews</MenuItem>
                                                    )}
                                                    {!user.isAdmin && (
                                                        <MenuItem component={Link} to={"/address"} sx={{ color: "#016670" }} onClick={handleClose}>Addresses</MenuItem>
                                                    )
                                                    }
                                                    <MenuItem sx={{ color: "#DD4052" }} onClick={logout}>Logout</MenuItem>
                                                </>
                                            )}
                                        </Menu>
                                    </Box>
                                </>
                            </Toolbar>
                        </Container>
                    </AppBar>
                )}
                <Drawer
                    anchor="top"
                    open={isDrawerOpen}
                    onClose={handleDrawerClose}
                    PaperProps={{
                        sx: {
                            width: '100%',
                            background: dropdowncolor
                        },
                    }}
                >
                    {user && user.isAdmin && (
                        <><Box sx={{ display: "flex" }}>
                            <Box sx={{ width: "8%" }}><></></Box>
                            <Box sx={{ width: "25%" }}>
                                <>
                                    <List>
                                        <ListItem>
                                            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>Cars</Typography>
                                        </ListItem>
                                        <ListItem component={Link} to="/admincars" onClick={handleDrawerClose}>
                                            <ListItemText primary="View List Of Cars" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/bookingchart" onClick={handleDrawerClose}>
                                            <ListItemText primary="View Booking Chart" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/adminbooking" onClick={handleDrawerClose}>
                                            <ListItemText primary="View Booking List" sx={{ color: "white" }} />
                                        </ListItem>
                                    </List>
                                </>
                            </Box>
                            <Box sx={{ width: "25%" }}>
                                <>
                                    <List>
                                        <ListItem>
                                            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>Coupons</Typography>
                                        </ListItem>
                                        <ListItem component={Link} to="/addcoupons" onClick={handleDrawerClose}>
                                            <ListItemText primary="Create Coupon" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/admincoupons" onClick={handleDrawerClose}>
                                            <ListItemText primary="View List Of Coupons" sx={{ color: "white" }} />
                                        </ListItem>
                                    </List>
                                </>
                            </Box>
                            <Box sx={{ width: "25%" }}>
                                <>
                                    <List>
                                        <ListItem>
                                            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>Users</Typography>
                                        </ListItem>
                                        <ListItem component={Link} to="/users" onClick={handleDrawerClose}>
                                            <ListItemText primary="View List Of Users" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/bannedusers" onClick={handleDrawerClose}>
                                            <ListItemText primary="View Banned Users" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/deletedusers" onClick={handleDrawerClose}>
                                            <ListItemText primary="View Deleted Users" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/adminaddress" onClick={handleDrawerClose}>
                                            <ListItemText primary="View List Of User Addresses" sx={{ color: "white" }} />
                                        </ListItem>

                                    </List>
                                </>
                            </Box>
                        </Box><Box sx={{ display: "flex" }}>
                                <Box sx={{ width: "8%" }}><></></Box>
                                <Box sx={{ width: "25%" }}>
                                    <>
                                        <List>
                                            <ListItem>
                                                <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>Rewards</Typography>
                                            </ListItem>
                                            <ListItem component={Link} to="/addrewards" onClick={handleDrawerClose}>
                                                <ListItemText primary="Create Rewards" sx={{ color: "white" }} />
                                            </ListItem>
                                            <ListItem component={Link} to="/adminrewards" onClick={handleDrawerClose}>
                                                <ListItemText primary="View List Of Rewards" sx={{ color: "white" }} />
                                            </ListItem>
                                        </List>
                                    </>
                                </Box>
                                <Box sx={{ width: "25%" }}>
                                    <>
                                        <List>
                                            <ListItem>
                                                <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>Reports</Typography>
                                            </ListItem>
                                            <ListItem component={Link} to="/reports" onClick={handleDrawerClose}>
                                                <ListItemText primary="View List Of Reports" sx={{ color: "white" }} />
                                            </ListItem>
                                        </List>
                                    </>
                                </Box>
                                <Box sx={{ width: "25%" }}>
                                    <>
                                        <List>
                                            <ListItem>
                                                <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>Branch</Typography>
                                            </ListItem>
                                            <ListItem component={Link} to="/addbranch" onClick={handleDrawerClose}>
                                                <ListItemText primary="Add New Branch" sx={{ color: "white" }} />
                                            </ListItem>
                                            <ListItem component={Link} to="/branch" onClick={handleDrawerClose}>
                                                <ListItemText primary="View Branches" sx={{ color: "white" }} />
                                            </ListItem>
                                        </List>
                                    </>
                                </Box>
                            </Box></>
                    )}
                    {user && !user.isAdmin && (
                        <Box sx={{ display: "flex" }}>
                            <Box sx={{ width: "8%" }}><></></Box>
                            <Box sx={{ width: "25%" }}>
                                <>
                                    <List>
                                        <ListItem>
                                            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>CMarket</Typography>
                                        </ListItem>
                                        <ListItem component={Link} to="/addcar" onClick={handleDrawerClose}>
                                            <ListItemText primary="List A Car" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/cars" onClick={handleDrawerClose}>
                                            <ListItemText primary="View Your Cars" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/marketplace" onClick={handleDrawerClose}>
                                            <ListItemText primary="CMarket" sx={{ color: "white" }} />
                                        </ListItem>
                                        <ListItem component={Link} to="/booking" onClick={handleDrawerClose}>
                                            <ListItemText primary="Bookings" sx={{ color: "white" }} />
                                        </ListItem>
                                    </List>
                                </>
                            </Box>
                            <Box sx={{ width: "25%" }}>
                                <>
                                    <List>
                                        <ListItem>
                                            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>Coupons</Typography>
                                        </ListItem>
                                        <ListItem component={Link} to="/usercoupons" onClick={handleDrawerClose}>
                                            <ListItemText primary="All Coupons" sx={{ color: "white" }} />
                                        </ListItem>
                                    </List>
                                </>
                            </Box>
                            <Box sx={{ width: "25%" }}>
                                <>
                                    <List>
                                        <ListItem>
                                            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>CRewards</Typography>
                                        </ListItem>
                                        <ListItem component={Link} to="/userrewards" onClick={handleDrawerClose}>
                                            <ListItemText primary="All Rewards" sx={{ color: "white" }} />
                                        </ListItem>
                                    </List>
                                </>
                            </Box>
                        </Box>
                    )}
                </Drawer>

                {isDrawerOpen && (
                    <Box className="Backdrop" onClick={handleDrawerClose} />
                )}
            </Box>
        );
    }

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            http.get("/user/auth").then((res) => {
                setUser(res.data.user);
                setImageFile(res.data.user.imageFile);
            });
        }

        // Call handleLocationChange initially to set the initial state
        handleLocationChange();

        // Add the event listener when the component mounts
        window.addEventListener("popstate", handleLocationChange);

        // Return a cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("popstate", handleLocationChange);
        };

    }, []);

    const handleLoginButtonClick = () => {
        const hash = window.location.hash;
        const pathname = hash.substr(1);
        const isLoginPage = pathname === "/login";

        // Check if the user is already on the login page
        if (!isLoginPage) {
            // Redirect to the login page
            window.location.hash = "/login";
        }
    };

    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const logout = () => {
        localStorage.clear();
        window.location = '/'
    };

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Router>
                <Navbar user={user} />
                <Routes>
                    {/* Allister Routes */}
                    <Route path={"/addreview/:id"} element={<AddReview />} />
                    <Route path={"/allreviews/:id/:page"} element={<AllReviews />} />
                    <Route path={"/carreviews/:id"} element={<Reviews />} />
                    <Route path={"/chats"} element={<Chats />} />
                    <Route path={"/editreview/:id"} element={<EditReview />} />
                    <Route path={"/messages/:id"} element={<Messages />} />
                    <Route path={"/reportreview/:id"} element={<ReportReview />} />
                    <Route path={"/reports"} element={<Reports />} />
                    <Route path={"/reviewreview/:id"} element={<ReviewReview />} />
                    <Route path={"/*"} element={<NotFound />} />
                    {/* Allister Routes */}

                    {/* Elijah Routes */}
                    <Route path={"/addcoupons"} element={<AddCoupons />} />
                    <Route path={"/addrewards"} element={<AddRewards />} />
                    <Route path={"/admincoupons"} element={<AdminCoupons />} />
                    <Route path={"/adminhome"} element={<AdminHome />} />
                    <Route path={"/adminrewards"} element={<AdminRewards />} />
                    <Route path={"/coupondetails/:id"} element={<CouponDetails />} />
                    <Route path={"/editcoupons/:id"} element={<EditCoupons />} />
                    <Route path={"/editrewards/:id"} element={<EditRewards />} />
                    <Route path={"/rewarddetails/:id"} element={<RewardDetails />} />
                    <Route path={"/usercoupons"} element={<UserCoupons />} />
                    <Route path={"/userrewards"} element={<UserRewards />} />
                    {/* Elijah Routes */}

                    {/* Eshton Routes */}
                    <Route path={"/"} element={<Marketplace />} />
                    <Route path={"/addbranch"} element={<AddBranch />} />
                    <Route path={"/addcar"} element={<AddCar />} />
                    <Route path={"/admincars"} element={<AdminCars />} />
                    <Route path={"/adminoldcars"} element={<AdminOldCars />} />
                    <Route path={"/branch"} element={<Branch />} />
                    <Route path={"/cars"} element={<Cars />} />
                    <Route path={"/editcar/:id"} element={<EditCar />} />
                    <Route path={"/marketplace"} element={<Marketplace />} />
                    <Route path={"/oldcars"} element={<OldCars />} />
                    {/* Eshton Routes */}

                    {/* Khansa Routes */}
                    <Route path={"/addbooking/:id"} element={<AddBooking />} />
                    <Route path={"/booking"} element={<Booking />} />
                    <Route path={"/bookingchart"} element={<BookingChart />} />
                    <Route path={"/confirmation"} element={<Confirmation />} />
                    <Route path={"/error"} element={<ErrorPage />} />
                    <Route path={"/paymentform"} element={<PaymentForm />} />
                    <Route path={"/adminbooking"} element={<AdminBooking />} />
                    {/* Khansa Routes */}

                    {/* Natalie Routes */}
                    <Route path={"/address"} element={<Address />} />
                    <Route path={"/adminaddress"} element={<AdminAddress />} />
                    <Route path={"/adminedituser/:id"} element={<AdminEditUser />} />
                    <Route path={"/bannedusers"} element={<BannedUsers />} />
                    <Route path={"/deletedusers"} element={<DeletedUsers />} />
                    <Route path={"/editaddress/:id"} element={<EditAddress />} />
                    <Route path={"/editpassword/:id"} element={<EditPassword />} />
                    <Route path={"/edituser/:id"} element={<EditUser />} />
                    <Route path={"/forgotpassword"} element={<ForgotPassword />} />
                    <Route path={"/login"} element={<Login />} />
                    <Route path={"/newaddress/:id"} element={<AddAddress />} />
                    <Route path={"/register"} element={<Register />} />
                    <Route path={"/user-details"} element={<UserDetailsPage />} />
                    <Route path={"/users"} element={<AdminUsers />} />
                    {/* Natalie Routes */}

                </Routes>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
