const express = require('express');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
// const mysql = require('mysql');
const bodyParser = require('body-parser');
const joi = require('joi');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('./connection');

// const socketio = require('socket.io');

// Start App
const app = express();
const port = 3000;

db.authenticate()
.then(() => console.log('database connected....'))
.catch(err => console.log('Error:' + err));


app.use(bodyParser.urlencoded({ extended: false }))

// var urlencodedParser = bodyParser.urlencoded({extended: true});
// app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
// define routes
 app.use('/', require('./routes/auth'));
 app.use('/dashboard', require('./routes/dashboard'));

// app.use(app.router);
// routes.initialize(app);

// define controller
const auth = require('./controllers/auth');
const school = require('./controllers/school');
const faculty = require('./controllers/faculty');

auth(app);
school(app);
faculty(app);


app.listen(port, () => { 
    console.log(`App started at http://localhost:${port}`)
})