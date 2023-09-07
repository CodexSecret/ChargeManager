import React, { useEffect, useState, useContext } from "react";
import { Avatar, Box, Typography, TextField, Button, Grid, Container } from "@mui/material";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { debounce } from "lodash";
import * as yup from "yup";
import http from "../http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./Form.css";
import "./FormGroup.css";
import "./FormButton.css";
import UserContext from "../contexts/UserContext";
import { Link } from "react-router-dom";

const usertheme = createTheme({
    palette: {
        primary: {
            main: "#016670",
        },
        secondary: {
            main: "#0044ff",
        },
    },
});

function EditAddress() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(UserContext);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.isAdmin) {
                navigate("/adminHome");
            }
        } else {
            navigate("/");
        }
    }, [currentUser, navigate]);


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const removeAddress = () => {
        http.delete(`/address/${id}`).then((res) => {
            console.log(res.data);
            navigate("/address");
        });
    };

    const [address, setAddress] = useState({});

    useEffect(() => {
        if (id) {
            http
                .get(`/address/${id}`)
                .then((res) => {
                    setAddress(res.data);
                })
                .catch((err) => {
                    console.error(err);
                    setError(
                        "Failed to fetch car data. Please make sure the ID is correct."
                    );
                });
        } else {
            setError("No car ID provided.");
        }
    }, [id]);


    const formik = useFormik({
        initialValues: address,
        enableReinitialize: true,
        validationSchema: yup.object().shape({
            addressLineOne: yup
                .string()
                .trim()
                .min(1, "Name must be at least 1 characters")
                .max(40, "Name must be at most 40 characters")
                .required("First Address Line is required"),
            addressLineTwo: yup
                .string()
                .trim()
                .max(40, "Email must be at most 50 characters"),
            addressLineThree: yup
                .string()
                .trim()
                .max(40, "Password must be at most 50 characters"),
            zipcode: yup
                .string()
                .trim()
                .min(6, "Zipcode must be at least 6 characters")
                .max(6, "Zipcode must be at most 6 characters")
                .required("Zipcode is required"),
            city: yup
                .string()
                .trim()
                .min(1, "City must be at least 1 characters")
                .max(40, "City must be at most 50 characters")
                .required("City is required"),
            country: yup
                .string()
                .trim()
                .min(1, "Country must be at least 1 characters")
                .max(40, "Country must be at most 50 characters")
                .required("Country is required"),
        }),
        onSubmit: (data) => {
            data.addressLineOne = data.addressLineOne.trim();
            data.addressLineTwo = data.addressLineTwo.trim();
            data.addressLineThree = data.addressLineThree.trim();
            data.zipcode = data.zipcode.trim();
            data.city = data.city.trim();
            data.country = data.country.trim();
            http.put(`/address/${id}`, data)
                .then((res) => {
                    console.log(res.data);
                    navigate("/address");
                })
        },
    });

    return (
        <Container>
            <div>
                <div class="FormField">
                    <Box
                        sx={{
                            marginTop: 8,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "left",
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: "bold",
                                my: 2,
                                justifyContent: "flex-start",
                            }}
                        >
                            Edit Address:
                        </Typography>
                        <Box
                            component="form"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                            onSubmit={formik.handleSubmit}
                        >
                            <Grid container spacing={5}>
                                <Grid item xs={12} md={6} lg={5}>
                                    <ThemeProvider theme={usertheme}>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            autoComplete="off"
                                            label="First Address Line"
                                            name="addressLineOne"
                                            value={formik.values.addressLineOne}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.addressLineOne &&
                                                Boolean(formik.errors.addressLineOne)
                                            }
                                            helperText={
                                                formik.touched.addressLineOne && formik.errors.addressLineOne
                                            }
                                            size="small"
                                            variant="standard"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            autoComplete="off"
                                            label="Second Address Line"
                                            name="addressLineTwo"
                                            value={formik.values.addressLineTwo}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.addressLineTwo &&
                                                Boolean(formik.errors.addressLineTwo)
                                            }
                                            helperText={
                                                formik.touched.addressLineTwo && formik.errors.addressLineTwo
                                            }
                                            size="small"
                                            variant="standard"
                                            InputLabelProps={{ shrink: true }}

                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            autoComplete="off"
                                            label="Third Address Line"
                                            name="addressLineThree"
                                            value={formik.values.addressLineThree}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.addressLineThree &&
                                                Boolean(formik.errors.addressLineThree)
                                            }
                                            helperText={
                                                formik.touched.addressLineThree &&
                                                formik.errors.addressLineThree
                                            }
                                            size="small"
                                            variant="standard"
                                            InputLabelProps={{ shrink: true }}

                                        />
                                    </ThemeProvider>
                                </Grid>
                                <Grid item xs={12} md={6} lg={5}>
                                    <ThemeProvider theme={usertheme}>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            autoComplete="off"
                                            label="Zipcode"
                                            name="zipcode"
                                            value={formik.values.zipcode}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.zipcode &&
                                                Boolean(formik.errors.zipcode)
                                            }
                                            helperText={
                                                formik.touched.zipcode && formik.errors.zipcode
                                            }
                                            size="small"
                                            variant="standard"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            autoComplete="off"
                                            label="City"
                                            name="city"
                                            value={formik.values.city}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.city &&
                                                Boolean(formik.errors.city)
                                            }
                                            helperText={
                                                formik.touched.city && formik.errors.city
                                            }
                                            size="small"
                                            variant="standard"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            autoComplete="off"
                                            label="Country"
                                            name="country"
                                            value={formik.values.country}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.country &&
                                                Boolean(formik.errors.country)
                                            }
                                            helperText={
                                                formik.touched.country &&
                                                formik.errors.country
                                            }
                                            size="small"
                                            variant="standard"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </ThemeProvider>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            sx={{
                                                mt: 2,
                                                ml: 1,
                                                minWidth: "120px",
                                                bgcolor: "#016670",
                                                ":hover": {
                                                    bgcolor: "#02535B",
                                                    color: "white",
                                                },
                                            }}
                                            type="submit"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                ml: 1,
                                                mt: 2,
                                                minWidth: "100px",
                                                bgcolor: "#DC3545",
                                                ":hover": {
                                                    bgcolor: "#BB1E2D",
                                                    color: "white",
                                                },
                                            }}
                                            color="error"
                                            onClick={handleOpen}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Grid>

                            </Grid>
                            <Dialog open={open} onClose={handleClose} fullWidth>
                                <DialogTitle
                                    sx={{
                                        bgcolor: "error.main",
                                        color: "white",
                                        paddingBottom: "16px",
                                    }}
                                >
                                    Remove Address
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText sx={{ paddingTop: "16px" }}>
                                        Are you sure you want to remove this Address?
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button color="inherit" variant="contained" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="error" onClick={removeAddress}>
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>


                        </Box>
                        <ToastContainer />
                    </Box>
                </div>
            </div>
        </Container>
    );
}


export default EditAddress;
