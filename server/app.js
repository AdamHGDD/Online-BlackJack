// Import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf');
const redis = require('redis');

// Get port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Get database
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/CardMaker';

// Create mongoose options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Set up mongoose with its options
mongoose.connect(dbURL, mongooseOptions, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// Set up redis
let redisURL = {
  // My hostname and port for local use
  hostname: 'redis-10684.c8.us-east-1-4.ec2.cloud.redislabs.com',
  port: '10684',
};

// My password for local use
let redisPass = '47C1HMcAHQLC2OvZ5rHHl4sh9hXtlCZG';
// Get heroku info if not local
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  [, redisPass] = redisURL.auth.split(':');
}
// Start connection to redis database
const redisClient = redis.createClient({
  host: redisURL.hostname,
  port: redisURL.port,
  password: redisPass,
});

// Pull in our routes
const router = require('./router.js');

// Set app up
const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
// Hide information
app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: 'Bippity Boppity',
  resave: true,
  saveUnitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

// Generates a unique token for each request and same session must match
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token');
  return false;
});

// Attach to router
router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
