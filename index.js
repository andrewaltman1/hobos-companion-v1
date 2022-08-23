if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const { catchAsync, toCamel } = require("./utils");
const ejsMate = require("ejs-mate");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const {
  makeGeoJSON,
  updateAllVenueGeom,
  isAdmin,
  isLoggedIn,
} = require("./middleware");
const { Pool } = require("pg");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");
const pgSession = require("connect-pg-simple")(session);
// const res = require("express/lib/response");
const userRoutes = require("./routes/user");
const showRoutes = require("./routes/shows");
const songRoutes = require("./routes/songs");
const venueRoutes = require("./routes/venues");
const helmet = require("helmet");
const User = require("./models/user");

const pool = new Pool({
  user: "andrewaltman",
  host: "localhost",
  database: "rre-shows",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
pool.connect();

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(path.join(__dirname, "public")));
const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: "session",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};

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
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      "worker-src": ["blob:"],
      "connect-src": ["'self'", ...connectSrcUrls],
    },
  })
);
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(function verify(email, password, cb) {
    pool.query(
      "SELECT email, is_admin, first_name, salt, hashed_password FROM users WHERE email = $1",
      [email],
      function (err, row) {
        if (err) {
          return cb(err);
        }
        if (!row.rows[0]) {
          return cb(null, false, {
            message: "Incorrect email or password.",
          });
        }

        crypto.pbkdf2(
          password,
          row.rows[0].salt,
          310000,
          32,
          "sha256",
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (
              !crypto.timingSafeEqual(
                row.rows[0].hashed_password,
                hashedPassword
              )
            ) {
              return cb(null, false, {
                message: "Incorrect email or password.",
              });
            }
            let user = new User(row.rows[0]);
            return cb(null, user);
          }
        );
      }
    );
  })
);

app.use(passport.authenticate("session"));

app.use(function (req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      email: user.email,
      admin: user.admin,
      firstName: user.firstName,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
