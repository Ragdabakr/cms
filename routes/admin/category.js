var express = require('express');
var router = express.Router();
var Category = require('../../models/category');

/* GET home page. */

// to make all links after admin direct to admin layout
router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "admin";
	next();
});

router.get('/create', function(req, res, next) {
	Category.find({},function(err,categories){
		if(err) throw err;
	   res.render('admin/category/create',{categories:categories});	
	});  
});



router.post('/create', function(req, res, next) {

 let errors = [];
  if(!req.body.name){
  	errors.push({message:"Please add a category name"});
  }
    
  if(errors.length > 0){
  	res.render('admin/category/create',{errors:errors})
  }else{


	var category = new Category();
	category.name= req.body.name;
	category.save(function (err,category){
		if (err){
			console.log(err);
		}
	req.flash('success_message','Category was created successfly');
    res.redirect('/admin/category/create');
   }); 
  }

});


router.get('/edit/:id', function(req, res, next) {
	Category.findOne({_id:req.params.id},function(err,category){
		if(err) throw err;
	   res.render('admin/category/edit',{category:category});	
	});  
});

router.put('/edit/:id', function(req, res, next) {
Category.findOne({_id:req.params.id},function(err,category){
	category.name= req.body.name;
	category.save(function (err,category){
		if (err){console.log(err);}
	req.flash('success_message','Category was edited successfly');
    res.redirect('/admin/category/create');
    });  
  });
});

router.delete('/delete/:id', function(req, res, next) {
Category.findOne({_id:req.params.id},function(err,category){
	category.remove(function (err,category){
		if (err){console.log(err);}
	req.flash('success_message','Category was deleteted successfly');
    res.redirect('/admin/category/create');
    });  
  });
});


module.exports = router;