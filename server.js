'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;
const cors        = require('cors');
require('dotenv').config();

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');
const mongoose = require('mongoose');
const URI = process.env.MONGO_URI;
mongoose.set('strictQuery',false);

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

const Schema = mongoose.Schema
const issueSchema = new Schema({
  project_name: String,
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: {
    type: String,
    default: ""
  },
  status_text:  {
    type: String,
    default: ""
  },
  created_on: String,
  updated_on: String,
  open:  {
    type: Boolean,
    default: true
  }
});

const Issue = mongoose.model("Issue",issueSchema);

mongoose.connect(URI).then(console.log("Connected to db")).catch((e) => {
  console.log(e)
});
    
//Routing for API 
  apiRoutes(app,Issue); 

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; //for testing