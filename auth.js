const db = require('./db.js');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const pgSession = require('connect-pg-simple')(session);
const User = require('./models/user');

const sessionConfig = {
  store: new pgSession({
    pool: db.pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};

module.exports.passport = passport;

module.exports.expressSession = session(sessionConfig);
module.exports.initialize = passport.initialize();
module.exports.passportSession = passport.session();

passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    db.pool.query(
      'SELECT id, email, is_admin, first_name, salt, hashed_password FROM users WHERE email = $1',
      [username],
      function (err, row) {
        if (err) {
          return cb(err);
        }
        if (!row.rows[0]) {
          return cb(null, false, {
            message: 'Incorrect email/password',
          });
        }

        crypto.pbkdf2(
          password,
          row.rows[0].salt,
          310000,
          32,
          'sha256',
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
                message: 'Incorrect email/password',
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

module.exports.crypto = (req, res, next) => {
  let salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    32,
    'sha256',
    function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      db.pool.query(
        'INSERT INTO users (email, hashed_password, salt, encrypted_password, created_at, updated_at) VALUES ($1, $2, $3, $4, LOCALTIMESTAMP, LOCALTIMESTAMP)',
        [req.body.username, hashedPassword, salt, 'see hashed column'],
        function (err) {
          if (err) {
            return next(err);
          }
          let user = new User(req.body);
          req.login(user, function (err) {
            if (err) {
              return next(err);
            }
            res.redirect('/');
          });
        }
      );
    }
  );
};

module.exports.authenticate = passport.authenticate('session');

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user.id,
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
