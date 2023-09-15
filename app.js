// jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
//const url = `mongodb+srv://zuhairajamt:${process.env.PASS}@todoapi.ythjapb.mongodb.net/todolistDB`;
const url = 'mongodb://localhost:27017/todolistDB';
mongoose.connect(url);

// Import routes
const indexRoutes = require('./routes/index');

// Use the routes
app.use('/', indexRoutes);

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
