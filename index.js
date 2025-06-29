if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT;
const path = require("path");
const ejsMate = require("ejs-mate");
const userRoutes = require("./routes/user");
const showRoutes = require("./routes/shows");
const songRoutes = require("./routes/songs");
const venueRoutes = require("./routes/venues");
const helmet = require("helmet");
const auth = require("./auth.js");
const view = require("./view.js");
const { catchAsync } = require("./utils");

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));
app.use("/public", express.static(path.resolve(__dirname, "public")));

// optional debug logging
// app.use("/", (req, res, next) => {
//   console.log(`Path: ${req.path}`);
//   console.log(`Method: ${req.method}`);
//   console.log(`IP: ${req.ip}`);
//   console.log(`User-Agent: ${req.headers["user-agent"]}`);
//   console.log(`Query: ${JSON.stringify(req.query)}`);
//   console.log(`Headers: ${JSON.stringify(req.headers)}`);
//   next();
// });

app.use((req, res, next) => {
  if (
    req.headers["user-agent"].includes("Amazon-Route53-Health-Check-Service")
  ) {
    return res.sendStatus(200);
  } else {
    next();
  }
});

const scriptSrcUrls = [
  "https://api.mapbox.com/",
  "https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.js",
];

const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://events.mapbox.com/",
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": "'self'",
      "base-uri": "'self'",
      "font-src": ["'self'", "https:", "data:"],
      "script-src": ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      "form-action": "'self'",
      "frame-ancestors": "'self'",
      "object-src": "none",
      "worker-src": ["blob:"],
      "script-src-attr": "none",
      "connect-src": ["'self'", ...connectSrcUrls],
      "style-src": ["'self'", "https:", "unsafe-inline"],
      "img-src": ["'self'", "data:"],
      upgradeInsecureRequests: null,
    },
  }),
);

app.use(auth.expressSession, auth.initialize, auth.passportSession);

app.use((req, res, next) => {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

app.use("/", userRoutes);
app.use("/", showRoutes);
app.use("/", songRoutes);
app.use("/", venueRoutes);

app.all("*", (req, res, next) => {
  class ExpressError extends Error {
    constructor(message, statusCode) {
      super();
      this.message = message;
      this.statusCode = statusCode;
    }
  }
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  console.log("in error handler", err);
  if (req.app.get("env") === "production") {
    const prodErr = {
      statusCode: err.statusCode,
      message:
        err.statusCode === 404 ? "Page Not Found." : "Something went wrong.",
      stack: "",
    };
    return res.render("simple-message", view.errorMessage(req, prodErr));
  }
  // render the error page
  res.status(err.statusCode || 500);
  err.statusCode = err.statusCode || 500;
  res.render("simple-message", view.errorMessage(req, err));
});

app.listen(port, () => {
  console.log(`THC listening on port ${port}`);
});
