import React, { useState, useEffect, useContext } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Typography, Box, Button, Divider } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { FaCcMastercard, FaCcVisa, FaCcAmex } from 'react-icons/fa';
import UserContext from '../contexts/UserContext';
// import { calculateTotalCost } from './bookingCost'
// import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

//using the Luhn algorthim, it iterates over each digit of the card number from right to left. For every second digit (from the rightmost digit), the digit is doubled.
//If doubling the digit results in a number greater than 9, subtract 9 from it. Add up all the digits, including the ones that were not doubled. 
//After the loop, sum % 10 is calculated. If the result is 0, the credit card number is valid according to the Luhn algorithm. Otherwise, it's invalid.
function isValidCardNumber(cardNumber) {
  if (!/^\d+$/.test(cardNumber)) return false;

  let sum = 0;
  let shouldDouble = cardNumber.length % 2 === 0;

  for (let i = 0; i < cardNumber.length; i++) {
    let digit = parseInt(cardNumber.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
const expiryDateValidation = (value) => {
  if (!value) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last two digits of current year
  const currentMonth = currentDate.getMonth() + 1;

  const [month, year] = value.split('/');
  const isYearValid = year && parseInt(year) >= currentYear;
  const isMonthValid =
    month &&
    parseInt(month) >= 1 &&
    parseInt(month) <= 12 &&
    (isYearValid ? parseInt(year) > currentYear || parseInt(month) > currentMonth : true);

  return isYearValid && isMonthValid;
};

const paymentValidationSchema = yup.object().shape({
  paymentName: yup.string().required('Payment Name is required'),
  paymentNumber: yup
    .string()
    .trim()
    .matches(/^\d+$/, 'Card number must be a numeric string')
    .test('paymentNumber', 'Invalid card number', isValidCardNumber)
    .required('Card number is required')
    .min(16, 'Card number must have exactly 16 characters') // Add this validation
    .max(16, 'Card number must have exactly 16 characters'),
  paymentCVV: yup
    .string()
    .trim()
    .matches(/^\d+$/, 'Payment CVV must be a numeric string')
    .required('Payment CVV is required')
    .min(3, 'CVV must have exactly 3 characters') // Add this validation
    .max(3, 'CVV must have exactly 3 characters'),
    expiryDate: yup
    .string()
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in the format MM/YY')
    .test('expiryDate', 'Expiry date is invalid', expiryDateValidation)
    .required('Expiry date is required'),
});

  const handleNameInput = (event) => {
    const regex = /^[A-Za-z\s]+$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  };


  const PaymentForm = () => {
    const navigate = useNavigate();
    const routerLocation = useRouterLocation();
    const { formData, selectedCarId } = routerLocation.state ?? { formData: {}, selectedCarId: null };
    const { startDate, endDate, totalCost, extraFeatures, carModelNew, licenseNew, locationNew, imageFileNew, carId, userId, userName, userEmail, couponIdNew } = formData;
    const [cardNumberInput, setCardNumberInput] = useState('');
    const [cardIcon, setCardIcon] = useState(null);
    const { user: currentUser } = useContext(UserContext);
    useEffect(() => {
      if (currentUser) {
        if (currentUser.isAdmin) {
          navigate("/adminHome");
        }
      } else {
        navigate("/");
      }
    }, [currentUser, navigate]);


    console.log('formData:', formData); 

    const formik = useFormik({
      initialValues: {
        paymentName: '',
        paymentNumber: '',
        paymentCVV: '',
        expiryDate: '',
      },
      validationSchema: paymentValidationSchema,
      onSubmit: async (values) => {
        try {
          console.log('Submitting form data:', values); 

          const completeFormData = {
            ...values,
            startDate,
            endDate,
            totalCost,
            extraFeatures,
            carModelNew,
            licenseNew,
            locationNew,
            imageFileNew,
            carId,
            userName,
            userEmail,
            couponIdNew
          };
    
          console.log('Complete form data:', completeFormData); // Log the complete form data
    
          let response = null;
    
          try {
            console.log('Sending POST request to /booking');
            response = await http.post('/booking', completeFormData);
            console.log('Booking created:', response.data);
          } catch (error) {
            console.error('Error:', error);
          }
    
          if (response && response.status) {
            if (response.data.success && isValidCardNumber(values.paymentNumber)) {
              try {
                const bookingId = response.data.bookingId;
                navigate("/confirmation", {

                });
              } catch (error) {
                console.error("Error sending email:", error);
              }
            } else {
              navigate('/confirmation', {
                state: { errorMessage: 'An error occurred while processing your booking.' },
              });
            }
          } else {
            navigate('/confirmation', {
              state: { errorMessage: 'An error occurred while processing your booking.' },
            });
          }
        } catch (error) {
          console.error('Error:', error);
          navigate('/error', {
            state: { errorMessage: 'An error occurred while processing your booking.' },
          });
        }
      },
    });
    
    
const [expiryInput, setExpiryInput] = useState('');

const handleExpiryInputChange = (event) => {
  const { value, key } = event.target;

  const formattedValue = value.replace(/[^0-9]/g, '').slice(0, 4);

  if (key === 'Backspace' || key === 'Delete') {
    setExpiryInput(formattedValue);
    formik.setFieldValue('expiryDate', formattedValue);
    return;
  }

  if (formattedValue.length > 2) {
    const month = formattedValue.slice(0, 2);
    const year = formattedValue.slice(2);
    setExpiryInput(`${month}/${year}`);
    formik.setFieldValue('expiryDate', `${month}/${year}`);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last two digits of current year
    const currentMonth = currentDate.getMonth() + 1;

    const isYearValid = year && parseInt(year) >= currentYear;
    const isMonthValid =
      month &&
      parseInt(month) >= 1 &&
      parseInt(month) <= 12 &&
      (isYearValid ? parseInt(year) > currentYear || parseInt(month) > currentMonth : true);

    if (!isYearValid || !isMonthValid) {
      formik.setFieldError('expiryDate', 'Expiry date is invalid');
    } else {
      formik.setFieldError('expiryDate', '');
    }
  } else {
    setExpiryInput(formattedValue);
    formik.setFieldValue('expiryDate', formattedValue);
  }
};
const handleNumericInput = (event) => {
  const regex = /^\d+$/;
  const allowedKeys = ['Backspace', 'Delete']; 
  const { name, value, selectionStart } = event.target;
  const maxLength = name === 'paymentNumber' ? 20 : 3; 

  if (!regex.test(event.key) && !allowedKeys.includes(event.key)) {
    event.preventDefault();
  }

  if (value.length >= maxLength && !allowedKeys.includes(event.key)) {
    event.preventDefault();
  }

  let formattedValue = value.replace(/[^0-9]/g, '');

  if (name === 'paymentNumber') {
    updateCardIcon(formattedValue); // Update card icon for card number input
  }

  const caretPosition = selectionStart - (value.length - formattedValue.length);

  formik.setFieldValue(name, formattedValue);
  event.target.setSelectionRange(caretPosition, caretPosition);
};


const updateCardIcon = (inputValue) => {
  let icon = null;
  const numericValue = inputValue.replace(/\s/g, ''); // Remove spacing for icon detection

  if (numericValue.length >= 1) {
    if (numericValue.startsWith('4')) {
      icon = <FaCcVisa />;
    } else if (numericValue.startsWith('5')) {
      icon = <FaCcMastercard />;
    } else if (numericValue.startsWith('3')) {
      icon = <FaCcAmex />;
    }
  }

  setCardIcon(icon);
};


  
return (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      
    }}
  >
    <Typography variant="h5" sx={{ my: 2 }}>
      Payment Form
    </Typography>
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        padding: '16px', // Add padding to create the box around the form
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Add a box shadow for a card-like effect
        borderRadius: '8px', // Add border radius to round the corners
        backgroundColor: 'white', // Set the background color to white
      }}
    >
      <TextField
        fullWidth
        margin="normal"
        autoComplete="off"
        label="User Name"
        name="userName"
        value={userName}
        disabled
      />
      <TextField
        fullWidth
        margin="normal"
        autoComplete="off"
        label="User Email"
        name="userEmail"
        value={userEmail}
        disabled
      />
      <Divider sx={{ width: '100%', marginBottom: '16px' }} />
      <TextField
        fullWidth
        margin="normal"
        autoComplete="off"
        label="Cardholder Name"
        name="paymentName"
        value={formik.values.paymentName}
        onChange={formik.handleChange}
        error={formik.touched.paymentName && Boolean(formik.errors.paymentName)}
        helperText={formik.touched.paymentName && formik.errors.paymentName}
        // Set inputMode to "text" and pattern to allow only alphabets and spaces
        onKeyDown={handleNameInput}
      />
      <TextField
        fullWidth
        margin="normal"
        autoComplete="off"
        label="Card Number"
        name="paymentNumber"
        value={formik.values.paymentNumber}
        onChange={handleNumericInput}
        onKeyDown={handleNumericInput}
        error={formik.touched.paymentNumber && Boolean(formik.errors.paymentNumber)}
        helperText={formik.touched.paymentNumber && formik.errors.paymentNumber ? formik.errors.paymentNumber : ''}
        InputProps={{
          endAdornment: cardIcon, // Render the card icon as the end adornment
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        autoComplete="off"
        label="CVV"
        name="paymentCVV"
        value={formik.values.paymentCVV}
        onChange={formik.handleChange}
        error={formik.touched.paymentCVV && Boolean(formik.errors.paymentCVV)}
        helperText={formik.touched.paymentCVV && formik.errors.paymentCVV}
        // Set inputMode to "numeric" to show numeric keyboard on mobile devices
        onKeyDown={handleNumericInput}
      />
      <TextField
        fullWidth
        margin="normal"
        autoComplete="off"
        label="Expiry Date"
        name="expiryDate"
        value={expiryInput}
        onChange={handleExpiryInputChange}
        variant="outlined"
        error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
        helperText={formik.touched.expiryDate && formik.errors.expiryDate}
      />
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" type="submit" sx={{
          bgcolor: "#016670",
          ":hover": {
            bgcolor: "#02535B",
            color: "white",
          },
}}>
          Submit
        </Button>
      </Box>
    </Box>
  </Box>
);
};

export default PaymentForm;