import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, Container } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { calculateTotalCost } from './bookingCost';
import { ToastContainer, toast } from "react-toastify";
import UserContext from '../contexts/UserContext';
import http from '../http';


const extraFeaturesOptions = {
  childBooster: 'Child Booster ($30)',
  insurance: 'Insurance ($10 per day)'
};

const AddBooking = () => {
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(null);
  const { id: selectedCarId } = useParams();
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/adminHome");
      }
    } else {
      navigate("/");
    }
  }, [user, navigate]);


  const [couponList, setCouponList] = useState([]);
  const [couponUsageList, setCouponUsageList] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [disc, setDisc] = useState(0)

  const formik = useFormik({
    initialValues: {
      startDate: '',
      endDate: '',
      extraFeatures: [],
      totalCost: 0,
      license: '',
      carmodel: '',
      location: '',
    },
    validationSchema: yup.object().shape({
      startDate: yup.string().required(' * Start Date is required'),
      endDate: yup.string().required('* End Date is required'),
    }),
    onSubmit: (values) => {
      console.log("Initial totalCost:", values.totalCost);
      // Calculate the total cost
      const updatedTotalCost = calculateTotalCost(values, selectedCar);
      formik.setFieldValue('totalCost', updatedTotalCost);

      navigate('/paymentform', {
        state: {
          formData: {
            startDate: values.startDate,
            endDate: values.endDate,
            totalCost: formik.values.totalCost,
            extraFeatures: values.extraFeatures,
            carModelNew: selectedCar?.carmodel || '',
            licenseNew: selectedCar?.license || '',
            locationNew: selectedCar?.location || '',
            imageFileNew: selectedCar?.imageFile || '',
            carId: values.carId,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            carId: values.carId,
            couponIdNew: selectedCouponId,
          },
          selectedCarId: selectedCarId,
        },
      });
      console.log("Final totalCost:", values.totalCost);
    },
  });

  useEffect(() => {
    http.get("/coupon").then((res) => {
      setCouponList(res.data);
    });
    http.get(`/couponusage`).then((res) => {
      setCouponUsageList(res.data);
    });
    if (selectedCarId) {
      http
        .get(`/car/${selectedCarId}`)
        .then((res) => {
          setSelectedCar(res.data); 
          formik.setValues({ ...formik.values, carmodel: res.data.carmodel, license: res.data.license, location: res.data.location });
        })
        .catch((error) => {
          console.error('Error fetching car details:', error);
        });
    }
  }, [selectedCarId]);


  useEffect(() => {
    // Calculate total cost whenever startDate, endDate, or extraFeatures change
    const updatedTotalCost = calculateTotalCost(formik.values, selectedCar, disc);
    formik.setFieldValue('totalCost', updatedTotalCost);
  }, [formik.values.startDate, formik.values.endDate, formik.values.extraFeatures, selectedCar]);

  // Add validation here
  function couponAdded() {
    for (var j in couponList) {
      if (couponList[j].couponCode === couponCode) {
        const discount = couponList[j].discount;
        setDisc(discount);
        recalculatetotalcost(discount); // Apply the discount here
        setSelectedCouponId(couponList[j].id);
        toast.success("Valid Coupon Applied");
        break;
      } else {
        setDisc(0);
        recalculatetotalcost(0);
      }
    }
  }

  function recalculatetotalcost(disc) {
    const updatedTotalCost = calculateTotalCost(formik.values, selectedCar, disc);
    formik.setFieldValue('totalCost', updatedTotalCost);
  }

  const handleExtrasChange = (event) => {
    const name = event.target.value; // Use target.value to get the name of the extra feature
    const isChecked = event.target.checked;

    formik.setFieldValue(
      'extraFeatures',
      isChecked
        ? [...formik.values.extraFeatures, name] // If checked, add the feature to the list
        : formik.values.extraFeatures.filter((feature) => feature !== name) // If unchecked, remove the feature from the list
    );
  };

  useEffect(() => {
    if (selectedCar) {
      formik.setValues({
        startDate: '',
        endDate: '',
        extraFeatures: [],
        totalCost: 0,
        license: selectedCar.license || '',
        carmodel: selectedCar.carmodel || '',
        location: selectedCar.location || '',
        carId: selectedCarId,
      });
    }
  }, [selectedCar]);

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '40px',
          marginBottom: '20px',
        }}
      >
        <Typography variant="h4" sx={{ my: 2, color: "#016670" }}>
          Booking Form
        </Typography>

        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <Box sx={{ flex: '1 1 40%', border: '1px solid #ccc', backgroundColor: '#f1f1f1', height: '250px', margin: '10px' }}>
            {selectedCar?.imageFile ? (
              <img src={`${import.meta.env.VITE_FILE_BASE_URL}${selectedCar.imageFile}`} alt="marketplace" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                No Image Available
              </Box>
            )}
          </Box>

          <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', padding: '0 20px' }}>
            <TextField
              fullWidth
              margin="normal"
              autoComplete="off"
              label="Car Model"
              name="carModel"
              value={selectedCar?.carmodel || ''}
              disabled
              size="small"
              sx={{ background: 'white' }}
            />
            <TextField
              fullWidth
              margin="normal"
              autoComplete="off"
              label="License Plate"
              name="license"
              value={selectedCar?.license || ''}
              disabled
              size="small"
              sx={{ background: 'white' }}
            />
            <TextField
              fullWidth
              margin="normal"
              autoComplete="off"
              label="Location"
              name="location"
              value={selectedCar?.location || ''}
              disabled
              size="small"
              sx={{ background: 'white' }}
            />

            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              autoComplete="off"
              label="Start Date"
              name="startDate"
              type="date"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              helperText={formik.touched.startDate && formik.errors.startDate}
              size="small"
              inputProps={{
                min: new Date() > new Date(selectedCar?.startdate) ? new Date().toISOString().split('T')[0] : selectedCar?.startdate,
                max: selectedCar?.enddate || '',
              }}

              sx={{ background: 'white' }}
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              autoComplete="off"
              label="End Date"
              name="endDate"
              type="date"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              helperText={formik.touched.endDate && formik.errors.endDate}
              size="small"
              inputProps={{
                min: formik.values.startDate
                  ? new Date(new Date(formik.values.startDate).getTime() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                  : '',
                max: selectedCar?.enddate || '',
              }}
              sx={{ background: 'white' }}
            />
            {Object.entries(extraFeaturesOptions).map(([value, label]) => (
              <FormControlLabel
                key={value}
                control={
                  <Checkbox
                    name="extraFeatures"
                    value={value}
                    checked={formik.values.extraFeatures.includes(value)}
                    onChange={handleExtrasChange}
                  />
                }
                label={label}
              />
            ))}

            <TextField
              fullWidth
              margin="normal"
              autoComplete="off"
              label="Coupon Code"
              name="couponCode"
              value={formik.values.couponCode}
              onChange={e => setCouponCode(e.target.value)}
              size="small"
              sx={{ background: 'white' }}
            />
            <Button variant="contained" sx={{
              bgcolor: "#016670",
              ":hover": {
                bgcolor: "#02535B",
                color: "white",
              }, marginTop: '10px' }} onClick={couponAdded}>
              Apply Coupon
            </Button>

            <TextField
              fullWidth
              margin="normal"
              autoComplete="off"
              label="Total Cost"
              name="totalCost"
              value={`$${formik.values.totalCost.toFixed(2)}`} 
              disabled
              size="small"
              sx={{ background: 'white' }}
            />
            <Box
              sx={{
                flex: '1 1 60%',
                display: 'flex',
                flexDirection: 'column',
                padding: '0 20px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px' }}>
                {/* Back button */}
                <Button
                  variant="contained"
                  onClick={() => navigate('/marketplace')}
                  sx={{
                    background: '#FFC107',
                    color: 'black',
                    ":hover": {
                      bgcolor: "#eab30e",
                      color: "white",
                    }}}
                >
                  Back
                </Button>
                <Button variant="contained" type="submit" sx={{
                  bgcolor: "#016670",
                  ":hover": {
                    bgcolor: "#02535B",
                    color: "white",
                  }, marginLeft: '8px' }}>
                  Proceed to Payment
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        <ToastContainer />
      </Box>
    </Container>
  );
};

export default AddBooking;
