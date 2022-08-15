const passport = require("passport");
const User = require("../models/user_model");

const https = require("https");

async function newsletter(req) {
  const data = {
    members: [
      {
        email_address: req.body.username,
        status: "subscribed",
      },
    ],
  };
  var jsonData = JSON.stringify(data);
  var url = "https://us18.api.mailchimp.com/3.0/lists/4687ef1744";
  const options = {
    method: "POST",
    auth: `bharath1:${process.env.MAILCHIMP_API}-us18`,
  };
  const request = await https.request(url, options, (response) => {
    response.on("data", (data) => {
      console.log('success');
    });
  });
  request.write(jsonData);
  request.end();
}

const getRegister = (req, res) => {
  //* GET *//
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register");
  }
};

const postRegister = (req, res) => {
  //* POST *//
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, (err) => {
          if (!err) {
            if(req.body.newsletter === 'checked') {
            newsletter(req);
            }
            res.redirect("/compose");
          } else {
            console.log(err);
          }
        });
      }
    }
  );
};

module.exports = { getRegister, postRegister };
