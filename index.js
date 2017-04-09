var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost:27017/rjobs');

var job = mongoose.model('Job', { 
	category: String,
	title: String,
	company: String,
	description: String,
	apply_url: String
});

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.post('/', function(req, res){
	job.find({title : { $regex : req.body.term.toLowerCase() } }, function(error, jobs){
		for(var i=0; i < jobs.length; i++){
			res.write('<h2>'+ jobs[i].title + '</h2> <br>' + jobs[i].company + '<p>' + jobs[i].category + '</p> <br> <a href="/job?id='+ jobs[i]._id+'">View</a>');
		}
	res.end();
	});
});

app.get('/', function(req, res){
	res.render('home');
});


app.get('/post', function(req, res){
	res.render('post');
});

app.post('/post', function(req, res){
	var Job = new job({
		company: req.body.company_name,
		title: req.body.job_title.toLowerCase(),
		description: req.body.job_description,
		apply_url: req.body.apply_url,
		category: req.body.category
	});
	Job.save(function(error, job){
		if(error) throw error;
			res.redirect('/job?id=' + job._id);
	});
});

app.get('/job', function(req, res){
	job.findOne({_id: req.query.id}, function(error, job){
		if(!job){
			res.render('job', {message: 'no jobs found', job: ''});
		}else if(job){
			res.render('job', {message: '', job: job});
		}else if(error){
			res.render('job', {message: 'error', job: ''});
		}
	});
});





app.listen(3000);