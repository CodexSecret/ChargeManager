import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Input,
  IconButton,
  Radio,
  Button,
  TextField,
  TextareaAutosize,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  styled,
  Paper,
  Fab,
  Container
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { Link, useNavigate } from "react-router-dom";
import { MuiFileInput } from "mui-file-input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AspectRatio from "@mui/joy/AspectRatio";
import AddIcon from "@mui/icons-material/Add";
import UserContext from "../contexts/UserContext";

function AddRewards() {
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState(null);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const formik = useFormik({
    initialValues: {
      rewardName: "",
      rewardDetails: "",
      pointRequirement: "",
      expiryDate: "",
      url: "",
    },
    validationSchema: yup.object().shape({
      // thumbnail: yup.string().trim().required(),
      rewardName: yup
        .string()
        .trim()
        .min(1, "Reward names should be longer than 1 character")
        .max(50, "Reward names should be shorter than 50 characters")
        .required("This field is required"),
      pointRequirement: yup
        .number()
        .min(1, "Point requirement must be higher than 0")
        .max(100000, "Point requirement should be lower than 100000")
        .required("This field is required")
        .integer(),
      rewardDetails: yup
        .string()
        .trim()
        .min(1, "Reward details should be more than 1 character")
        .max(
          3000,
          "Please summarise your details to less than 3000 characters"
        )
        .required(),
      expiryDate: yup
        .date()
        .min(new Date(), "Expiry Date Must Be In The Future"),
      url: yup
        .string()
        .trim(),
    }),

    onSubmit: (data) => {
      console.log(data)
      if (thumbnail) {
        data.thumbnail = thumbnail;
      }
      data.rewardName = data.rewardName.trim();
      data.rewardDetails = data.rewardDetails.trim();
      data.url = data.url.trim();
      http.post("/reward", data).then((res) => {
        console.log(res.data);
        navigate("/adminrewards");
      });
    },
  });

  const onFileChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      if (file.size > 1048 * 1048 * 10) {
        toast.error("Maximum file size is 10MB");
        return;
      }
      let formData = new FormData();
      formData.append("file", file);
      http
        .post("/file/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setThumbnail(res.data.filename);
        })
        .catch(function (error) {
          console.log(error.response);
        });
    }
  };

  return (
    <Container>
      <Box>
      <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
        Create Reward
      </Typography>

      <Box component="form" onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            width: "auto",
            // height: "40vh",
            bgcolor: "#6CA6FF",
            borderRadius: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderBottom: "3px solid #000",
            p: "3vh",
          }}
        >
          <Box
            sx={{
              width: "95%",
              // height: "35vh",
              bgcolor: "#FBE180",
              borderRadius: "15px",
              borderBottom: "3px solid #000",
              p: "1vw",
              // display: "flex",
              // justifyContent: "center",
              // alignItems: "center",
            }}
          >
            {thumbnail && (
              <AspectRatio sx={{ mt: 2, borderRadius: "5px" }}>
                <Box
                  component="img"
                  alt="reward"
                  src={`${import.meta.env.VITE_FILE_BASE_URL}${thumbnail}`}
                ></Box>
              </AspectRatio>
            )}

            <Fab
              variant="extended"
              component="label"
              sx={{ mt: "1vw", bgcolor: "#FFF9C7" }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Upload A Thumbnail
              <input
                hidden
                accept="/*"
                multiple
                type="file"
                onChange={onFileChange}
              />
            </Fab>

            {/* <ToastContainer /> */}
          </Box>
        </Box>

        <Box
          sx={{
            width: "auto",
            // height: "55vh",
            bgcolor: "#6CA6FF",
            borderRadius: "20px",
            color: "white",
            p: "3vh",
            mt: "3vh",
            borderBottom: "3px solid #000",
          }}
        >
          <Grid container>
            <Grid item xs={8}>
              <Typography>Reward Name</Typography>
              <TextField
                margin="normal"
                label="Reward Name"
                name="rewardName"
                value={formik.values.rewardName}
                onChange={formik.handleChange}
                error={
                  formik.touched.rewardName && Boolean(formik.errors.rewardName)
                }
                helperText={
                  formik.touched.rewardName && formik.errors.rewardName
                }
                sx={{ width: "85%" }}
              />
            </Grid>
            <Grid item xs = {4}>
              <Typography variant="h3">
                Other Details
              </Typography>
            </Grid>
            <Grid item sx={{ mr: 2 }}>
              <Typography>Point Requirement</Typography>
              <TextField
                // fullWidth
                margin="normal"
                autoComplete="off"
                label="Point Requirement"
                name="pointRequirement"
                type="number"
                value={formik.values.pointRequirement}
                onChange={formik.handleChange}
                error={
                  formik.touched.pointRequirement &&
                  Boolean(formik.errors.pointRequirement)
                }
                helperText={
                  formik.touched.pointRequirement &&
                  formik.errors.pointRequirement
                }
              />
            </Grid>

            <Grid item xs={4}>
              <Typography sx={{ mb: 2 }}>Expiry Date</Typography>
              <TextField
                name="expiryDate"
                type="date"
                value={formik.values.expiryDate}
                onChange={formik.handleChange}
                error={
                  formik.touched.expiryDate && Boolean(formik.errors.expiryDate)
                }
                helperText={
                  formik.touched.expiryDate && formik.errors.expiryDate
                }
              />
            </Grid>

            <Grid item xs={8}>
              <Typography>Related URL</Typography>
              <TextField
                margin="normal"
                label="Related URL"
                name="url"
                value={formik.values.url}
                onChange={formik.handleChange}
                error={
                  formik.touched.url && Boolean(formik.errors.url)
                }
                helperText={
                  formik.touched.url && formik.errors.url
                }
                sx={{ width: "85%" }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography>Reward Details</Typography>
              <TextField
                fullWidth
                margin="normal"
                multiline
                minRows={4}
                label="Reward Details"
                name="rewardDetails"
                value={formik.values.rewardDetails}
                onChange={formik.handleChange}
                error={
                  formik.touched.rewardDetails &&
                  Boolean(formik.errors.rewardDetails)
                }
                helperText={
                  formik.touched.rewardDetails && formik.errors.rewardDetails
                }
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 2 }}>
          <Link to={`/adminrewards`}>
            <Button variant="outlined" color="warning">
              Back
            </Button>
          </Link>
          <Button variant="contained" type="submit" color="success" sx={{ ml: 2 }}>
            Add
          </Button>
        </Box>
      </Box>
      <ToastContainer />
    </Box>
    </Container>
  );
}

export default AddRewards;
