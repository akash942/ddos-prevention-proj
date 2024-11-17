const express = require("express");
const axios = require("axios");
const app = express();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const fs = require("fs");

// Use Helmet to secure HTTP headers
app.use(helmet());

// In-memory storage for blocked IPs
const blockedIPs = new Set();

// Middleware to block requests from blocked IPs
app.use((req, res, next) => {
  const clientIP = req.ip;
  if (blockedIPs.has(clientIP)) {
    return res.status(403).send("Your IP has been blocked due to suspicious activity.");
  }
  next();
});

// Middleware to log blocked IPs (optional for persistence)
function logBlockedIP(ip) {
  fs.appendFile("blocked-ips.log", `${ip}\n`, (err) => {
    if (err) console.error("Error logging blocked IP:", err);
  });
}

// Rate limiter with custom handler for excessive requests
const limiter = rateLimit({
  windowMs:  5 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  handler: (req, res) => {
    const clientIP = req.ip;
    blockedIPs.add(clientIP); // Block the IP
    logBlockedIP(clientIP); // Log the blocked IP
    res.status(429).send("Too many requests. Your IP has been blocked.");
  },
});

// Apply the rate limiter to all routes
app.use(limiter);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve the public folder as static files
app.use(express.static("public"));

// Render the index template with default values for weather and error
app.get("/", (req, res) => {
  res.render("index", { weather: null, error: null });
});

// Handle the /weather route
app.get("/weather", async (req, res) => {
  // Get the city from the query parameters
  const city = req.query.city;
  const apiKey = "ccd8c2b9c52d65bef216acd73449e3ba";
  console.log(city)
  // Add your logic here to fetch weather data from the API
  const APIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  let weather;
  let error = null;
  try {
    const response = await axios.get(APIUrl);
    weather = response.data;
    console.log("this")
    if(weather==null){
      error = "enter a correct city name!!!!"
    }
  } catch (err) {
    weather = null;
    error = "looks like you entered a wrong city name!!!";
  }
  console.log("erro: ",error)
  console.log("weather: ",weather)
  // Render the index template with the weather data and error message
  res.render("index", { weather, error });
});

// Start the server and listen on port 3000 or the value of the PORT environment variable
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
