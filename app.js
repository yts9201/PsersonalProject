var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log('mongodb connect');
});
var connect = mongoose.connect('mongodb://127.0.0.1:27017/shopping', {useMongoClient:true});
autoIncrement.initialize(connect);

var admin = require('./routes/admin');
var home = require('./routes/home');
var accounts = require('./routes/accounts');
var auth = require('./routes/auth');

var app = express();
var port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

app.use(session({
    secret : 'personal_project',
    resave : false,
    saveUninitialized : true,
    cookie: {
        maxAge : 2000*60*60
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req,res,next){
    app.locals.isLogin = req.isAuthenticated();
    next();
});

// Routing
app.use('/admin', admin);
app.use('/', home);
app.use('/accounts', accounts);
app.use('/auth', auth);

app.listen(port, function(){
    console.log('Express listening on port', port);
});