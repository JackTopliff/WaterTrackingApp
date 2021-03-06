const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Water = require("../models/water");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth.js");
const popup = require("node-popup");

router.get("/", (req, res) => {
  res.render("welcome");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/account", ensureAuthenticated, (req, res) => {
  User.findOne({ email: email }).exec((err, user) => {
    if (user) {
      global.goal = user.goal;
    } else {
      console.log("ERROR!");
    }
  });
  res.render("account");
});

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];
  console.log(" Name " + name + " Email " + email + " Password " + password);

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in every field" });
  }

  if (password != password2) {
    errors.push({ msg: "Make sure both passwords match" });
  }

  if (password.length < 8) {
    errors.push({
      msg: "Please make sure your password is at least 8 characters",
    });
  }
  console.log(errors);
  if (errors.length > 0) {
    res.render("register", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
    });
  } else {
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user);
      if (user) {
        errors.push({
          msg: "That email is already registered to another account.",
        });
        render(res, errors, name, email, password, password2);
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            newUser.password = hash;

            newUser
              .save()
              .then((value) => {
                console.log(value);
                req.flash("success_msg", "You have now been registered!");
                res.redirect("login");
                res.redirect("login");
              })
              .catch((value) => console.log(value));
          });
        });
      }
    });
  }
});

router.post("/addWater", ensureAuthenticated, (req, res, next) => {
  Water.findOne({ email: global.email })
    .sort({ date: -1 })
    .exec((err, result) => {
      result.waterConsumed =
        Number(result.waterConsumed) + Number(req.body.water);
      if (result.waterConsumed < 0) {
        result.waterConsumed = 0;
      }
      result.save().then(() => {
        res.redirect("/dashboard");
      });
    });
});

router.post("/setGoal", (req, res, next) => {
  Water.findOne({ email: global.email })
    .sort({ date: -1 })
    .exec((err, result) => {
      result.waterGoal = req.body.goal;
      global.currGoal = req.body.goal;

      result.save(function (err) {
        if (err) {
          console.error("ERROR!");
        }
      });
    });

  res.redirect("/dashboard");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  User.findOne({ email: global.email }).exec((err, user) => {
    if (user) {
      global.goal = user.goal;
    } else {
      console.log("ERROR!");
    }
  });

  Water.findOne({ email: global.email })
    .sort({ date: -1 })
    .exec((err, result) => {
      //Create a new entry for the user if they have a new account
      if (result == null) {
        Water.create({ waterGoal: 0, waterConsumed: 0, email: global.email });
        res.redirect("/dashboard");
      } else {
        //Get string of the result date
        var d = new Date(result.date);
        var mongoDay = d.getDate();
        var mongoMonth = d.getMonth() + 1; //Months are zero based
        var mongoYear = d.getFullYear();
        date1 = mongoDay + "-" + mongoMonth + "-" + mongoYear;

        //Get a string of the current date
        var currDate = new Date();
        var currDay = currDate.getDate();
        var currMonth = currDate.getMonth() + 1;
        var currYear = currDate.getFullYear();

        //Compare the two dates and create a new entry if one doesn't exist for the current day
        date2 = currDay + "-" + currMonth + "-" + currYear;

        //Create a new entry if one doesn't exist for the day
        if (date1 != date2) {
          Water.create({
            waterGoal: global.goal,
            waterConsumed: 0,
            email: global.email,
          });
          res.redirect("/dashboard");
        }
        global.user = req.user;

        res.render("dashboard", {
          user: req.user,
          waterConsumed: result.waterConsumed,
          waterGoal: result.waterGoal,
        });
      }
    });
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Logout successful");
  res.redirect("/login");
});

router.post("/changeWater", ensureAuthenticated, (req, res, next) => {
  User.findOne({ email: global.email }).exec((err, user) => {
    if (user && req.body.water != null) {
      user.goal = req.body.water;
      global.goal = user.goal;
      user.save();
    }
    res.redirect("/account");
  });
});

router.post("/changeName", ensureAuthenticated, (req, res, next) => {
  User.findOne({ email: global.email }).exec((err, user) => {
    if (user && req.body.name != null) {
      user.name = req.body.name;
      global.user.name = user.name;
      user.save();
    }
    res.redirect("/account");
  });
});

router.post("/changeEmail", ensureAuthenticated, (req, res, next) => {
  User.exists({ email: req.body.email }, function (err, user) {
    if (user) {
      console.log("this email is not available");
    } else {
      console.log("This email is available"); // false
      User.findOne({ email: global.email }).exec((err, user1) => {
        if (user1 && req.body.email != null) {
          user1.email = req.body.email;

          global.user.email = user1.email;
          user1.save();
          Water.updateMany(
            { email: global.email },
            { email: req.body.email },
            function (err, docs) {
              if (err) {
                console.log(err);
              } else {
                console.log("Updated Docs : ", docs);
              }
            }
          );
        }
      });
    }
    req.logout();
    req.flash("success_msg", "Email successfully changed!");
    res.redirect("/login");
  });
});
module.exports = router;
