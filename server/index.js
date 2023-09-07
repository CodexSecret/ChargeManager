const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Simple Route
app.get("/", (req, res) => {
    res.send("Welcome to the account pages.");
});

// Routes
const userRoute = require("./routes/user");
app.use("/user", userRoute);
const addressRoute = require("./routes/address");
app.use("/address", addressRoute);
const deletedusersRoute = require("./routes/deletedusers");
app.use("/deletedusers", deletedusersRoute);
const passwordresetRoute = require("./routes/passwordreset");
app.use("/passwordreset", passwordresetRoute);
const accnotifRoute = require("./routes/accnotif");
app.use("/accnotif", accnotifRoute);

const fileRoute = require("./routes/file");
app.use("/file", fileRoute);
const carRoute = require('./routes/car'); 
app.use("/car", carRoute);
const marketplaceRoute = require('./routes/marketplace'); 
app.use("/marketplace", marketplaceRoute);
const branchRoute = require('./routes/branch'); 
app.use("/branch", branchRoute);
const bookingRoute = require('./routes/booking');
app.use("/booking", bookingRoute);
const reviewRoute = require('./routes/review');
app.use("/review", reviewRoute);
const reviewreportRoute = require('./routes/reportreview');
app.use("/reportreview", reviewreportRoute);
const reportedreview = require('./routes/reportedreview');
app.use("/reportedreview", reportedreview);
const chatRoute = require('./routes/chat');
app.use("/chat", chatRoute);
const messageRoute = require('./routes/message');
app.use("/message", messageRoute);
const rewardredemption = require('./routes/rewardredemption');
app.use("/rewardredemption", rewardredemption);
const bookingemail = require('./routes/bookingemail');
app.use("/bookingemail", bookingemail);
// Coupon Route
const couponRoute = require('./routes/coupon');
app.use("/coupon", couponRoute);

// Reward Route
const rewardRoute = require('./routes/reward');
app.use("/reward", rewardRoute);

const couponUsageRoute = require('./routes/couponusage');
app.use("/couponusage", couponUsageRoute);


const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  // Handle incoming WebSocket connections
  ws.on('message', (message) => {
    // Broadcast the received message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const db = require('./models');
db.sequelize.sync({ alter: true }).then(() => {
    let port = process.env.APP_PORT;
    app.listen(port, () => {
        console.log(`⚡ Server running on http://localhost:${port}`);
    });
    server.listen(8080, () => {
      console.log('WebSocket server is listening on port 8080');
    });
});

