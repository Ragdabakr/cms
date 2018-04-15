var express = require('express');
var router = express.Router();
var Post = require('../../models/post');
var Category = require('../../models/category');
var User = require('../../models/user');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
//for sending email
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
//helper upload
var {userAuth} = require("../../helpers/auth.js");

//for search
const algoliasearch = require ("algoliasearch");
var client = algoliasearch('V7OVKGFP9W', '6b6848b55ecec53cccf031373712e47c');
var index = client.initIndex('postSchema');




/* GET home page. */

// to make all links after admin direct to home layout
router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "layout";
	next();
});




//search


router.get('/search', function(req, res, next) {
if(req.query.q){
index.search(req.query.q,function(err,content){
      res.render('home/search' ,{content:content, search_result : req.query.q});
     });
   }
});

router.post('/search', function(req, res, next) {
  res.redirect('/search/?q=' + req.body.search_input);
});




//Contact form

router.get('/contact', function(req, res, next) {
  res.render('home/contact');
});


 
 // Send a contact form via Nodemailer.
 
router.post('/contact', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li><strong>Name: ${req.body.name}</strong></li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'ragdaaaaadel@gmail.com', // generated ethereal user
        pass: 'regorego1'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"blog contact" <ragdaaaaadel@gmail.com>', // sender address
      to: 'ragdabakr@yahoo.com', // list of receivers
      subject: 'blog Request', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.render('home/contact', {msg:'Email has been sent'});


 

  });
  });






//find all posts




router.get('/', (req, res)=>{


    const perPage = 2;
    const page = req.query.page || 1;


    Post.find({})

        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts =>{

        Post.count().then(postCount=>{

            Category.find({}).then(categories=>{

                res.render('home/index', {

                    posts: posts,
                    categories:categories,
                    current: parseInt(page),
                    pages: Math.ceil(postCount / perPage)


                });

            });


        });

    });

});

//find single post page

router.get('/single/:id', function(req, res, next) {
  // way to populate more than item
Post.findOne({_id:req.params.id}).populate({path:"comments",match:{approveComment:true}, populate:{path:'user'}}).exec(function(err,post){
    Category.find({},function(err,categories){
   if (err){console.log(err);  }
   res.render('home/single',{post:post,categories:categories});
    });
  });
}); 


router.get('/about', function(req, res, next) {
  res.render('home/about');
});

//Login 

router.get('/login', function(req, res, next) {
  res.render('home/login');
});

// APP LOGIN


passport.use(new LocalStrategy({usernameField: 'email'},function (email, password, done){

    User.findOne({email: email}).then(user=>{

        if(!user) return done(null, false, {message: 'No user found'});

        bcrypt.compare(password, user.password,function (err, matched){

            if(err) return err;


            if(matched){

                return done(null, user);

            } else {

                return done(null, false, { message: 'Incorrect password' });

            }

        });

    });

}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});



router.post('/login',function (req, res, next){


    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
     
    })(req, res, next);

});


//register

router.get('/register', function(req, res, next) {
  res.render('home/register');
});

router.post('/register', function(req, res, next) {

    let errors = [];


    if(!req.body.firstName) {

        errors.push({message: 'please enter your first name'});

    }


    if(!req.body.lastName) {

        errors.push({message: 'please add a last name'});

    }

    if(!req.body.email) {

        errors.push({message: 'please add an email'});

    }

    if(!req.body.password) {

        errors.push({message: 'please enter a password'});

    }


    if(!req.body.passwordConfirm) {

        errors.push({message: 'This field cannot be blank'});

    }


    if(req.body.password !== req.body.passwordConfirm) {

        errors.push({message: "Password fields don't match"});

    }


    if(errors.length > 0){

        res.render('home/register', {

            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,

        })

    } else {

    User.findOne({email:req.body.email},function(err,user){
         if(!user){

            var user = new User();
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.email = req.body.email;
  user.password = req.body.password;
  user.photo = user.gravatar();

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
       user.password = hash;

       user.save(function (err,user){
    if(err) throw err ;
    req.flash("success_message" , "You are registered, please login");
      res.redirect('/login');

       });

    });
  });

         }else{

                req.flash('error_message', 'That email exist please login');
                res.redirect('/login');

            }

        });
    }
});

//Logout

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});



//

router.get('/category/:id', function(req, res, next) {
  // way to populate more than item
Category.findOne({_id:req.params.id},function(err,category){
    Post.find({category:req.params.id},function(err,posts){
   if (err){console.log(err);  }
   res.render('home/category',{posts:posts,category:category});
    });
  });
}); 

module.exports = router;
