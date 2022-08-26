const express = require("express");
const app = express();
const router = express.Router();
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const { Pool } = require("pg");
const pgSession = require("connect-pg-simple")(session);
const crypto = require("crypto");
const { login, isAdmin, isLoggedIn } = require("../middleware");
const { catchAsync, toCamel } = require("../utils");
const Show = require("../models/show");
const User = require("../models/user");

const pool = new Pool({
  user: "andrewaltman",
  host: "localhost",
  database: "rre-shows",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
pool.connect();

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

app.use(express.urlencoded({ extended: true }));
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

        let user = new User(row.rows[0]);

        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          "sha256",
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (!crypto.timingSafeEqual(user.hashedPassword, hashedPassword)) {
              return cb(null, false, {
                message: "Incorrect email or password.",
              });
            }
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

router.get("/coming-soon", (req, res) => {
  res.render("coming-soon", { user: req.user });
});

// auth for new users is working but password funtionality needs to be implemented

// router.get("/signup", (req, res) => {
//   res.render("signup");
// });

// router.post("/signup", (req, res, next) => {
//   let salt = crypto.randomBytes(16);
//   crypto.pbkdf2(
//     req.body.password,
//     salt,
//     310000,
//     32,
//     "sha256",
//     function (err, hashedPassword) {
//       if (err) {
//         return next(err);
//       }
//       pool.query(
//         "INSERT INTO users (email, hashed_password, salt, encrypted_password, created_at, updated_at) VALUES ($1, $2, $3, $4, LOCALTIMESTAMP, LOCALTIMESTAMP)",
//         [req.body.email, hashedPassword, salt, "see hashed column"],
//         function (err) {
//           if (err) {
//             return next(err);
//           }
//           let user = {
//             id: this.lastID,
//             email: req.body.email,
//           };
//           req.login(user, function (err) {
//             if (err) {
//               return next(err);
//             }
//             res.redirect("/");
//           });
//         }
//       );
//     }
//   );
// });

// router.get("/login", (req, res) => {
//   res.render("login", { msg: res.locals.messages });
// });

// router.post(
//   "/login/password",
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureMessage: true,
//   }),
//   login
// );

// router.post("/logout", function (req, res, next) {
//   req.logout();
//   res.redirect("/");
// });

module.exports = router;
