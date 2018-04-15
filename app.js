var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var methodOverride = require("method-override");
var session = require('express-session');
var flash= require('connect-flash');
var{mongoDbUrl} = require("./config/database");
var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');


// upload files
var upload = require('express-fileupload');


// this way for displayeing nested schemas
// mongo connected
mongoose.Promise = global.Promise;
mongoose.connect(mongoDbUrl);
require('./models/post');
require('./models/comment');


var routes = require('./routes/home/index');
var admin = require('./routes/admin/index');
var posts = require('./routes/admin/posts');
var category = require('./routes/admin/category');
var comment = require('./routes/admin/comment');
var app = express();



process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});



const {select,GenerateTime,paginate} = require("./helpers/hbs-helpers")
// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', helpers:{select:select ,GenerateTime:GenerateTime,paginate:paginate}, extname: '.hbs'}));
app.set('view engine', '.hbs');


//upload midleware
app.use(upload());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret', 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

//methodOverride midleware
app.use(methodOverride('_method'));

app.use(session({
   secret: 'edwindiaz123ilovecoding',
    resave: true,
    saveUninitialized: true

}));
app.use(flash());

// PASSPORT

app.use(passport.initialize());
app.use(passport.session());




// Local Variables using Middleware


app.use(function(req, res, next){

    res.locals.user = req.user || null;

    res.locals.success_message = req.flash('success_message');
    res.locals.msg = req.flash('msg');

    res.locals.error_message = req.flash('error_message');

    res.locals.form_errors = req.flash('form_errors');

    res.locals.error = req.flash('error');
    

    next();


});



app.use('/', routes);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/category', category);
app.use('/admin/comment', comment);

app.use(function(req, res, next) {
    // IE9 doesn't set headers for cross-domain ajax requests
    if(typeof(req.headers['content-type']) === 'undefined'){
        req.headers['content-type'] = "application/json; charset=UTF-8";
    }
    next();
});





//deplying to heroku
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'),
  function(){
    console.log("Express server listening on port " + app.get('port'));
});


