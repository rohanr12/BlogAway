var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');
var assert = require('assert');
var mongo = require('mongodb').MongoClient;

var app = express();
var url = 'mongodb://127.0.0.1:27017/blog';

mongoose.connect(url);
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.set('view engine','ejs');

var blogSchema = new mongoose.Schema({
	title: String,
	body: String,
	image: String,
	created: {
		type: Date,
		default: Date.now,
	},
});

var Blog = mongoose.model("Blog", blogSchema);

//Redirect from root

app.get('/', function(req, res){
	res.redirect('/blogs');
})

//Index

app.get('/blogs', function(req, res){
	Blog.find({}, function(err, blogs){
		assert.equal(null, err);
		res.render('index',{blogs: blogs});
		
	});	
});

//New

app.get('/blogs/new', function(req, res){
	res.render('new');
});


//Create

app.post('/blogs', function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	req.body.blog.title = req.sanitize(req.body.blog.title);

	var formData = req.body.blog;
	Blog.create(formData, function(err, newBlog){
			console.log(newBlog);
			if(err){
				console.log(err);
				console.log('ERROR! Redirecting to form');
				res.render('new');
				alert('Error in DB. Hence redirected');

			}
			else{
				res.redirect('/blogs');
				console.log('Entry made sucessfully!');
			}
	});
});

//Show

app.get('/blogs/:id', function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
			console.log('Redirecting to /blogs');
			res.redirect('/blogs');
			alert('Error in DB. Hence redirected');
		}
		else{
			res.render('show', {blog: foundBlog});

		}
	});
});

//Edit

app.get('/blogs/:id/edit', function(req, res){
	Blog.findById(req.params.id, function(err, editblog){
		if(err){
			console.log(err);
			console.log('Redirecting to /blogs');
			res.redirect('/blogs');
			alert('Error in DB. Hence redirected');
		}
		else{
			res.render('edit', {blog: editblog});
		}
	});
});


//Update

app.put('/blogs/:id', function(req, res){
	req.body.blog.title = req.sanitize(req.body.blog.title);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
		if(err){
			console.log(err);
			console.log('Redirecting to /blogs');
			res.redirect('/blogs');
			alert('Error in DB. Hence redirected');
		}
		else{
			var redirectURL = '/blogs/'+ req.params.id;
			res.redirect(redirectURL);
		}
	});
});


//Delete

app.delete('/blogs/:id', function(req, res){

	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			console.log('Redirecting to /blogs');
			res.redirect('/blogs');
			alert('Error in DB. Hence redirected');
		}else{
			res.redirect('/blogs');
		}
	
	});
});





app.listen(3000, function(){
	console.log('Server has started');	
});
