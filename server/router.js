// Include
const controllers = require('./controllers');
const mid = require('./middleware');

// Define router
// If an account doesn't exist yet we need to make sure they're secure
// If on a logged in page make sure that they're supposed to be logged in
// If on any other page make sure that they aren't supposed to be logged in
const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getCards', mid.requiresLogin, controllers.Card.getCards);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresSecure, mid.requiresLogout, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Card.makerPage);
  // app.post('/maker', mid.requiresLogin, controllers.Card.make);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
