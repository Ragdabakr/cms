var express = require('express');
var router = express.Router();
var Post = require('../../models/post');
var Comment = require('../../models/comment');
var User = require('../../models/user');
var async = require('async');
/* GET home page. */

// to make all links after admin direct to admin layout
router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "admin";
	next();
});



router.get("/" ,function(req,res){
	//see comment for logging user only by adding {user:req.user.id}
	Comment.find({user:req.user.id}).populate("user").exec(function(err,comments){
    res.render("admin/comments",{comments:comments});
   });
});


  router.post("/",function(req, res, next) {
   var postId = req.body.post_id;
    async.waterfall([
      function(callback) {
        var comment = new Comment();
        comment.user = req.user.id;
        comment.body = req.body.body;
        comment.save(function(err,comment) {
        	if(err) throw err;
          callback(err, comment);
         
        });
       
      },

      function(comment, callback) {
        Post.update(
          {
            _id: postId
          },{
            $push: { comments: comment._id }
          }, function(err, post) {
          	if(err){
          		console.log(err);
          	}
  
            req.flash("success_message","Your comment will reviewed to approve ");
            res.redirect('/single/'+postId);
          }
        )
      }
    ]);
  });


//delete comment from comments array in Post schema with removing its id (1)

 /*router.delete("/delete/:id",function(req, res, next) {
      Comment.remove({_id:req.params.id}).exec(function(err,comment){
      	 Post.findOneAndUpdate(
      	 	{comments:req.params.id},
      	 	{$pull:{comments:req.params.id}},function(err,data){
               if(err) throw err;
               res.redirect("/admin/comment");
      	 });

      });
});
*/

//delete comment from comments array in Post schema with removing its id way 2
router.delete('/delete/:id', function(req, res, next)  {
  const postId = req.body.post_id;
  async.waterfall([
    function(callback) {
    	//first i remove the comment 
      Comment.remove({ _id: req.params.id }, function(err, comment) {
        callback(err, comment);
      })
    },
    function(comment, callback) {
    	// second i update post and remove comment id from comments array in the post
      Post.update(
        {
          _id: postId
        },
        {
          $pull: { comments: req.params.id}
        }, function(err, count) {
            if(err) throw err;
               res.redirect("/admin/comment");
        }
      );
    }
  ]);
});


//Approve comment

router.post('/approve-comment',function (req, res){
    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}},function (err, result){
        if(err) return err;
        res.send(result);
    });
});
module.exports = router;