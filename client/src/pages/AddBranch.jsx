import React, {useContext, useEffect} from "react";
import { Box, Typography, TextField, Button, Container } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "../contexts/UserContext";

function AddBranch() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: yup.object().shape({
      nickname: yup
        .string()
        .trim()
        .min(3, "Nickname must be at least 3 characters")
        .max(100, "Nickname must be at most 100 characters")
        .required("Nickname is required"),
      address: yup
        .string()
        .trim()
        .min(3, "Address must be at least 3 characters")
        .max(500, "Address must be at most 500 characters")
        .required("Address is required"),
    }),
    onSubmit: (data) => {
      data.title = data.title.trim();
      data.description = data.description.trim();
      http
        .post("/branch", data)
        .then((res) => {
          console.log(res.data);
          navigate("/branch");
        })
        .catch(function (err) {
          console.log(err.response);
        });
    },
  });
  return (
    <Container>
      <Box>
        <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
          Add Branch
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            autoComplete="off"
            label="Nickname"
            name="nickname"
            value={formik.values.nickname}
            onChange={formik.handleChange}
            error={formik.touched.nickname && Boolean(formik.errors.nickname)}
            helperText={formik.touched.nickname && formik.errors.nickname}
          />
          <TextField
            fullWidth
            margin="normal"
            autoComplete="off"
            multiline
            minRows={2}
            label="Address"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" type="submit">
              Add
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default AddBranch;
