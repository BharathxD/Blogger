var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var post = mongoose.createConnection(
    `mongodb+srv://Bharath_xD:${process.env.DB_PASS}@cluster0.cgaoktp.mongodb.net/blogDB?retryWrites=true&w=majority`
  );

const postSchema = new Schema({
    title: String,
    author: String,
    content: String,
    timestamp: String,
});
  
module.exports = post.model('Post', postSchema); 
