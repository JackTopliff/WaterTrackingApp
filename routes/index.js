const express = require('express');
const router = express.Router();
const User = require("../models/user");
const Water = require("../models/water");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth.js')

router.get('/', (req, res) => {
    res.render('welcome');
})

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    
    let errors = [];
    console.log(' Name ' + name + ' Email ' + email + ' Password ' + password);
    
    if(!name || !email || !password || !password2) {
        errors.push({msg :"Please fill in every field"});
    }

    if(password != password2) {
        errors.push({msg : "Make sure both passwords match"});
    }

    if(password.length < 8) {
        errors.push({msg : "Please make sure your password is at least 8 characters"});
    }
    console.log(errors);
    if(errors.length > 0) {
        res.render('register', {
            errors : errors,
            name : name,
            email : email,
            password : password,
            password2 : password2
        })
    }
    else {
        User.findOne({email : email}).exec((err,user) => {
            console.log(user);
            if(user) {
                errors.push({msg : 'email is already registered'});
                render(res,errors,name,email,password,password2);

            }
            else {
                const newUser = new User({
                    name : name,
                    email : email,
                    password : password
                });
                
                bcrypt.genSalt(10,(err,salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                            
                            newUser.password = hash;
                        
                        newUser.save()
                        .then((value) => {
                            console.log(value);
                            req.flash('success_msg', 'You have now been registered!')
                            res.redirect('login');
                        res.redirect('login');
                        })
                        .catch(value => console.log(value));
                    });
                    
                    })
                
                }
            }
        )}
    }
)

router.post('/login', (req, res, next) => {
    
    passport.authenticate('local',{
       successRedirect : '/dashboard',
       failureRedirect : '/login',
       failureFlash : true,     
    }) (req, res, next);
})
router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    console.log(global.email);
    //Water.create({ waterGoal: 120, waterConsumed: 0, email: 'j@j.com' });
    Water.findOne({email : global.email}).sort({ date: -1 }).exec((err,result) => {
        
        if(result) {
            //console.log(result.date.toISOString());
            var d = new Date(result.date);
            var mongoDay = d.getDate();
            var mongoMonth = d.getMonth() + 1; //Months are zero based
            var mongoYear = d.getFullYear();
            //console.log(mongoDay + "-" + mongoMonth + "-" + mongoYear);
            date1 = mongoDay + "-" + mongoMonth + "-" + mongoYear;

            var currDate = new Date();
            var currDay = currDate.getDate();
            var currMonth = currDate.getMonth() + 1;
            var currYear = currDate.getFullYear();
            //console.log(currDay + "-" + currMonth + "-" + currYear);
            date2 = currDay + "-" + currMonth + "-" + currYear;
            if(date1 != date1) {
                Water.create({ waterGoal: 0, waterConsumed: 0, email: global.email });
            }

        }
        else {
            Water.create({ waterGoal: 0, waterConsumed: 0, email: global.email });
        }
        
        
    })


    res.render('dashboard', {
        user: req.user
    });
})
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Successfully logged out');
    res.redirect('/login');
})

module.exports = router;