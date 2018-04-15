var express = require('express');
var router = express.Router();
var Post = require('../../models/post');
var Category = require('../../models/category');
var Comment = require('../../models/comment');

//helper upload
var {isEmpty , uploadDir } = require("../../helpers/upload-helper");



//to can delete file
var fs = require("fs");
var path = require("path");

/* GET home page. */

// to make all links after admin direct to admin layout
router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "admin";
	next();
});

router.get('/create', function(req, res, next) {
  Category.find({},function(err,categories){
   if(err) throw err;
  res.render('admin/posts/create',{categories:categories});
  });
});

router.post('/create', function(req, res, next) {
//validate form 

  let errors = [];
  if(!req.body.title){
  	errors.push({message:"Please add a title"});
  }
    if(!req.body.body){
  	errors.push({message:"Please add a descriptin"});
  }

  if(errors.length > 0){
  	res.render('admin/posts/create',{errors:errors})
  }else{

	let filename = "banner-33.jpg";

	if(!isEmpty(req.files)){
       let file = req.files.file;
       //Date.now() modify duplicate pic
       filename = Date.now() + '-' + file.name;

        file.mv('./public/uploads/' + filename, (err)=>{

            if(err) throw err;

        });

}
  let allowComments = true;

  if(req.body.allowComments){
  	allowComments = true;

  } else{
  	allowComments = false;
  }

	var post = new Post();
	post.title = req.body.title;
  post.user = req.user.id;
	post.status = req.body.status;
	post.body = req.body.body;
  post.category = req.body.category;
	post.file = filename;
	post.allowComments = allowComments;
	post.save(function (err,post){
		if (err){
			console.log(err);
		}
    console.log(post);
	req.flash('success_message','Post was created successfly')	;
    res.redirect('/admin/posts');
   }); 
  }
});


// find all posts
router.get('/', function(req, res, next) {
Post.find({}).populate("category").populate("comments").populate("User").exec(function(err,posts){
      if (err){
      	console.log(err);
      }
        res.render('admin/posts',{posts:posts});
   });
});

// find all posts
router.get('/my-posts', function(req, res, next) {
Post.find({user:req.user.id }).populate({path:"category",populate:{path:'user'}}).exec(function(err,posts){
      if (err){
        console.log(err);
      }
        res.render('admin/posts/my-posts',{posts:posts});
   });
});



//Edit post
router.get('/edit/:id', function(req, res, next) {
	Post.findOne({_id:req.params.id},function(err,post){
		if(err){
			console.log(err);
            }
		   res.render('admin/posts/edit',{post:post});		
	  });
   });

router.put('/edit/:id', function(req, res, next) {
    	Post.findOne({_id:req.params.id},function(err,post){
		if(err){
			console.log(err);
            }
         if(req.body.allowComments){
  	    allowComments = true;

          } else{
  	     allowComments = false;
           }

    post.title = req.body.title;
	post.status = req.body.status;
	post.body = req.body.body;
	post.allowComments = allowComments;


    if(!isEmpty(req.files)){
       let file = req.files.file;
       //Date.now() modify duplicate pic
       filename = Date.now() + '-' + file.name;
       post.file = filename;

        file.mv('./public/uploads/' + filename,function (err){

            if(err) throw err;

        });
     }

	post.save(function(post){
	req.flash('success_message','Post was edit successfly')	;	
    res.redirect('/admin/posts');

	  });
   });
});

// delete post with it is comment
router.delete('/delete/:id',function (req, res){
    Post.findOne({_id: req.params.id})
        .populate('comments')
        .exec(function(err,post){

                 if(!post.comments.length < 1){
                      post.comments.forEach(function(err,comment){
                      comment.remove();
                      });
                  }
                post.remove().exec(function(postRemoved){
                    req.flash('success_message', 'Post was successfully deleted');
                    res.redirect('/admin/posts');
                });

            });
     });






module.exports = router;