var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user);
});
 
passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new FacebookStrategy({
    clientID: "315783518831234", 
    clientSecret: "14d7a91722939b2a001a8763e6badca0", 
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
},
function(accessToken, refreshToken, profile, done) {
    UserModel.findOne({ username : "fb_" + profile.id }, function(err, user){
        if(!user){
            var regData = {
                username :  "fb_" + profile.id,
                password : "facebook_login",
                displayname : profile.displayName
            };
            var User = new UserModel(regData);
            User.save(function(err){ 
                done(null,regData);
            });
        } else {
            done(null,user);
        }

    });
}
));

router.get('/facebook', passport.authenticate('facebook', { scope: 'email'}) );

router.get('/facebook/callback',
   passport.authenticate('facebook', 
       { 
           successRedirect: '/',
           failureRedirect: '/accounts/login' 
       }
   )
);


module.exports = router;