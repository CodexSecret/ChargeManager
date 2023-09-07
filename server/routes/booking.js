const express = require('express');
const router = express.Router();
const { User, Booking, Car, Sequelize } = require('../models');
const yup = require("yup");
const { v4: uuidv4 } = require('uuid');
const { validateToken } = require('../middlewares/auth');

// Custom credit card number validator function using Luhn algorithm
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


router.post("/", validateToken, async (req, res) => {
  let data = req.body;

  data.bookingId = uuidv4();
  data.startDate = new Date(data.startDate);
  data.endDate = new Date(data.endDate);
  data.childBooster = data.extraFeatures.includes('childBooster') || null;
  data.insurance = data.extraFeatures.includes('insurance') || null;
  data.noExtras = data.extraFeatures.includes('noExtras') || null;
  data.location = data.locationNew;
  data.carModel = data.carModelNew;
  data.imageFile = data.imageFileNew;
  data.userId = req.user.id;
  data.name = data.userName;
  data.email = data.userEmail;
  data.couponId = data.couponIdNew;
  try {
    const car = await Car.findByPk(data.carId);

    if (!car) {
      res.status(404).json({ message: 'Car not found' });
      return;
    }

    data.carId = car.id;

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching car details.' });
    return;
  }

  let validationSchema = yup.object().shape({
    startDate: yup.date().required(),
    endDate: yup.date().required(),
    childBooster: yup.boolean().nullable(),
    insurance: yup.boolean().nullable(),
    noExtras: yup.boolean().nullable(),
    paymentName: yup.string().trim().required('Payment name is required'),
    paymentNumber: yup
      .string()
      .trim()
      .matches(/^\d+$/, 'Payment number must be a numeric string')
      .test('paymentNumber', 'Invalid card number', isValidCardNumber) // Use the custom validator function here
      .required('Payment number is required'),
    paymentCVV: yup
      .string()
      .trim()
      .matches(/^\d+$/, 'Payment CVV must be a numeric string')
      .required('Payment CVV is required'),
    expiryDate: yup.string().trim().required('Expiry date is required'),
  });

  try {
    await validationSchema.validate(data, { abortEarly: false, strict: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ errors: err.errors });
    return;
  }

  let result = await Booking.create(data);
  res.json(result);
});

router.get("/", async (req, res) => {
  let condition = {};
  let search = req.query.search;
  if (search) {
    condition[Sequelize.Op.or] = [
      { bookingId: { [Sequelize.Op.like]: `%${search}%` } },
      { childBooster: { [Sequelize.Op.like]: `%${search}%` } },
      { insurance: { [Sequelize.Op.like]: `%${search}%` } },
      { noExtras: { [Sequelize.Op.like]: `%${search}%` } },
      { carModelNew: { [Sequelize.Op.like]: `%${search}%` } },
      { licenseNew: { [Sequelize.Op.like]: `%${search}%` } },
      { locationNew: { [Sequelize.Op.like]: `%${search}%` } }
    ];
  }

  let list = await Booking.findAll({
    order: [['createdAt', 'DESC']],
    where: condition
  });
  res.json(list);
});

//to get the car ID, to display the carModel, location, license, and also price for bookingCost
//router.get("/getuser", validateToken, async (req, res) => {
//const user = await User.findByPk(req.user.id);

//res.json({
//id: user.id,
//name: user.name,
//email: user.email,
//username: user.username,
//password : user.password,
//imageFile : user.imageFile
//});
//});
//to get name, email to paste on payemntForm.jsx
router.get("/:id", validateToken, async (req, res) => {
  let id = req.params.id;

  try {
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: Car,
          attributes: ['carModel', 'location', 'license', 'imageFile'],
        },
      ],
    });

    // Check if booking not found
    if (!booking) {
      res.sendStatus(404);
      return;
    }
    try {
      const car = await Car.findByPk(data.carId);

      if (!car) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }


    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching car details.' });
      return;
    }

    const totalCost = calculateTotalCost(booking);
    const extraFeatures = calculateExtraFeatures(booking);

    res.json({
      booking,
      totalCost,
      extraFeatures,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching data.' });
  }
});


router.put("/:id", async (req, res) => {
  let id = req.params.id;

  try {
    let booking = await Booking.findByPk(id);

    if (!booking) {
      res.sendStatus(404);
      return;
    }

    await Booking.update({ isDeleted: true }, {
      where: { bookingId: id }
    });

    res.json({
      message: "Booking was soft deleted successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the booking.' });
  }
});

router.put("/updateHandleCode/:id", async (req, res) => {
  let id = req.params.id;

  try {
    let booking = await Booking.findByPk(id);

    if (!booking) {
      res.sendStatus(404);
      return;
    }

    // Update handleCode for past bookings
    if (new Date(booking.endDate) < new Date()) {
      await Booking.update({ handleCode: true }, {
        where: { bookingId: id }
      });

      res.json({
        message: "Handle code updated successfully for past booking."
      });
    } else {
      res.status(400).json({ message: "Handle code can only be updated for past bookings." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the booking.' });
  }
});

router.put("/updateHandleReward/:id", async (req, res) => {
  let id = req.params.id;

  try {
    // Fetch the booking by ID
    let booking = await Booking.findByPk(id);

    if (!booking) {
      res.sendStatus(404);
      return;
    }

    // Update handleReward for past bookings
    if (new Date(booking.endDate) < new Date()) {
      await Booking.update({ handleReward: true }, {
        where: { bookingId: id }
      });

      res.json({
        message: "Handle reward updated successfully for past booking."
      });

      // Now, add 1000 reward points to the user
      const user = await User.findByPk(booking.userId);
      if (user) {
        await User.update({ rewardPoints: user.rewardPoints + 1000 }, {
          where: { id: booking.userId }
        });
        console.log("Added 1000 reward points to the user.");
      }
    } else {
      res.status(400).json({ message: "Handle reward can only be updated for past bookings." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the booking.' });
  }
});




router.delete("/:id", async (req, res) => {
  let id = req.params.id;
  // Check if booking exists
  let booking = await Booking.findByPk(id);
  if (!booking) {
    res.sendStatus(404);
    return;
  }

  await Booking.update({ isDeleted: true }, {
    where: { bookingId: id }
  });

  res.json({
    message: "Booking was soft deleted successfully."
  });
});


module.exports = router;