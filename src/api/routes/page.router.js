require('../../auth/google');

const passport = require('passport');

const userController = require('../controllers/user.controller');

module.exports = function(routerx){

    routerx.get('/user/', function (req, res) {
        res.send('VNTHREAD USER API!');
    });

    //GOOGLE AUTHENTICATION
    routerx.get('/user/auth/google', passport.authenticate('google'));
    routerx.get('/user/oauth2/redirect/google', passport.authenticate('google', { failureRedirect: process.env.FAILED_URL_LOGIN, failureMessage: true, session: false }), userController.checkUserGoogle);

}