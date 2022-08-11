var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

var user = mongoose.createConnection(
  `mongodb+srv://Bharath_xD:${process.env.DB_PASS}@cluster0.cgaoktp.mongodb.net/userDB?retryWrites=true&w=majority`
);

const postSchema = new Schema({
  title: String,
  author: String,
  content: String,
  timestamp: String,
});

const userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  username: String,
  posts: [postSchema],
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = user.model('User', userSchema);
