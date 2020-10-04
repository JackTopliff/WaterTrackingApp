const express = require('express');
const router = express.Router();
const app = express();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');

const dbURI = 'mongodb+srv://Admin:Passpass1@reptracker.6jxyi.mongodb.net/RepTracker?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => console.log('connected'))
    .catch((err) => console.log(err));

    app.set('view engine', 'ejs');
    app.use(expressEjsLayout);

    app.use(express.urlencoded({extended: false}));

    app.use('/', require('./routes/index'));
    app.use('users', require('./routes/users'));

    app.listen(3000);