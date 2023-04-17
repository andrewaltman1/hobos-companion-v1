if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const port = process.env.PORT;
const path = require('path');
const ejsMate = require('ejs-mate');
const userRoutes = require('./routes/user');
const showRoutes = require('./routes/shows');
const songRoutes = require('./routes/songs');
const venueRoutes = require('./routes/venues');
const helmet = require('helmet');
const auth = require('./auth.js');
const view = require('./view.js');

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));
app.use('/public', express.static(path.resolve(__dirname, 'public')));

const scriptSrcUrls = [
  'https://api.mapbox.com/',
  'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.js',
];

const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://events.mapbox.com/',
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'default-src': "'self'",
      'base-uri': "'self'",
      'font-src': ["'self'", 'https:', 'data:'],
      'script-src': ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      'form-action': "'self'",
      'frame-ancestors': "'self'",
      'object-src': 'none',
      'worker-src': ['blob:'],
      'script-src-attr': 'none',
      'connect-src': ["'self'", ...connectSrcUrls],
      'style-src': ["'self'", 'https:', 'unsafe-inline'],
      'img-src': ["'self'", 'data:'],
      upgradeInsecureRequests: null,
    },
  })
);

app.use((req, res, next) => {
  if (req.headers['user-agent'] === 'ELB-HealthChecker/2.0') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(auth.expressSession, auth.initialize, auth.passportSession);

app.use((req, res, next) => {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

app.use('/', userRoutes);
app.use('/', showRoutes);
app.use('/', songRoutes);
app.use('/', venueRoutes);

app.all('*', (req, res, next) => {
  class ExpressError extends Error {
    constructor(message, statusCode) {
      super();
      this.message = message;
      this.statusCode = statusCode;
    }
  }
  next(new ExpressError('Page Not Found', 404));
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('simple-message', view.errorMessage(req, err));
});

app.listen(port, () => {
  console.log(`THC listening on port ${port}`);
});
