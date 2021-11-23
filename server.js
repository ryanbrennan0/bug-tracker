const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cookies = require("cookie-parser");

const dbAPI = require('./database.js');

const registerRoutes = require('./routes/registerRoutes');
const loginRoutes = require('./routes/loginRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// create http server to run app and listen on a port
var server = http.createServer(app);

// to use static files - css, images ...
app.use(express.static(path.join(__dirname, 'public')));
// to use request to get post information from forms
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookies())
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json())

// initialise db connection
var con = dbAPI.initialise();
dbAPI.connect(con);

// listen on port 8080
server.listen(8080, () => {
    console.log('listening on 8080');
});

// SETUP MIDDLEWARE
// use db connection in other modules
app.set('con', con);

// routing for logging in
app.use(loginRoutes);

// use routing for register user
app.use(registerRoutes);

// use routing for dashboard & its functionality
app.use(dashboardRoutes);