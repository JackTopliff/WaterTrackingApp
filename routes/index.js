const express = require('express');
const router = express.Router();
const User = require("../models/user");
const bcrypt = require('bcrypt');

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
                            console.log(value)
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

router.get('/login', (req, res) => {
    res.render('login');
})


module.exports = router;