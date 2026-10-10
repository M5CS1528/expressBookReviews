const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customerRoutes = require("./router/auth_users.js").authenticated;
const generalRoutes = require("./router/general.js").general;
const JWT_SECRET = require("./router/auth_users.js").JWT_SECRET;

const app = express();
app.use(express.json());

app.use(
  "/customer",
  session({
    secret: process.env.SESSION_SECRET || "fingerprint_customer",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" }
  })
);

// Protect add/delete review endpoints. Accepts a session token or a Bearer token.
app.use("/customer/auth/*", (req, res, next) => {
  const sessionToken = req.session?.authorization?.accessToken;
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const token = sessionToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: "User not authenticated. Please log in." });
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    req.user = decoded;
    return next();
  });
});

app.use("/customer", customerRoutes);
app.use("/", generalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
