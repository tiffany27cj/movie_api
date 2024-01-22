const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
    Nickname: String
  },
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  FirstName: {type: String, required: true},
  LastName: {type: String, required: true},
  Email: {type: String, required: true},
  Password: {type: String, required: true},
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;


//mongoimport --uri mongodb+srv://kissmo27:super4lare@myfirstdbs.nf3cspo.mongodb.net/myFlixDB --collection movies --type json --file ../exported_collections/myFlixMoviesDB.json
//mongoimport --uri mongodb+srv://kissmo27:super4lare@myfirstdbs.nf3cspo.mongodb.net/myFlixDB --collection users --type json --file ../exported_collections/myFlixUsersDB.json