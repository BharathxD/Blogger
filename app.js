const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const flash = require('connect-flash');
const port = process.env.PORT || 3000;
const date = require(__dirname+'/public/js/date.js');
const app = express();

var post = mongoose.createConnection(
  'mongodb+srv://Bharath_xD:Saibharat%40123@cluster0.cgaoktp.mongodb.net/blogDB?retryWrites=true&w=majority'
);
var user = mongoose.createConnection(
  'mongodb+srv://Bharath_xD:Saibharat%40123@cluster0.cgaoktp.mongodb.net/userDB?retryWrites=true&w=majority'
);

app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    secret: 'Secret',
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID:
        '160599315944-c2b9g24bgp8mka1putls852rgivfm8jc.apps.googleusercontent.com',
      clientSecret: 
        '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',
      callbackURL: 
        'https://blogger-by-bharath.herokuapp.com/auth/google/compose',
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreate(
        { googleId: profile.id, username: profile.displayName },
        (err, user) => {
          return cb(err, user);
        }
      );
    }
  )
);
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.username = req.user.username;
  } else {
    res.locals.username = '';
  }
  res.locals.signinStatus = req.isAuthenticated();
  next();
});

// Mongoose Schema for posts

const postSchema = new Schema({
  title: String,
  author: String,
  content: String,
  timestamp: String,
});

// Mongoose Schema for user

const userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  username: String,
  posts: [postSchema],
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Post = post.model('Post', postSchema);
const User = user.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);
app.get(
  '/auth/google/compose',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/compose');
  }
);

app.get('/', (req, res) => {
  Post.find({}, (err, foundItems) => {
    res.render('home', {
      posts: foundItems,
    });
  });
});

app.get('/about', (req, res) => {
  res.locals.signinStatus = req.isAuthenticated();
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/myposts', (req, res) => {
  User.findById({ _id: req.user._id }, (err, foundUser) => {
    const storeFoundUser = foundUser.posts;
    if (!err) { 
        res.render('userPosts', {
          posts: storeFoundUser,
        });
    }
    else {
      console.log('Post not found');
    }
  });
});

/* Register Route */

app.route('/register') 
  .get((req, res) => { // GET
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('register');
  }
}).
post((req, res) => { // POST
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        req.flash('error', err.message);
        res.redirect('/register');
      } 
      else {
        passport.authenticate('local')(req, res, (err) => {
          if (!err) {
            res.redirect('/compose');
          } 
          else {
            console.log(err);
          }
        });
      }
    }
  );
});

/* Login Route */

app.route('/login') 
.get((req, res) => { // GET
  if (req.isAuthenticated()) {
    res.redirect('/');
  } 
  else {
    req.session.message = {
      type: 'danger',
      intro: 'Empty Fields',
      message: 'Restart',
    };
    res.render('login');
  }
})
.post((req, res) => { // POST
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local', {
        successFlash: 'Welcome!',
        successRedirect: '/compose',
        failureFlash: true,
        failureRedirect: '/login',
      })(req, res, (err) => {
        if (!err) {
          res.redirect('/compose');
        } else {
          console.log(err);
        }
      });
    }
  });
});

/* Compose Route */

app.route('/compose') 
.get((req, res) => { // GET
  if (req.isAuthenticated()) {
    res.render('compose');
  } 
  else {
    res.render('login');
  }
})
.post((req, res) => { // POST 
  User.findById(req.user.id, (err, foundUser) => {
  if (err) {
      console.log(err);
      res.redirect('/compose');
    } 
  else {
    const post = new Post({
    title: req.body.inputTitle,
    author: req.user.username,
    content: req.body.textAreaPost,
    timestamp: date,
      });
  foundUser.posts.push(post);
  foundUser.save();
  post.save((err) => {
    if (!err) {
      res.redirect('/');
    }
  });
}
});
});

/* Report Route */

app.route('/report')
.get((req, res) => {  // GET
  res.render('report');
})
.post((req, res) => { // POST 
  Post.findOneAndDelete({ author: req.body.reportAuthor }, (err, post) => {
    req.flash('success', 'We have recieved your report :D ');
    res.redirect('report');
  });
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } 
    else {
      res.redirect('/');
    }
  });
});

app.get('/posts/:name', (req, res) => {
  Post.findById({ _id: req.params.name }, (err, foundPost) => {
    if (!err) {
      res.render('post', {
        postTitle: foundPost.title,
        postContent: foundPost.content,
        postAuthor: foundPost.author,
        postTime: foundPost.timestamp,
      });
    } 
    else {
      console.log(err);
    }
  });
});

app.get('/delete/:name', (req, res) => {
  Post.findByIdAndRemove({ _id: req.params.name }, (err, foundPost) => {
    if (!err) {
      res.redirect('/');
    } 
    else {
      console.log(err);
    }
  });
});

app.listen(port, function () {
  console.log(
    'Express server started'
  );
});
