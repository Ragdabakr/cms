var express = require('express');
var router = express.Router();
var Post = require('../../models/post');
var Category = require('../../models/category');
var Comment = require('../../models/comment');
var User = require('../../models/user');
//helper upload


/* GET home page. */

// to make all links after admin direct to admin layout
router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "admin";
	next();
});

//chart 
router.get('/', function(req, res, next) {
	Post.count({}).then(postCount =>{
		Comment.count({}).then(commentCount =>{
			Category.count({}).then(categoryCount =>{
					User.count({}).then(userCount =>{
		  res.render('admin/index',{postCount:postCount,commentCount :commentCount,categoryCount:categoryCount,
            userCount:userCount
		   });
        });
	 });
   });
 });
});	

router.get('/dashboard', function(req, res, next) {
  res.render('admin/dashboard');
});

module.exports = router;